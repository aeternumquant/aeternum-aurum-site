import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mercator } from "@visx/geo";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection } from "geojson";
import brUfTopo from "./geo/br-uf.topo.json";
import { supabase } from "../../lib/supabase";
import { useEntitlements } from "../../hooks/useEntitlements";
import { LAYERS, type LayerConfig } from "./layers";

/**
 * <BrazilMap/> — o Terminal-BR. Mapa por ESTADO (público); clique carrega os
 * municípios da UF (import dinâmico) e mostra a camada ativa. A DEGRADAÇÃO é no
 * servidor: o agregado (aggFn) é público; o valor por município (detailFn) só
 * volta para 'terminal'+ (a função devolve vazio para o resto).
 *
 * O que é mostrado vem da camada ativa (LayerConfig) — trocar/adicionar camada é
 * config, não código. Tokens: fundo #08090c, dourado #c6a75c, texto #e5e5e5.
 */
const GOLD = "#c6a75c";
const W = 640, H = 520;

const UF: Record<string, { sigla: string; nome: string }> = {
  "11": { sigla: "RO", nome: "Rondônia" }, "12": { sigla: "AC", nome: "Acre" }, "13": { sigla: "AM", nome: "Amazonas" },
  "14": { sigla: "RR", nome: "Roraima" }, "15": { sigla: "PA", nome: "Pará" }, "16": { sigla: "AP", nome: "Amapá" },
  "17": { sigla: "TO", nome: "Tocantins" }, "21": { sigla: "MA", nome: "Maranhão" }, "22": { sigla: "PI", nome: "Piauí" },
  "23": { sigla: "CE", nome: "Ceará" }, "24": { sigla: "RN", nome: "Rio Grande do Norte" }, "25": { sigla: "PB", nome: "Paraíba" },
  "26": { sigla: "PE", nome: "Pernambuco" }, "27": { sigla: "AL", nome: "Alagoas" }, "28": { sigla: "SE", nome: "Sergipe" },
  "29": { sigla: "BA", nome: "Bahia" }, "31": { sigla: "MG", nome: "Minas Gerais" }, "32": { sigla: "ES", nome: "Espírito Santo" },
  "33": { sigla: "RJ", nome: "Rio de Janeiro" }, "35": { sigla: "SP", nome: "São Paulo" }, "41": { sigla: "PR", nome: "Paraná" },
  "42": { sigla: "SC", nome: "Santa Catarina" }, "43": { sigla: "RS", nome: "Rio Grande do Sul" }, "50": { sigla: "MS", nome: "Mato Grosso do Sul" },
  "51": { sigla: "MT", nome: "Mato Grosso" }, "52": { sigla: "GO", nome: "Goiás" }, "53": { sigla: "DF", nome: "Distrito Federal" },
};

const brUf = topojson.feature(brUfTopo as unknown as Topology, (brUfTopo as any).objects["br-uf"]) as unknown as FeatureCollection;
const defaultsFor = (layer: LayerConfig): Record<string, string> =>
  Object.fromEntries(layer.params.map((p) => [p.key, p.options[0].value]));

type Summary = { cultura: string; n_municipios: number; janela20_avg: number };

function Select({ value, onChange, options, aria }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; aria: string }) {
  return (
    <select
      aria-label={aria}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent text-[11px] tracking-wide py-1 pl-1 pr-4 focus:outline-none cursor-pointer"
      style={{ color: "#e5e5e5", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 2 }}
    >
      {options.map((o) => <option key={o.value} value={o.value} style={{ background: "#08090c" }}>{o.label}</option>)}
    </select>
  );
}

export default function BrazilMap() {
  const { isPaid } = useEntitlements();
  const [layerKey, setLayerKey] = useState(LAYERS[0].key);
  const layer = useMemo(() => LAYERS.find((l) => l.key === layerKey) ?? LAYERS[0], [layerKey]);
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => defaultsFor(LAYERS[0]));
  const paramsKey = JSON.stringify(paramValues);

  const [uf, setUf] = useState<string | null>(null);
  const [munFc, setMunFc] = useState<FeatureCollection | null>(null);
  const [agg, setAgg] = useState<Record<string, any> | null>(null);
  const [detail, setDetail] = useState<Map<string, Record<string, any>>>(new Map());
  const [pub, setPub] = useState<Map<string, { municipio: string; bucket: number | null }>>(new Map());
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); // re-busca por troca de cultura/manejo (loading do item 1)
  const [status, setStatus] = useState<"idle" | "loading" | "nodata" | "ready">("idle");
  const [hover, setHover] = useState<{ name: string; value?: number; summary?: Summary[]; loadingSummary?: boolean; x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const resumoCache = useRef<Map<string, Summary[]>>(new Map());
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onLayer = (k: string) => { setLayerKey(k); const l = LAYERS.find((x) => x.key === k); if (l) setParamValues(defaultsFor(l)); };
  const onParam = (key: string, value: string) => setParamValues((p) => ({ ...p, [key]: value }));

  // geometria: só depende da UF (params/camada não a mudam)
  const openUf = useCallback(async (code: string) => {
    setUf(code); setHover(null); setMunFc(null); setAgg(null); setDetail(new Map()); setPub(new Map()); setSelected(null);
    const info = UF[code];
    if (!info) { setStatus("nodata"); return; }
    const sig = info.sigla.toLowerCase();
    setStatus("loading");
    try {
      // Vite trata como glob import: cada ./geo/<uf>-mun.topo.json vira um chunk.
      const topo = (await import(`./geo/${sig}-mun.topo.json`)).default as unknown as Topology;
      setMunFc(topojson.feature(topo, (topo as any).objects[`${sig}-mun`]) as unknown as FeatureCollection);
      setStatus("ready");
    } catch { setStatus("nodata"); }
  }, []);

  // AGREGADO (público): re-busca ao mudar UF, camada ou parâmetros
  useEffect(() => {
    const sig = uf ? UF[uf]?.sigla : null;
    if (!sig || !supabase) { setAgg(null); return; }
    let alive = true;
    supabase.rpc(layer.aggFn, layer.toArgs(sig, paramValues)).then(({ data }) => {
      if (alive) setAgg(Array.isArray(data) ? data[0] : data);
    });
    return () => { alive = false; };
  }, [uf, layer, paramsKey]);

  // PÚBLICO (nome + bucket): para TODOS. O nome é do IBGE (público) e o bucket é
  // derivado — 2 tons, NUNCA o número (a mediana que os define fica no servidor).
  // Re-busca ao mudar UF, camada ou parâmetros.
  useEffect(() => {
    const sig = uf ? UF[uf]?.sigla : null;
    setSelected(null);
    if (!sig || !supabase) { setPub(new Map()); setBusy(false); return; }
    let alive = true; setBusy(true);
    supabase.rpc(layer.publicFn, layer.toArgs(sig, paramValues)).then(({ data }) => {
      if (!alive) return;
      const m = new Map<string, { municipio: string; bucket: number | null }>();
      for (const row of (data ?? []) as Record<string, any>[]) m.set(row.geocodigo, { municipio: row.municipio, bucket: row.bucket });
      setPub(m); setBusy(false);
    });
    return () => { alive = false; };
  }, [uf, layer, paramsKey]);

  // DETALHE (o VALOR): só o assinante busca; num effect para não depender do
  // timing do plano. Re-busca ao mudar UF, plano, camada ou parâmetros. A gate
  // real é o servidor (detailFn devolve vazio para quem não é assinante).
  useEffect(() => {
    const sig = uf ? UF[uf]?.sigla : null;
    if (!sig || !isPaid || !supabase) { setDetail(new Map()); return; }
    let alive = true;
    supabase.rpc(layer.detailFn, layer.toArgs(sig, paramValues)).then(({ data }) => {
      if (!alive) return;
      const m = new Map<string, Record<string, any>>();
      for (const row of (data ?? []) as Record<string, any>[]) m.set(row.geocodigo, row);
      setDetail(m);
    });
    return () => { alive = false; };
  }, [uf, isPaid, layer, paramsKey]);

  const back = useCallback(() => { setUf(null); setStatus("idle"); setHover(null); setMunFc(null); setAgg(null); setDetail(new Map()); setPub(new Map()); setSelected(null); }, []);

  const colorFor = useCallback((geocodigo: string) => {
    // SEM ZONEAMENTO da cultura ativa neste estado -> neutro (cinza), distinto do
    // dourado de "tem dado". É fato do país (ex.: trigo em GO), não falha nossa.
    if (agg && agg[layer.aggN] === 0) return "rgba(150,152,162,0.06)";
    // ASSINANTE: gradiente pelo valor real (de detail).
    const row = detail.get(geocodigo);
    if (row && agg) {
      const mn = agg[layer.aggMin], mx = agg[layer.aggMax], v = row[layer.valueKey];
      const t = mx > mn ? (v - mn) / (mx - mn) : 1;
      return `rgba(198,167,92,${(0.22 + t * 0.72).toFixed(2)})`;
    }
    // FREE: 2 tons pelo bucket (sem o valor). null/ausente -> uniforme.
    const bucket = pub.get(geocodigo)?.bucket;
    if (bucket === 2) return "rgba(198,167,92,0.30)";
    if (bucket === 1) return "rgba(198,167,92,0.13)";
    return "rgba(198,167,92,0.07)";
  }, [detail, agg, layer, pub]);

  const onMove = (e: React.MouseEvent) => {
    if (!hover) return;
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) setHover((h) => (h ? { ...h, x: e.clientX - r.left, y: e.clientY - r.top } : h));
  };

  const culturaLabel = useMemo(() => {
    const opts = layer.params.find((p) => p.key === "cultura")?.options ?? [];
    return (v: string) => opts.find((o) => o.value === v)?.label ?? v;
  }, [layer]);

  // hover no ESTADO (mapa do Brasil) -> resumo das culturas presentes. debounce
  // 200ms (não dispara ao atravessar) + cache por UF/manejo (2º hover instantâneo)
  // + "carregando…" (o nome aparece na hora; as culturas preenchem depois).
  const onStateHover = useCallback((e: React.MouseEvent, code: string) => {
    const st = UF[code]; if (!st) return;
    const r = wrapRef.current?.getBoundingClientRect();
    const x = r ? e.clientX - r.left : 0, y = r ? e.clientY - r.top : 0;
    const key = `${st.sigla}|${paramValues.manejo}`;
    const cached = resumoCache.current.get(key);
    setHover({ name: st.nome, x, y, summary: cached });
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (!cached && supabase) {
      hoverTimer.current = setTimeout(async () => {
        setHover((h) => (h && h.name === st.nome ? { ...h, loadingSummary: true } : h));
        const { data } = await supabase!.rpc(layer.summaryFn, layer.summaryArgs(st.sigla, paramValues));
        const arr = (data ?? []) as Summary[];
        resumoCache.current.set(key, arr);
        setHover((h) => (h && h.name === st.nome ? { ...h, summary: arr, loadingSummary: false } : h));
      }, 200);
    }
  }, [layer, paramValues]);
  const onStateLeave = useCallback(() => { if (hoverTimer.current) clearTimeout(hoverTimer.current); setHover(null); }, []);

  const info = uf ? UF[uf] : null;
  const n = agg ? (agg[layer.aggN] as number) : null;

  return (
    <div ref={wrapRef} data-testid="brazilmap" className="relative w-full max-w-2xl" style={{ background: "#08090c" }} onMouseMove={onMove}>
      {/* BARRA DE CONTROLE (genérica pela camada ativa) */}
      <div className="flex flex-wrap items-center gap-2 px-4 pt-3 pb-2" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
        <Select aria="Camada" value={layerKey} onChange={onLayer} options={LAYERS.map((l) => ({ value: l.key, label: l.label }))} />
        {layer.params.map((p) => (
          <Select key={p.key} aria={p.label} value={paramValues[p.key]} onChange={(v) => onParam(p.key, v)} options={p.options} />
        ))}
      </div>

      {layer.manejoHint(paramValues) && (
        <p className="px-4 pt-1.5 text-[10px] leading-snug" style={{ color: `${GOLD}bb` }}>{layer.manejoHint(paramValues)}</p>
      )}

      {/* subtítulo (muda com o seletor) + voltar */}
      <div className="flex items-baseline justify-between px-4 pt-2 pb-1">
        <div>
          <h3 className="font-display text-sm uppercase tracking-[0.22em]" style={{ color: "#e5e5e5" }}>{info ? info.nome : "Brasil"}</h3>
          <p className="text-[10px] tracking-widest uppercase" style={{ color: `${GOLD}aa` }}>
            {layer.subtitle(paramValues)}
            {busy && <span className="ml-2 animate-pulse" style={{ color: GOLD }}>atualizando…</span>}
          </p>
        </div>
        {uf && (
          <button onClick={back} className="text-[10px] uppercase tracking-widest transition-colors" style={{ color: `${GOLD}b0` }}>← estados</button>
        )}
      </div>

      {/* mapa */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ opacity: busy ? 0.45 : 1, transition: "opacity 0.15s" }} role="img" aria-label={info ? `Municípios de ${info.nome}` : "Estados do Brasil"}>
        {uf === null ? (
          <Mercator data={brUf.features} fitSize={[[W, H], brUf as any]}>
            {(m) => (
              <g>
                {m.features.map(({ feature, path }, i) => {
                  const code = String((feature as any).id);
                  const hasData = !!UF[code];
                  return (
                    <path
                      key={i}
                      data-uf={code}
                      d={path || ""}
                      fill={hasData ? "rgba(198,167,92,0.16)" : "rgba(229,229,229,0.04)"}
                      stroke="rgba(229,229,229,0.22)"
                      strokeWidth={0.5}
                      style={{ cursor: "pointer" }}
                      onClick={() => openUf(code)}
                      onMouseEnter={(e) => onStateHover(e, code)}
                      onMouseLeave={onStateLeave}
                    />
                  );
                })}
              </g>
            )}
          </Mercator>
        ) : status === "loading" ? (
          <text x={W / 2} y={H / 2} textAnchor="middle" style={{ fontFamily: "monospace", fontSize: 12, fill: GOLD }}>carregando municípios…</text>
        ) : status === "nodata" ? (
          <text x={W / 2} y={H / 2} textAnchor="middle" style={{ fontFamily: "monospace", fontSize: 12, fill: "rgba(229,229,229,0.5)" }}>não foi possível carregar</text>
        ) : munFc ? (
          <Mercator data={munFc.features} fitSize={[[W, H], munFc as any]}>
            {(m) => (
              <g>
                {m.features.map(({ feature, path }, i) => {
                  const geo = String((feature as any).id);
                  const row = detail.get(geo);
                  const nome = pub.get(geo)?.municipio ?? "";   // nome público (IBGE), para todos
                  return (
                    <path
                      key={i}
                      d={path || ""}
                      fill={colorFor(geo)}
                      stroke={geo === selected ? GOLD : n === 0 ? "rgba(229,229,229,0.28)" : "rgba(229,229,229,0.16)"}
                      strokeWidth={geo === selected ? 0.8 : 0.35}
                      strokeDasharray={n === 0 ? "1.4 1.4" : undefined}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelected(geo)}
                      onMouseEnter={(e) => { const r = wrapRef.current?.getBoundingClientRect(); setHover({ name: nome, value: row ? (row[layer.valueKey] as number) : undefined, x: r ? e.clientX - r.left : 0, y: r ? e.clientY - r.top : 0 }); }}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
              </g>
            )}
          </Mercator>
        ) : null}
      </svg>

      {/* tooltip — visual do ChartHover (caixa #08090c, monospace, hairline) */}
      {hover && (hover.name || hover.value != null) && (
        <div className="pointer-events-none absolute z-10 px-2 py-1" style={{ left: hover.x + 10, top: hover.y + 10, maxWidth: 210, background: "rgba(8,9,12,0.96)", border: "0.5px solid rgba(255,255,255,0.14)", borderRadius: 2, fontFamily: "monospace" }}>
          <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.85)" }}>{hover.name}</div>
          {hover.value != null && <div className="text-[11px]" style={{ color: GOLD }}>{hover.value} {layer.valueLabel}</div>}
          {hover.loadingSummary && <div className="text-[9px]" style={{ color: "rgba(229,229,229,0.5)" }}>carregando…</div>}
          {hover.summary && (hover.summary.length ? (
            <div className="text-[9px] leading-snug mt-0.5" style={{ color: "rgba(229,229,229,0.72)" }}>{hover.summary.map((s) => `${culturaLabel(s.cultura)} ${s.janela20_avg}`).join(" · ")}</div>
          ) : (
            <div className="text-[9px]" style={{ color: "rgba(229,229,229,0.5)" }}>sem zoneamento das culturas do seletor</div>
          ))}
        </div>
      )}

      {/* painel de leitura do agregado */}
      <div className="px-4 pb-2 pt-1">
        {!uf && <p className="text-[11px]" style={{ color: "rgba(229,229,229,0.55)" }}>Clique num estado para ver a camada por município.</p>}

        {uf && agg && n != null && n > 0 && (
          <div className="space-y-2">
            <p className="text-[12px] leading-relaxed" style={{ color: "#e5e5e5" }}>
              <span style={{ color: GOLD }}>{n} municípios</span> · de{" "}
              <span style={{ color: GOLD }}>{agg[layer.aggMin]} a {agg[layer.aggMax]}</span> {layer.valueLabel} · média{" "}
              <span style={{ color: GOLD }}>{Number(agg[layer.aggAvg]).toFixed(1)}</span>
            </p>
            {!isPaid ? (
              <div className="border-t pt-2" style={{ borderColor: "rgba(198,167,92,0.25)" }}>
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(229,229,229,0.6)" }}>
                  Há variação entre os municípios. Ver o valor de <span style={{ color: `${GOLD}cc` }}>cada município</span> é do <span style={{ color: GOLD }}>Terminal</span>.
                </p>
              </div>
            ) : (
              <p className="text-[10px]" style={{ color: "rgba(229,229,229,0.4)" }}>
                Cada município colorido pelo valor (mais dourado = maior). Passe o cursor para o número.
              </p>
            )}
          </div>
        )}

        {/* ponto de decisão: o município clicado. Free vê o rótulo + máscara; o
            valor real (de detail) só existe para o assinante. */}
        {uf && selected && pub.get(selected) && (
          <p className="text-[11px] leading-relaxed pt-1.5" style={{ color: "#e5e5e5" }}>
            <span style={{ color: GOLD }}>{pub.get(selected)!.municipio}</span> — {layer.metric}:{" "}
            {detail.get(selected) != null ? (
              <span style={{ color: GOLD }}>{detail.get(selected)![layer.valueKey]} {layer.valueLabel}</span>
            ) : (
              <><span style={{ color: `${GOLD}cc`, letterSpacing: "0.2em" }}>••••</span><span style={{ color: "rgba(229,229,229,0.5)" }}> — disponível no Terminal</span></>
            )}
          </p>
        )}

        {uf && agg && n === 0 && (
          <p className="text-[11px] leading-relaxed" style={{ color: "rgba(229,229,229,0.55)" }}>{layer.emptyMsg(info?.nome ?? "", paramValues)}</p>
        )}

        {status === "nodata" && uf && (
          <p className="text-[11px]" style={{ color: "rgba(229,229,229,0.5)" }}>Não foi possível carregar {info?.nome}. Tente outro estado.</p>
        )}
      </div>

      {/* LEITURA DO DADO + POR QUE IMPORTA (mudam com a camada) */}
      <div className="px-4 pb-4 pt-2 space-y-2" style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] leading-relaxed" style={{ color: "rgba(229,229,229,0.5)" }}>{layer.reading}</p>
        <p className="text-[10px] leading-relaxed" style={{ color: "rgba(229,229,229,0.5)" }}>{layer.manejoNote}</p>
        <p className="text-[10px] leading-relaxed" style={{ color: "rgba(229,229,229,0.5)" }}>{layer.why}</p>
      </div>
    </div>
  );
}
