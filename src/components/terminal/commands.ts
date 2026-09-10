/**
 * CommandRegistry — o nível ACIMA do LayerConfig. Um "command" é um MÓDULO do
 * dashboard (card com componente próprio, tamanho, fonte, plano mínimo). A URL é o
 * estado do painel: /terminal-br?commands=mapa,stocks&escopo=soja. O comando MAPA
 * usa internamente o LAYERS/LayerConfig de hoje — composição, não reescrita.
 *
 * REGRA: nenhum comando tem fonte vazia. Se não há paper, aponta a fonte do DADO.
 */
export type CommandSize = "2x2" | "2x1" | "1x1";
export type PlanId = "free" | "terminal" | "partners" | "aurum";
export type CommandSource = { titulo: string; tipo: string; link: string };

export type CommandMeta = {
  id: string;
  label: string;
  descricao: string; // uma frase
  size: CommandSize;
  fonte: CommandSource; // NUNCA vazia
  planoMinimo: PlanId; // free = visível a todos (a degradação fina é dentro do módulo)
};

export const COMMANDS: Record<string, CommandMeta> = {
  mapa: {
    id: "mapa",
    label: "O campo por município",
    descricao: "Janela de plantio de baixo risco (ZARC) por município. Estado aberto; município é do Terminal.",
    size: "2x2",
    fonte: {
      titulo: "ZARC — Zoneamento Agrícola de Risco Climático (Portaria MAPA)",
      tipo: "Recomendação oficial",
      link: "https://www.gov.br/agricultura/pt-br/assuntos/riscos-seguro/programa-nacional-de-zoneamento-agricola-de-risco-climatico",
    },
    planoMinimo: "free",
  },
  stocks: {
    id: "stocks",
    label: "Stocks-to-use",
    descricao: "Estoque final sobre o uso total — o quão apertada está a oferta ante a demanda.",
    size: "2x1",
    fonte: {
      titulo: "USDA/FAS — Production, Supply & Distribution (PSD)",
      tipo: "Base oficial",
      link: "https://apps.fas.usda.gov/psdonline/app/index.html",
    },
    planoMinimo: "free",
  },
};

export const DEFAULT_COMMANDS = ["mapa", "stocks"];
export const isCommand = (id: string): id is keyof typeof COMMANDS => id in COMMANDS;

/** escopo=<token> -> commodity do PSD. */
export const COMMODITIES: Record<string, { code: string; label: string }> = {
  soja: { code: "2222000", label: "Soja" },
  milho: { code: "0440000", label: "Milho" },
  trigo: { code: "0410000", label: "Trigo" },
  algodao: { code: "2631000", label: "Algodão" },
  cafe: { code: "0711100", label: "Café" },
  acucar: { code: "0612000", label: "Açúcar" },
  arroz: { code: "0422110", label: "Arroz" },
};

/** região do stocks-to-use (commodity × região, parametrizável). */
export const REGIOES: Record<string, { code: string; label: string }> = {
  WORLD: { code: "WORLD", label: "Mundo" },
  BRA: { code: "BRA", label: "Brasil" },
  USA: { code: "USA", label: "EUA" },
};
