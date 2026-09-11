/**
 * commodityRegistry — a FONTE DE VERDADE da identidade cruzada de commodity e da
 * COBERTURA por módulo. O escopo do painel (?escopo=<id>) é um id canônico daqui.
 *
 * Por que existe: os módulos têm vocabulários divergentes — o mapa usa chave
 * PascalCase (assets.ts key == AssetType), o stocks/tabela usam código PSD, a URL
 * usa token minúsculo. Passar a chave CRUA entre eles resetava em silêncio
 * (COMMODITIES["Soja"] === undefined -> caía pra soja). Aqui o id canônico faz a
 * ponte, e a COBERTURA é DECLARADA num booleano computado UMA vez (o runtime lê
 * `entry.temStocks`, NUNCA descobre por falha de lookup).
 *
 * Anti-drift: derivado das fontes ÚNICAS já existentes (ASSETS de assets.ts,
 * COMMODITIES de commands.ts, AGRO_TABLE de tableSchema) — adicionar um ativo lá
 * o traz aqui. Só o OVERLAY (sub-produtos + artigo de Research) é local, porque
 * não existe em nenhuma fonte.
 *
 * Dois casos de vazio (distintos, lição estado×procedência): NÃO COBRE (temX
 * false) é ESCOPO -> conteúdo relacionado ("existe aqui: preço real"); NÃO CARREGA
 * / stale é FALHA -> segue "ausente". A cobertura aqui responde só o primeiro.
 */
import { ASSETS, type AssetCategory, type AssetDef } from "../../config/assets";
import { COMMODITIES } from "./commands";
import { AGRO_TABLE } from "./table/tableSchema";

export type CommodityEntry = {
  id: string;                 // canônico, minúsculo (== token do ?escopo)
  label: string;
  category: AssetCategory;
  mapKey: string;             // == assets.ts key == AssetType do mapa (ponte p/ o palco)
  seriesCode: string | null;  // série de preço primária (series_latest); null = sem cotação
  noQuote: string | null;     // mensagem honesta quando seriesCode é null (nióbio, paládio…)
  psdCode: string | null;     // código PSD (ponte stocks) quando há
  tableCode: string | null;   // código da linha na AGRO_TABLE quando há
  // COBERTURA declarada (computada 1x; lida como booleano — nunca lookup em runtime):
  temTabela: boolean;
  temStocks: boolean;
  temMapa: boolean;
  relatedSeries: string[];    // sub-produtos/refs (series_latest) — profundidade real
  researchId: string | null;  // artigo em researchData.ts quando há (convite, não conteúdo)
};

/** Sub-produtos ALÉM da secondary/references de assets.ts (não vivem lá). */
const EXTRA_RELATED: Record<string, string[]> = {
  soja: ["FARELO_SOJA_WB", "OLEO_SOJA_WB"],
  arroz: ["ARROZ_QUEBRADO_WB"],
  boigordo: ["CARNE_BOVINA_WB"],
};
/** Artigo de Research por commodity (só os que mapeiam limpo hoje; extensível). */
const RESEARCH: Record<string, string> = {
  soja: "superficie-volatilidade-soja",
  niobio: "estrategia-mineral-niobio",
};

const AGRO_CODES = new Set(AGRO_TABLE.rows.map((r) => r.code));

function refsOf(a: AssetDef): string[] {
  const p = a.price;
  if (p.code == null) return [];
  const out: string[] = [];
  if (p.secondary) out.push(p.secondary.code);
  if (p.references) out.push(...p.references.map((r) => r.code));
  return out;
}

export const COMMODITIES_REGISTRY: CommodityEntry[] = ASSETS.map((a) => {
  const id = a.key.toLowerCase();
  const seriesCode = a.price.code; // string | null (as duas variantes têm .code)
  const noQuote = a.price.code == null ? a.price.noQuote : null;
  const psdCode = COMMODITIES[id]?.code ?? null;
  const tableCode = seriesCode != null && AGRO_CODES.has(seriesCode) ? seriesCode : null;
  return {
    id,
    label: a.label,
    category: a.category,
    mapKey: a.key,
    seriesCode,
    noQuote,
    psdCode,
    tableCode,
    temTabela: tableCode != null,
    temStocks: psdCode != null,          // == está no vocabulário PSD/COMMODITIES
    temMapa: a.category !== "Financeiro", // Financeiro (Dólar/RWA) não é ativo do mapa
    relatedSeries: [...refsOf(a), ...(EXTRA_RELATED[id] ?? [])],
    researchId: RESEARCH[id] ?? null,
  };
});

const BY_ID = new Map(COMMODITIES_REGISTRY.map((e) => [e.id, e]));
const BY_MAPKEY = new Map(COMMODITIES_REGISTRY.map((e) => [e.mapKey, e]));

/** o escopo default do painel. */
export const DEFAULT_ESCOPO = "soja";

/** entry por id canônico (?escopo). null se o token não existe. */
export const commodityById = (id: string | null | undefined): CommodityEntry | null =>
  id ? BY_ID.get(id) ?? null : null;

/** id canônico a partir da chave do mapa (palco -> ?escopo). NUNCA passar a chave crua. */
export const idFromMapKey = (mapKey: string): string | null => BY_MAPKEY.get(mapKey)?.id ?? null;

/** entry válido ou o default — garante que o painel sempre tem um escopo real. */
export const resolveEscopo = (id: string | null | undefined): CommodityEntry =>
  commodityById(id) ?? BY_ID.get(DEFAULT_ESCOPO)!;
