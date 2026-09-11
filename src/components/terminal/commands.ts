/**
 * CommandRegistry unificado. Um "command" é um MÓDULO (card com componente próprio)
 * OU uma TABELA (MetricsTable genérico + {rows, cols}), discriminado por `kind`.
 * A URL é o estado do painel: /terminal-br?commands=tabela-agro,tabela-macro,mapa,stocks.
 *
 * Anti-inchaço (as três regras):
 *  1) dados de tabela vivem em table/tableSchema.ts (TableConfig) — o registry só referencia;
 *  2) COMPONENTES nunca entram aqui (o mapa id→componente vive no renderer, sem ciclo);
 *  3) o `kind` mantém `size` fora das tabelas e `config` fora dos cards.
 * Adicionar a mensal/metais/energia = uma TableConfig nova + UMA entrada aqui.
 */
import { AGRO_TABLE, MACRO_TABLE, type TableConfig } from "./table/tableSchema";

export type CommandSize = "2x2" | "2x1" | "1x1";
export type PlanId = "free" | "terminal" | "partners" | "aurum";
export type CommandSource = { titulo: string; tipo: string; link: string };
export type CommandKind = "module" | "table";

type Base = { id: string; label: string; descricao: string; planoMinimo: PlanId };
// width = largura INTRÍNSECA em px (p/ proporcionar as linhas do layout). Módulo declara;
// tabela deriva do config (soma dos Col.width) via commandWidth(). Sem emparelhamento no registry.
export type ModuleCommand = Base & { kind: "module"; size: CommandSize; width: number; fonte: CommandSource };
export type TableCommand = Base & { kind: "table"; config: TableConfig };
export type CommandMeta = ModuleCommand | TableCommand;

/** largura intrínseca do comando — tabela = soma das colunas; módulo = declarada. */
export const commandWidth = (cmd: CommandMeta): number =>
  cmd.kind === "table" ? cmd.config.cols.reduce((s, c) => s + c.width, 0) : cmd.width;

export const COMMANDS: Record<string, CommandMeta> = {
  "tabela-agro": {
    kind: "table", id: "tabela-agro", label: "Mercado agro",
    descricao: "Futuros B3 — variação e aperto de oferta. Barras na régua declarada.",
    planoMinimo: "free", config: AGRO_TABLE,
  },
  "tabela-macro": {
    kind: "table", id: "tabela-macro", label: "Macro",
    descricao: "Câmbio, petróleo e ouro — número colorido (vol heterogênea, sem régua única).",
    planoMinimo: "free", config: MACRO_TABLE,
  },
  mapa: {
    kind: "module", id: "mapa", label: "O campo por município",
    descricao: "Janela de plantio de baixo risco (ZARC) por município. Estado aberto; município é do Terminal.",
    size: "2x2", width: 462, planoMinimo: "free",
    fonte: { titulo: "ZARC — Zoneamento Agrícola de Risco Climático (Portaria MAPA)", tipo: "Recomendação oficial", link: "https://www.gov.br/agricultura/pt-br/assuntos/riscos-seguro/programa-nacional-de-zoneamento-agricola-de-risco-climatico" },
  },
  stocks: {
    kind: "module", id: "stocks", label: "Stocks-to-use",
    descricao: "Estoque final sobre o uso total — o quão apertada está a oferta ante a demanda.",
    size: "2x1", width: 380, planoMinimo: "free",
    fonte: { titulo: "USDA/FAS — Production, Supply & Distribution (PSD)", tipo: "Base oficial", link: "https://apps.fas.usda.gov/psdonline/app/index.html" },
  },
  cflow: {
    kind: "module", id: "cflow", label: "Fluxo global de commodities",
    descricao: "Quem compra e quem fornece — exportação e importação de cada commodity por país.",
    size: "2x2", width: 620, planoMinimo: "free",
    fonte: { titulo: "Comex Stat (MDIC) / UN Comtrade — fluxos de comércio", tipo: "Base oficial", link: "https://comexstat.mdic.gov.br/" },
  },
  // FASE 2 (andaime): mock da casca <Stage> — fora do DEFAULT_LAYOUT, só via ?commands=palco.
  palco: {
    kind: "module", id: "palco", label: "Palco (mock)",
    descricao: "Mock da casca <Stage>: mapa como palco, chrome em slots flutuantes de vidro.",
    size: "2x2", width: 1600, planoMinimo: "free",
    fonte: { titulo: "—", tipo: "Andaime FASE 2", link: "#" },
  },
};

/** layout default: linhas separadas por ';', comandos lado-a-lado por ','. É o ESTADO
 *  inicial da URL — o usuário reordena/emparelha editando ?commands=. */
export const DEFAULT_LAYOUT = "tabela-agro,mapa;tabela-macro,cflow;stocks";
export const isCommand = (id: string): id is keyof typeof COMMANDS => id in COMMANDS;

/** escopo=<token> -> commodity do PSD (usado pelo módulo stocks-to-use). */
export const COMMODITIES: Record<string, { code: string; label: string }> = {
  soja: { code: "2222000", label: "Soja" },
  milho: { code: "0440000", label: "Milho" },
  trigo: { code: "0410000", label: "Trigo" },
  algodao: { code: "2631000", label: "Algodão" },
  cafe: { code: "0711100", label: "Café" },
  acucar: { code: "0612000", label: "Açúcar" },
  arroz: { code: "0422110", label: "Arroz" },
};
export const REGIOES: Record<string, { code: string; label: string }> = {
  WORLD: { code: "WORLD", label: "Mundo" },
  BRA: { code: "BRA", label: "Brasil" },
  USA: { code: "USA", label: "EUA" },
};
