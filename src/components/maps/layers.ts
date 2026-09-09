/**
 * LayerConfig — a abstração que faz o Terminal-BR ESCALAR. Cada camada de dado
 * declara aqui: rótulo, as funções RPC (agregado público + detalhe do assinante),
 * seus parâmetros (cultura/manejo no ZARC; produto/ano no PAM…), como extrair o
 * valor, e os textos de leitura/porquê. O <BrazilMap/> lê a camada ativa e chama
 * tudo GENERICAMENTE — adicionar PAM/Censo/AMB é acrescentar um objeto neste
 * array, NÃO escrever componente novo por combinação.
 */
export type LayerOption = { value: string; label: string };
export type LayerParam = { key: string; label: string; options: LayerOption[] };

export type LayerConfig = {
  key: string;
  label: string;                 // "Janela de plantio (ZARC)"
  aggFn: string;                 // RPC pública (agregado por estado)
  detailFn: string;             // RPC do assinante (valor por município)
  params: LayerParam[];          // controles além da UF (cultura, manejo, …)
  toArgs: (uf: string, p: Record<string, string>) => Record<string, unknown>;
  valueKey: string;              // campo do valor na linha de detalhe
  aggN: string; aggMin: string; aggMax: string; aggAvg: string; // campos do agregado
  valueLabel: string;            // "decêndios de baixo risco"
  subtitle: (p: Record<string, string>) => string;
  emptyMsg: (ufNome: string, p: Record<string, string>) => string;
  reading: string;               // o que o número significa
  why: string;                   // por que importa (a ponte com a tese)
};

const CULTURAS: LayerOption[] = [
  { value: "Soja", label: "Soja" },
  { value: "Milho 1ª Safra", label: "Milho 1ª safra" },
  { value: "Milho 2ª Safra", label: "Milho 2ª safra" },
  { value: "Algodão Herbáceo", label: "Algodão" },
  { value: "Feijão", label: "Feijão" },
  { value: "Arroz", label: "Arroz" },
  { value: "Trigo", label: "Trigo" },
  { value: "Café Arábica", label: "Café arábica" },
];
const MANEJOS: LayerOption[] = [
  { value: "1", label: "Sequeiro" },
  { value: "2", label: "Irrigado" },
];
const labelOf = (opts: LayerOption[], v: string) => opts.find((o) => o.value === v)?.label ?? v;

export const LAYERS: LayerConfig[] = [
  {
    key: "zarc",
    label: "Janela de plantio (ZARC)",
    aggFn: "municipios_por_estado",
    detailFn: "municipios_detalhe",
    params: [
      { key: "cultura", label: "Cultura", options: CULTURAS },
      { key: "manejo", label: "Manejo", options: MANEJOS },
    ],
    toArgs: (uf, p) => ({ p_uf: uf, p_cultura: p.cultura, p_manejo: Number(p.manejo) }),
    valueKey: "janela20",
    aggN: "n_municipios", aggMin: "janela20_min", aggMax: "janela20_max", aggAvg: "janela20_avg",
    valueLabel: "decêndios de baixo risco",
    subtitle: (p) => `${labelOf(CULTURAS, p.cultura)} · ${labelOf(MANEJOS, p.manejo).toLowerCase()}`,
    emptyMsg: (nome, p) =>
      `A ${labelOf(CULTURAS, p.cultura).toLowerCase()} em ${labelOf(MANEJOS, p.manejo).toLowerCase()} não é zoneada em ${nome}. Outras culturas entram pelo seletor.`,
    reading:
      "Um decêndio é um período de dez dias. A cor mostra quantos decêndios do ano são recomendados para a semeadura com risco climático de até 20% — a janela de baixo risco do ZARC. Ex.: 9 decêndios ≈ 90 dias favoráveis à semeadura. É recomendação oficial (portaria ZARC/MAPA), não garantia de safra.",
    why:
      "A janela de plantio determina quando a safra é semeada e, portanto, quando chega ao mercado. O calendário de colheita é um dos fatores que formam o basis regional e influenciam o prazo de liquidação. Mapear o campo por município é acompanhar a formação da oferta física na origem — o elo entre o agronômico e o financeiro. (Informação analítica; não é recomendação de investimento nem promessa de resultado.)",
  },
];
