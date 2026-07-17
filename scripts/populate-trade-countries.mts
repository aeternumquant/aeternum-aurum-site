/**
 * Popula public.trade_countries a partir da tabela PAIS do MDIC (a ponte entre o
 * CO_PAIS interno e o ISO que o mapa usa). Roda UMA vez (idempotente por upsert).
 *
 *   npx tsx --env-file=.env scripts/populate-trade-countries.mts
 *
 * Regras (decididas pelo Gabriel):
 *  - ISO placeholder do MDIC (ISOA3 'ZZZ' / ISON3 898) -> NULL nas duas colunas.
 *    Assim o join do mapa exclui naturalmente zonas francas, "Bancos Centrais",
 *    "Provisao de Navios", "Nao Declarados" etc. (nao tem geometria).
 *  - CSV vem em LATIN-1. Decodificar certo (teste: "Sao Tome e Principe" 720).
 *  - Sem normalizacao de nome: name_pt exato, para o casamento nome->codigo da
 *    ingestao ser exato (casar errado e pior que nao casar).
 */
import { PostgrestClient } from "@supabase/postgrest-js";
import { readFileSync } from "node:fs";

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Faltam VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}
const db = new PostgrestClient(`${URL}/rest/v1`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});

const PAIS_URL = "https://balanca.economia.gov.br/balanca/bd/tabelas/PAIS.csv";

/** Campos "..." separados por ; . Nomes de pais nao tem aspas nem ; internos. */
function parseCsvLine(line: string): string[] {
  return [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
}

async function main() {
  // O host balanca.economia.gov.br rejeita o fetch do Node (TLS/UA); o curl
  // funciona. Entao aceitamos um arquivo local (PAIS_CSV=caminho) baixado antes.
  let buf: Buffer;
  const local = process.env.PAIS_CSV;
  if (local) {
    buf = readFileSync(local);
  } else {
    const res = await fetch(PAIS_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (AeternumWorker)" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`PAIS.csv HTTP ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
  }
  const text = buf.toString("latin1"); // <- decodificacao correta do acento

  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const header = parseCsvLine(lines[0]);
  const iCo = header.indexOf("CO_PAIS");
  const iN3 = header.indexOf("CO_PAIS_ISON3");
  const iA3 = header.indexOf("CO_PAIS_ISOA3");
  const iNome = header.indexOf("NO_PAIS");
  if (Math.min(iCo, iN3, iA3, iNome) < 0) throw new Error(`cabecalho inesperado: ${header.join(",")}`);

  const rows = lines
    .slice(1)
    .map(parseCsvLine)
    .filter((f) => f.length >= 4 && f[iCo] !== "")
    .map((f) => {
      const a3 = (f[iA3] ?? "").trim();
      const noIso = a3 === "" || a3 === "ZZZ"; // placeholder do MDIC
      return {
        country_code: parseInt(f[iCo], 10),
        name_pt: f[iNome],
        iso_a3: noIso ? null : a3,
        iso_n3: noIso ? null : parseInt(f[iN3], 10),
      };
    })
    .filter((r) => Number.isFinite(r.country_code));

  const { error } = await db
    .from("trade_countries")
    .upsert(rows, { onConflict: "country_code", ignoreDuplicates: false });
  if (error) throw new Error(`upsert trade_countries: ${error.message}`);

  const withIso = rows.filter((r) => r.iso_a3).length;
  console.log(`trade_countries: ${rows.length} linhas (com ISO ${withIso} / sem ISO ${rows.length - withIso})`);
  const st = rows.find((r) => r.country_code === 720);
  console.log("teste latin-1 (720):", JSON.stringify(st));
}

main().then(() => process.exit(0)).catch((e) => {
  console.error("ERRO:", e?.message ?? e);
  process.exit(1);
});
