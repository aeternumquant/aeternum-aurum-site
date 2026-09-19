/**
 * "HOJE dá pra plantar aqui?" — traduz as janelas de plantio do ZARC (derivadas
 * server-side de janela['20'], ver dias23-map/dia9-janela-plantio.sql) para
 * linguagem de produtor. O decêndio é unidade INTERNA — nunca aparece na frase.
 *
 * ⚠️ Quando há 2+ janelas, é DERIVADO (modelo nosso, não dado do ZARC): quem
 * consome (`derivado: true`) marca a procedência na tela.
 */
export type Janela = [number, number]; // [abre, fecha] em decêndios; abre>fecha = cruza o ano

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const ORDINAIS = ["a primeira janela", "a segunda janela", "a terceira janela"];

/** decêndio civil de hoje (1..36): 1 = 01–10/jan … 36 = 21–31/dez */
export function decendioHoje(base?: Date): number {
  const d = base ?? new Date();
  const dom = Math.min(3, Math.ceil(d.getDate() / 10)); // 3º decêndio absorve dias 21–31
  return d.getMonth() * 3 + dom; // getMonth() é 0-based
}

/** decêndio -> "dd/mês" do 1º dia do decêndio (aproximado — decêndio é período de 10 dias) */
export function decendioData(dec: number): string {
  const m = Math.floor((dec - 1) / 3);
  const dia = ((dec - 1) % 3) * 10 + 1;
  return `${String(dia).padStart(2, "0")}/${MESES[m]}`;
}

const fwd = (a: number, b: number) => (((b - a) % 36) + 36) % 36; // passos p/ frente no anel de 36
const dias = (decs: number) => Math.max(1, Math.round(decs * 10));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export type StatusPlantio = { lines: string[]; derivado: boolean; total: number };

/**
 * @param janelas array de [abre,fecha] (do RPC); [] = sem janela de baixo risco
 * @param riscoMin menor nível de risco com janela (p/ o caso 20% vazio)
 */
export function statusPlantio(
  janelas: Janela[] | null | undefined,
  riscoMin: number | null,
  base?: Date,
): StatusPlantio | null {
  if (!Array.isArray(janelas)) return null;

  // BLINDAGEM: cada janela tem que ser um par [abre,fecha]. Se a forma vier errada
  // (ex. jsonb achatado), retorna null (não renderiza) em vez de frase errada silenciosa.
  const formaOk = janelas.every((j) => Array.isArray(j) && j.length === 2 && typeof j[0] === "number" && typeof j[1] === "number");
  if (!formaOk) return null;

  // 20% vazio: procedência, NUNCA "fora da janela"
  if (janelas.length === 0) {
    return {
      derivado: false,
      total: 0,
      lines: [
        riscoMin
          ? `Sem janela de baixo risco (20%) neste município: a recomendação do ZARC começa em risco de ${riscoMin}%.`
          : "Sem zoneamento de baixo risco neste município.",
      ],
    };
  }

  const hoje = decendioHoje(base);
  const total = janelas.length;
  const derivado = total >= 2;
  const ws = [...janelas].sort((a, b) => a[0] - b[0]); // ordinais em ordem de calendário
  const nome = (i: number) => (total === 1 ? "a janela de plantio" : ORDINAIS[i] ?? `a ${i + 1}ª janela`);

  const dentroIdx = ws.findIndex(([a, f]) => fwd(a, hoje) <= fwd(a, f));
  const lines: string[] = [];

  if (dentroIdx >= 0) {
    const [a, f] = ws[dentroIdx];
    lines.push(`${cap(nome(dentroIdx))} abriu em ${decendioData(a)}. Você está dentro, faltam ~${dias(fwd(hoje, f))} dias para fechar.`);
    ws.forEach(([oa, of_], i) => { if (i !== dentroIdx) lines.push(`Há ${nome(i)}, de ${decendioData(oa)} a ${decendioData(of_)}.`); });
    return { lines, derivado, total };
  }

  // fora de todas: a recém-fechada ganha se estiver mais perto que a próxima a abrir
  let nextI = 0, nextD = 999; ws.forEach(([a], i) => { const dd = fwd(hoje, a); if (dd < nextD) { nextD = dd; nextI = i; } });
  let lastI = 0, lastD = 999; ws.forEach(([, f], i) => { const dd = fwd(f, hoje); if (dd < lastD) { lastD = dd; lastI = i; } });

  if (lastD < nextD) {
    lines.push(`${cap(nome(lastI))} fechou há ~${dias(lastD)} dias (por volta de ${decendioData(ws[lastI][1])}).`);
    const [na, nf] = ws[nextI];
    lines.push(total > 1
      ? `${cap(nome(nextI))} vai de ${decendioData(na)} a ${decendioData(nf)}, abre em ~${dias(nextD)} dias.`
      : `Abre de novo em ~${dias(nextD)} dias (por volta de ${decendioData(na)}).`);
  } else {
    const [na, nf] = ws[nextI];
    lines.push(`${cap(nome(nextI))} abre em ~${dias(nextD)} dias (por volta de ${decendioData(na)}).`);
    ws.forEach(([oa, of_], i) => { if (i !== nextI) lines.push(`Há ${nome(i)}, de ${decendioData(oa)} a ${decendioData(of_)}.`); });
  }
  return { lines, derivado, total };
}
