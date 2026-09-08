import { useCallback, useEffect, useRef, useState } from "react";
import { Mercator } from "@visx/geo";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection } from "geojson";
import brUfTopo from "./geo/br-uf.topo.json";
import { supabase } from "../../lib/supabase";
import { useEntitlements } from "../../hooks/useEntitlements";

/**
 * <BrazilMap/> — o Terminal-BR. Mapa por ESTADO (publico); clique num estado
 * carrega os municipios daquela UF (import dinamico) e mostra a superficie ZARC
 * (janela de plantio de baixo risco, cultura Soja / manejo Sequeiro).
 *
 * GRANULARIDADE (a gate, no SERVIDOR):
 *  - municipios_por_estado(uf): agregado — todos veem (contagem + min/max/media).
 *  - municipios_detalhe(uf): valor POR municipio — so 'terminal'+ (a funcao
 *    devolve 0 linhas p/ free). O free NUNCA recebe o valor: nao ha o que
 *    esconder no cliente.
 *
 * v1: Goias completo (unica UF com geometria municipal gerada). Demais UFs ->
 * "sem dado para este estado" (nunca tela vazia). Sem animacao de zoom.
 * Tokens: fundo #08090c, dourado #c6a75c, texto #e5e5e5.
 */

const GOLD = "#c6a75c";
const W = 640;
const H = 520;
const CULTURA = "Soja";
const MANEJO = 1; // Sequeiro
const GO_CODE = "52";

// code IBGE -> sigla/nome (a geometria traz o code; as funcoes recebem a sigla)
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

type Agg = { uf: string; n_municipios: number; janela20_min: number; janela20_max: number; janela20_avg: number };
type Detail = { geocodigo: string; municipio: string; janela20: number; risco_min: number; dec_ini: number; dec_fim: number };

const brUf = topojson.feature(brUfTopo as unknown as Topology, (brUfTopo as any).objects["br-uf"]) as unknown as FeatureCollection;

export default function BrazilMap() {
  const { isPaid } = useEntitlements();
  const [uf, setUf] = useState<string | null>(null);
  const [munFc, setMunFc] = useState<FeatureCollection | null>(null);
  const [agg, setAgg] = useState<Agg | null>(null);
  const [detail, setDetail] = useState<Map<string, Detail>>(new Map());
  const [status, setStatus] = useState<"idle" | "loading" | "nodata" | "ready">("idle");
  const [hover, setHover] = useState<{ name: string; value?: number; x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const openUf = useCallback(async (code: string) => {
    setUf(code); setHover(null); setMunFc(null); setAgg(null); setDetail(new Map());
    const info = UF[code];
    if (!info || code !== GO_CODE) { setStatus("nodata"); return; } // v1: so Goias
    setStatus("loading");
    try {
      const topo = (await import("./geo/go-mun.topo.json")).default as unknown as Topology;
      setMunFc(topojson.feature(topo, (topo as any).objects["go-mun"]) as unknown as FeatureCollection);
      // agregado (publico) — o gancho do free, independe de plano
      const { data: a } = await supabase!.rpc("municipios_por_estado", { p_uf: info.sigla, p_cultura: CULTURA, p_manejo: MANEJO });
      setAgg(Array.isArray(a) ? (a[0] as Agg) : (a as Agg));
      setStatus("ready");
    } catch { setStatus("nodata"); }
  }, []);

  // DETALHE (o VALOR por municipio) num EFFECT — nao no clique — para nao depender
  // do timing do plano. Se isPaid virar true DEPOIS do clique (o current_plan
  // carregou tarde), o detalhe entra sozinho e o mapa colore. So o assinante busca;
  // a gate real segue no servidor. (Conserta "tudo uniforme + hover mudo".)
  useEffect(() => {
    if (uf !== GO_CODE || !isPaid || !supabase) { setDetail(new Map()); return; }
    let alive = true;
    supabase.rpc("municipios_detalhe", { p_uf: "GO", p_cultura: CULTURA, p_manejo: MANEJO }).then(({ data }) => {
      if (!alive) return;
      const m = new Map<string, Detail>();
      for (const row of (data ?? []) as Detail[]) m.set(row.geocodigo, row);
      setDetail(m);
    });
    return () => { alive = false; };
  }, [uf, isPaid]);

  const back = useCallback(() => { setUf(null); setStatus("idle"); setHover(null); setMunFc(null); setAgg(null); setDetail(new Map()); }, []);

  // cor do municipio pela janela (terminal). Sem valor (free / sem dado) -> quase vazio.
  const colorFor = useCallback((geocodigo: string) => {
    const row = detail.get(geocodigo);
    if (!row || !agg) return "rgba(198,167,92,0.07)";
    const { janela20_min: mn, janela20_max: mx } = agg;
    const t = mx > mn ? (row.janela20 - mn) / (mx - mn) : 1;
    return `rgba(198,167,92,${(0.22 + t * 0.72).toFixed(2)})`;
  }, [detail, agg]);

  const onMove = (e: React.MouseEvent) => {
    if (!hover) return;
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) setHover((h) => (h ? { ...h, x: e.clientX - r.left, y: e.clientY - r.top } : h));
  };

  const info = uf ? UF[uf] : null;

  return (
    <div ref={wrapRef} data-testid="brazilmap" className="relative w-full max-w-2xl" style={{ background: "#08090c" }} onMouseMove={onMove}>
      {/* cabecalho */}
      <div className="flex items-baseline justify-between px-4 pt-3 pb-1">
        <h3 className="font-display text-sm uppercase tracking-[0.25em]" style={{ color: "#e5e5e5" }}>
          {info ? info.nome : "Brasil — janela de plantio (ZARC · Soja)"}
        </h3>
        {uf && (
          <button onClick={back} className="text-[10px] uppercase tracking-widest transition-colors" style={{ color: `${GOLD}b0` }}>
            ← estados
          </button>
        )}
      </div>

      {/* mapa */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={info ? `Municípios de ${info.nome}` : "Estados do Brasil"}>
        {uf === null ? (
          <Mercator data={brUf.features} fitSize={[[W, H], brUf as any]}>
            {(m) => (
              <g>
                {m.features.map(({ feature, path }, i) => {
                  const code = String((feature as any).id);
                  const hasData = code === GO_CODE; // v1
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
                      onMouseEnter={(e) => { const r = wrapRef.current?.getBoundingClientRect(); setHover({ name: UF[code]?.nome ?? code, x: r ? e.clientX - r.left : 0, y: r ? e.clientY - r.top : 0 }); }}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
              </g>
            )}
          </Mercator>
        ) : status === "loading" ? (
          <text x={W / 2} y={H / 2} textAnchor="middle" style={{ fontFamily: "monospace", fontSize: 12, fill: `${GOLD}` }}>carregando municípios…</text>
        ) : status === "nodata" ? (
          <text x={W / 2} y={H / 2} textAnchor="middle" style={{ fontFamily: "monospace", fontSize: 12, fill: "rgba(229,229,229,0.5)" }}>sem dado para este estado</text>
        ) : munFc ? (
          <Mercator data={munFc.features} fitSize={[[W, H], munFc as any]}>
            {(m) => (
              <g>
                {m.features.map(({ feature, path }, i) => {
                  const geo = String((feature as any).id);
                  const row = detail.get(geo);
                  return (
                    <path
                      key={i}
                      d={path || ""}
                      fill={colorFor(geo)}
                      stroke="rgba(229,229,229,0.16)"
                      strokeWidth={0.35}
                      onMouseEnter={(e) => { const r = wrapRef.current?.getBoundingClientRect(); setHover({ name: row?.municipio ?? "", value: row?.janela20, x: r ? e.clientX - r.left : 0, y: r ? e.clientY - r.top : 0 }); }}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
              </g>
            )}
          </Mercator>
        ) : null}
      </svg>

      {/* tooltip — reaproveita o VISUAL do ChartHover (caixa #08090c, monospace, hairline) */}
      {hover && (hover.name || hover.value != null) && (
        <div
          className="pointer-events-none absolute z-10 px-2 py-1"
          style={{ left: hover.x + 10, top: hover.y + 10, background: "rgba(8,9,12,0.96)", border: "0.5px solid rgba(255,255,255,0.14)", borderRadius: 2, fontFamily: "monospace" }}
        >
          <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.85)" }}>{hover.name}</div>
          {hover.value != null && <div className="text-[11px]" style={{ color: GOLD }}>{hover.value} decêndios de baixo risco</div>}
        </div>
      )}

      {/* painel de leitura */}
      <div className="px-4 pb-4 pt-1">
        {!uf && <p className="text-[11px]" style={{ color: "rgba(229,229,229,0.55)" }}>Clique num estado. Goiás está completo; os demais chegam por estado.</p>}

        {uf === GO_CODE && agg && (
          <div className="space-y-2">
            {/* AGREGADO REAL — o gancho honesto (cap explicito, estilo Koyfin) */}
            <p className="text-[12px] leading-relaxed" style={{ color: "#e5e5e5" }}>
              <span style={{ color: GOLD }}>{agg.n_municipios} municípios</span> · janela de plantio de{" "}
              <span style={{ color: GOLD }}>{agg.janela20_min} a {agg.janela20_max}</span> decêndios de baixo risco · média{" "}
              <span style={{ color: GOLD }}>{agg.janela20_avg.toFixed(1)}</span>
            </p>
            {!isPaid ? (
              <div className="border-t pt-2" style={{ borderColor: "rgba(198,167,92,0.25)" }}>
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(229,229,229,0.6)" }}>
                  Há variação entre os municípios. Ver a janela de <span style={{ color: `${GOLD}cc` }}>cada município</span> é do{" "}
                  <span style={{ color: GOLD }}>Terminal</span>.
                </p>
              </div>
            ) : (
              <p className="text-[10px]" style={{ color: "rgba(229,229,229,0.4)" }}>
                Cada município colorido pela janela de baixo risco (mais dourado = janela maior). Passe o cursor para o valor.
              </p>
            )}
          </div>
        )}

        {status === "nodata" && uf && (
          <p className="text-[11px]" style={{ color: "rgba(229,229,229,0.5)" }}>
            Sem dado para {info?.nome} nesta versão — estamos expandindo por estado. Goiás está completo.
          </p>
        )}
      </div>
    </div>
  );
}
