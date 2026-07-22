-- ============================================================================
-- futures_curve — a CURVA de vencimentos (estrutura a termo) dos futuros B3.
-- RODAR NO SQL EDITOR DO SUPABASE.
--
-- O PORQUE (auditoria): a brapi devolve os 7 contratos da curva numa chamada
-- (SJCQ26, SJCU26, ...); o worker guardava SO o front month na observations e
-- jogava 6 fora A CADA RUN — destruindo o contango/backwardation. Agora
-- guardamos os 7, com settlement/close/volume/oscilacao/vencimento por contrato.
--
-- OPCAO A (tabela nova, isola o risco): a observations fica INTACTA (o front
-- month que o card de preco ja le); a curva vive aqui. Nada que funciona quebra.
--
-- A curva se constroi a partir de HOJE: a brapi da o snapshot atual, nao o
-- historico dos vencimentos. Cada coleta grava a curva do dia (trade_date).
-- ============================================================================

create table if not exists public.futures_curve (
  series_code     text        not null,   -- 'SOJA_FUT', 'MILHO_FUT'... (como o front ja consulta)
  trade_date      date        not null,   -- pregao de referencia da coleta (o front month)
  contract_symbol text        not null,   -- 'SJCQ26'
  expiration_date date        not null,   -- vencimento do contrato
  settlement      numeric,                 -- preco de ajuste (o oficial; sempre preenchido)
  close           numeric,                 -- ultimo negocio (pode ser null em contrato iliquido)
  volume          numeric,                 -- contratos negociados no dia (liquidez)
  oscillation_pct numeric,                 -- variacao % do dia (da brapi, que descartavamos)
  currency        text,                    -- 'USD' | 'BRL' (moeda de negociacao)
  ingested_at     timestamptz not null default now(),
  constraint futures_curve_pk
    unique (series_code, trade_date, contract_symbol)
);

-- o front le a curva mais recente de uma commodity: (series_code, trade_date desc)
create index if not exists futures_curve_idx on public.futures_curve (series_code, trade_date desc, expiration_date);

-- ── RLS + revoke (checklist: TRUNCATE escapa da RLS, revogar junto) ──────────
alter table public.futures_curve enable row level security;
revoke insert, update, delete, truncate on public.futures_curve from anon, authenticated;
grant select on public.futures_curve to anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='futures_curve' and policyname='futures_curve_read') then
    create policy futures_curve_read on public.futures_curve for select to anon, authenticated using (true);
  end if;
end $$;

-- Escrita: so o service_role (o worker). O upsert e por (series_code, trade_date,
-- contract_symbol) via a UNIQUE — 7 linhas por coleta; re-rodar no mesmo dia
-- ATUALIZA (nao duplica). Sem RPC propria (como o ibge_abate): a UNIQUE basta,
-- e nenhum contrato "some" dentro do mesmo trade_date. O service_role bypassa a
-- RLS; anon so le.
