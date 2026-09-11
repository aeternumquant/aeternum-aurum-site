import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { REGIME_BAND, COVERAGE_MIN, type Col, type TableConfig } from "./tableSchema";
import "./metrics-table.css";

/**
 * Tabela densa, CONFIG-DRIVEN: recebe uma TableConfig ({rows, cols}) — a mesma
 * usada pelo comando kind:"table". Cada célula desenha o próprio trilho; a tabela
 * não desenha nada. table-layout:fixed + <colgroup> (largura por coluna no schema)
 * => thead e tbody obedecem à MESMA grade: não podem desalinhar. Barra contra o
 * CAP da métrica (nunca Math.max). 4 estados de dado. Célula clicável → popover.
 */
type CellState = "ok" | "stale" | "na";
type Datum = { v: number | null; state: CellState };
type RowData = {
  code: string; label: string; psd?: string;
  unit: string | null; source: string; ts: string | null; stale: boolean;
  cells: Record<string, Datum>; regime: "up" | "flat" | "down" | "na";
};

const STALE_DIARIA_DIAS = 6;
const nf = (v: number, dec: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const chg = (v: number, dec: number) => (v >= 0 ? "+" : "−") + nf(Math.abs(v), dec);
// "Último" tem casas por magnitude (PTAX 5,0979 · soja 28,87 · ouro 4.375,80)
const fmtLast = (v: number) => { const a = Math.abs(v); const d = a < 10 ? 4 : 2; return nf(v, d); };
const PSD_LABEL: Record<string, string> = { "2222000": "soja", "0440000": "milho", "0111000": "boi", "0711100": "café" };

export default function MetricsTable({ config }: { config: TableConfig }) {
  const { rows: ROWS, cols: COLS } = config;
  const hasStu = useMemo(() => COLS.some((c) => c.key === "stu"), [COLS]);
  const [rows, setRows] = useState<RowData[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pop, setPop] = useState<{ row: RowData; col: Col; datum: Datum } | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const tableMinW = useMemo(() => COLS.reduce((s, c) => s + c.width, 0), [COLS]);
  // overflow REAL (p/ máscara de gradiente só quando há corte) — checa no mount, no resize e ao carregar dados
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows]);

  const load = useCallback(async () => {
    if (!supabase) { setErr("Supabase indisponível."); return; }
    setErr(null); setRows(null);
    const codes = ROWS.map((r) => r.code);
    const now = Date.now();
    const [varRes, latRes] = await Promise.all([
      supabase.rpc("series_variacoes", { p_codes: codes }),
      supabase.from("series_latest").select("code,unit,market,attribution,ts").in("code", codes),
    ]);
    if (varRes.error) { setErr(varRes.error.message); return; }
    const V = new Map<string, any>((varRes.data ?? []).map((r: any) => [r.code, r]));
    const L = new Map<string, any>((latRes.data ?? []).map((r: any) => [r.code, r]));
    const stu = new Map<string, number>();
    if (hasStu) {
      await Promise.all(ROWS.filter((r) => r.psd).map(async (r) => {
        const { data } = await supabase!.rpc("stocks_to_use_publico", { p_commodity: r.psd, p_regiao: "WORLD" });
        const row = Array.isArray(data) ? data[0] : data;
        if (row?.ratio != null) stu.set(r.code, Number(row.ratio));
      }));
    }
    const out: RowData[] = ROWS.map((r) => {
      const v = V.get(r.code) ?? {}; const meta = L.get(r.code) ?? {};
      const ts = v.last_ts ?? meta.ts ?? null;
      const stale = ts ? (now - new Date(ts).getTime()) / 86400000 > STALE_DIARIA_DIAS : false;
      const st = (x: any): Datum => (x == null ? { v: null, state: "na" } : { v: Number(x), state: stale ? "stale" : "ok" });
      const cells: Record<string, Datum> = {
        last: st(v.last_value), d1: st(v.d1), s1: st(v.s1), m1: st(v.m1), vol30: st(v.vol30),
        stu: stu.has(r.code) ? { v: stu.get(r.code)!, state: "ok" } : { v: null, state: "na" },
      };
      const m = cells.m1.v;
      const regime = cells.m1.state === "na" || m == null ? "na" : m >= REGIME_BAND ? "up" : m <= -REGIME_BAND ? "down" : "flat";
      return { code: r.code, label: r.label, psd: r.psd, unit: meta.unit ?? null, source: meta.attribution || meta.market || "—", ts, stale, cells, regime };
    });
    setRows(out);
  }, [ROWS, hasStu]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!pop) return;
    const close = () => setPop(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [pop]);

  const total = ROWS.length;
  const coverage = (key: string) => rows ? rows.filter((r) => r.cells[key]?.state !== "na").length : total;
  const open = (row: RowData, col: Col, datum: Datum, r: DOMRect) => { setPop({ row, col, datum }); setRect(r); };

  if (err) return <div className="mtable"><div className="gridwrap" style={{ padding: 20, color: "#a0a0a0", fontSize: 12 }}>Não foi possível carregar: {err}</div></div>;

  return (
    <div className="mtable" ref={scrollRef} data-overflow={overflowing ? "true" : undefined}>
      <table className="mgrid" style={{ minWidth: tableMinW }}>
          <colgroup>{COLS.map((c) => <col key={c.key} style={{ width: c.width }} />)}</colgroup>
          <thead>
            <tr>
              {COLS.map((c) => {
                const cov = coverage(c.key);
                const downgraded = c.type === "bar" && cov / total < COVERAGE_MIN;
                const cls = c.type === "asset" ? "tk" : (c.type === "num" || c.type === "numchg" || (c.type === "bar" && downgraded)) ? "rt" : c.type === "tag" ? "ct" : "";
                return (
                  <th key={c.key} className={cls}>
                    {c.label}
                    {c.type === "bar" && !downgraded && <span className={`scale${cov < total ? " warn" : ""}`}>±{nf(c.cap!, 0)}%{cov < total ? `  ·  ${cov}/${total}` : ""}</span>}
                    {c.type === "bar" && downgraded && <span className="scale warn">{cov}/{total} · num</span>}
                    {c.key === "vol30" && <span className="scale" style={{ color: "#6a6a6a" }}>{c.unit}</span>}
                    {c.key === "stu" && (cov < total ? <span className="scale warn">{cov}/{total}</span> : <span className="scale" style={{ color: "#6a6a6a" }}>{c.unit}</span>)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((rd) => (
              <tr key={rd.code}>
                {COLS.map((c) => (
                  <Cell key={c.key} col={c} rd={rd} downgraded={c.type === "bar" && coverage(c.key) / total < COVERAGE_MIN}
                    onOpen={(r) => open(rd, c, rd.cells[c.key], r)}
                    isOpen={pop?.row.code === rd.code && pop?.col.key === c.key} />
                ))}
              </tr>
            ))}
            {!rows && <tr>{COLS.map((c, i) => i === 0 ? <td key={c.key} className="tk">…</td> : <td key={c.key} />)}</tr>}
          </tbody>
      </table>
      {pop && rect && <Popover row={pop.row} col={pop.col} datum={pop.datum} rect={rect} onClose={() => setPop(null)} />}
    </div>
  );
}

function Cell({ col, rd, downgraded, onOpen, isOpen }: { col: Col; rd: RowData; downgraded: boolean; onOpen: (r: DOMRect) => void; isOpen: boolean }) {
  if (col.type === "asset") return <td className="tk">{rd.label}</td>;
  const d = rd.cells[col.key];

  if (col.type === "tag") {
    const map = { up: ["up", "Acima"], flat: ["flat", "Estável"], down: ["down", "Abaixo"], na: ["na", "—"] } as const;
    const [cls, label] = map[rd.regime];
    return <td className="ct"><span className={`tag ${cls}`}>{label}</span></td>;
  }

  const naCell = d.state === "na" || d.v == null;

  if (col.type === "num" || (col.type === "bar" && downgraded)) {
    const txt = naCell ? "—" : (col.key === "last" ? fmtLast(d.v!) : nf(d.v!, col.dec ?? 2) + (col.unit ?? ""));
    return <td className="num" style={naCell ? { color: "#6a6a6a" } : undefined}>{txt}</td>;
  }

  if (col.type === "numchg") {
    if (naCell) return <td className="num" style={{ color: "#6a6a6a" }}>—</td>;
    const color = d.v! >= 0 ? "rgb(93,168,116)" : "rgb(190,74,66)";
    return (
      <td style={{ padding: 0 }}>
        <button className="cellbtn nc" type="button" aria-expanded={isOpen ? "true" : undefined}
          aria-label={`${rd.label} ${col.label}: ${chg(d.v!, col.dec ?? 2)}${col.unit ?? ""}`}
          onClick={(e) => onOpen(e.currentTarget.getBoundingClientRect())}>
          <span className="ncv" style={{ color }}>{chg(d.v!, col.dec ?? 2)}{col.unit}</span>
        </button>
      </td>
    );
  }

  // bar
  return (
    <td className="m">
      <button className="cellbtn" type="button" disabled={naCell} aria-expanded={isOpen ? "true" : undefined}
        aria-label={`${rd.label} ${col.label}: ${naCell ? "sem dado" : chg(d.v!, col.dec ?? 2) + (col.unit ?? "")}`}
        onClick={(e) => { if (!naCell) onOpen(e.currentTarget.getBoundingClientRect()); }}>
        <BarCell d={d} cap={col.cap!} unit={col.unit ?? ""} dec={col.dec ?? 2} />
      </button>
    </td>
  );
}

function BarCell({ d, cap, unit, dec }: { d: Datum; cap: number; unit: string; dec: number }) {
  // dois filhos do grid do cellbtn: [trilho | número]. O número numa faixa fixa à
  // direita — nunca cruza o eixo (fim da sobreposição, por estrutura não opacidade).
  if (d.state === "na" || d.v == null) return (<><div className="cell na" /><span className="val na">—</span></>);
  const pct = Math.min(Math.abs(d.v) / cap, 1) * 50;
  const clip = Math.abs(d.v) > cap;
  return (
    <>
      <div className="cell">
        <div className={`bar ${d.v >= 0 ? "pos" : "neg"}${clip ? " clip" : ""}${d.state === "stale" ? " stale" : ""}`} style={{ width: pct + "%" }} />
        {d.state === "stale" && <span className="dot" />}
      </div>
      <span className="val">{chg(d.v, dec)}{unit}</span>
    </>
  );
}

function Popover({ row, col, datum, rect, onClose }: { row: RowData; col: Col; datum: Datum; rect: DOMRect; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [spark, setSpark] = useState<string | null>(null);
  const isPrice = ["last", "d1", "s1", "m1", "vol30"].includes(col.key);
  const v = datum.v, cap = col.cap;
  const isChange = col.type === "bar" || col.type === "numchg";

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const pw = 288, ph = el.offsetHeight;
    let left = Math.max(12, Math.min(rect.left + rect.width / 2 - pw / 2, window.innerWidth - pw - 12));
    let top = rect.bottom + 9;
    if (top + ph > window.innerHeight - 12) top = Math.max(12, rect.top - ph - 9);
    setPos({ left, top });
  }, [rect]);

  useEffect(() => {
    if (!isPrice || !supabase) return;
    let alive = true;
    (async () => {
      const { data } = await supabase!.from("observations").select("ts,value,series!inner(code)").eq("series.code", row.code).order("ts", { ascending: false }).limit(40);
      if (!alive || !data || data.length < 2) return;
      const vals = (data as any[]).map((r) => Number(r.value)).reverse();
      const w = 260, h = 38, pad = 4, mn = Math.min(...vals), mx = Math.max(...vals), rg = mx - mn || 1;
      const pts = vals.map((val, i) => [(i / (vals.length - 1)) * w, pad + (1 - (val - mn) / rg) * (h - pad * 2)]);
      const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
      const c = vals[vals.length - 1] >= vals[0] ? "93,168,116" : "190,74,66";
      const last = pts[pts.length - 1];
      setSpark(`<path d="${line} L${w} ${h} L0 ${h} Z" fill="rgba(${c},.11)"/><path d="${line}" fill="none" stroke="rgba(${c},.9)" stroke-width="1.25" stroke-linejoin="round"/><circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.4" fill="rgb(${c})"/>`);
    })();
    return () => { alive = false; };
  }, [isPrice, row.code]);

  const valTxt = v == null ? "—" : (isChange ? chg(v, col.dec ?? 2) : (col.key === "last" ? fmtLast(v) : nf(v, col.dec ?? 2))) + (col.type === "asset" ? "" : col.unit ?? "");
  const color = isChange && v != null ? (v >= 0 ? "rgb(93,168,116)" : "rgb(190,74,66)") : "var(--tx)";
  const fonteTxt = col.fonte ? col.fonte.titulo : `${row.source}${row.unit ? " · " + row.unit : ""}`;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 59 }} onClick={onClose} />
      <div className="mtable-pop" ref={ref} role="dialog" aria-label="Detalhe da métrica"
        style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999, visibility: pos ? "visible" : "hidden" }}>
        <button className="close" aria-label="Fechar" onClick={onClose}>×</button>
        <span className="pt">{row.label} · {col.label}</span>
        <div className="pv" style={{ color }}>{valTxt}</div>
        {isPrice && spark && <svg className="spark" viewBox="0 0 260 38" preserveAspectRatio="none" aria-hidden="true" dangerouslySetInnerHTML={{ __html: spark }} />}
        <dl>
          {cap != null && v != null && <><dt>escala</dt><dd>±{nf(cap, 0)}%</dd><dt>posição</dt><dd style={Math.abs(v) > cap ? { color: "rgb(190,74,66)" } : undefined}>{Math.abs(v) > cap ? "fora — cortada" : Math.round((Math.abs(v) / cap) * 100) + "% do teto"}</dd></>}
          {col.key === "stu" && <><dt>referência</dt><dd>{row.psd ? PSD_LABEL[row.psd] : "—"} · mundo</dd></>}
          {col.key === "regime" && <><dt>base</dt><dd>21 pregões (1M)</dd></>}
          <dt>frescor</dt><dd style={row.stale ? { color: "rgb(198,167,92)" } : undefined}>{row.stale ? "fora da janela" : "no prazo"}{row.ts ? ` · ${new Date(row.ts).toLocaleDateString("pt-BR")}` : ""}</dd>
        </dl>
        {col.fonte?.link
          ? <a className="src" href={col.fonte.link} target="_blank" rel="noreferrer">Fonte: <b>{fonteTxt}</b></a>
          : <div className="src">Fonte: <b>{fonteTxt}</b></div>}
      </div>
    </>
  );
}
