-- ============================================================================
-- OPCOES SOBRE FUTUROS AGRO (brapi Pro) -> public.opcoes_futuros
-- RODAR NO SQL EDITOR DO SUPABASE (o Gabriel roda). Ingestao: scripts/
-- ingest-opcoes-backfill.mts (carga inicial) + ingest-opcoes-daily.mts (diario).
--
-- FONTE: brapi.dev /api/v2/futures/options/{analytics,analytics/history,positions}
--   BGI (boi), ICF (cafe), CCM (milho), SJC (soja). Uma linha por (data, opcao).
--
-- 🔒 LICENCA (brapi, clausula 2): USO INTERNO — modelo, backtest, research. E
--   VEDADO redistribuir, revender ou EXIBIR PUBLICAMENTE. Por isso esta tabela,
--   ao contrario das ibge_/psd_/etc., NAO da SELECT a anon/authenticated: so o
--   service_role le (server-side, research). Nao criar rota/endpoint/componente
--   publico servindo esse dado.
--
-- ⚠️ ARMADILHAS (entram na lista da casa, junto com "cana != acucar" e
--   "ROM != metal contido"):
--   1. MOEDA: currency mistura BRL (BGI, CCM) e USD (ICF, SJC) na MESMA tabela.
--      Uma IV de ICF nao e comparavel a uma de BGI sem tratamento; qualquer
--      agregacao que some os quatro sem converter esta ERRADA. (COMMENT abaixo.)
--   2. IV em FRACAO (0,32 = 32%), como vem da brapi — nao percentual.
--   3. OPEN INTEREST tem DATA PROPRIA: a analytics fecha ~D-2/D-3 e o positions
--      ~D-1. open_interest_date != date. Casar por symbol sem olhar data mistura
--      observacoes de dias diferentes. Por isso o OI vem em coluna com sua data.
--   4. Historico (analytics/history) NAO traz OI (openInterest=null); o OI so
--      existe no snapshot corrente (/positions), preenchido para frente no diario.
-- ============================================================================

create table if not exists public.opcoes_futuros (
  date                     date        not null,  -- data da observacao de analytics (EOD)
  symbol                   text        not null,  -- simbolo da opcao (ex.: BGIU26C035750)
  underlying               text        not null,  -- 'BGI' | 'ICF' | 'CCM' | 'SJC'
  option_type              text        not null,  -- 'call' | 'put'
  strike                   numeric     not null,
  expiration_date          date        not null,  -- vencimento da opcao
  -- precos + gregas (do model cox-ross-rubinstein-futures)
  option_price             numeric,               -- premio
  underlying_price         numeric,               -- preco do FUTURO subjacente na data (moneyness)
  implied_volatility       numeric,               -- IV em FRACAO (0,32 = 32%)
  delta                    numeric,
  gamma                    numeric,
  theta                    numeric,
  vega                     numeric,
  rho                      numeric,
  time_to_expiration_years numeric,
  risk_free_rate           numeric,
  model                    text,                  -- 'cox-ross-rubinstein-futures'
  price_source             text,                  -- 'referencePrice'
  confidence               text,                  -- flag de liquidez da propria brapi ('low'...)
  contract_multiplier      numeric,               -- BGI 330, CCM 450, ICF 100, SJC 450
  currency                 text        not null,  -- 'BRL' (BGI,CCM) | 'USD' (ICF,SJC) — ARMADILHA
  quotation_type           text,                  -- 'price' (sem armadilha DI1/DAP de taxa)
  -- open interest (do /positions) — DATA PROPRIA, separada da date de analytics
  open_interest            numeric,
  open_interest_change     numeric,
  open_interest_date       date,                  -- data do OI (/positions reportDate)
  ingested_at              timestamptz not null default now(),
  constraint opcoes_futuros_pk primary key (date, symbol)
);

create index if not exists opcoes_futuros_und_idx on public.opcoes_futuros (underlying, expiration_date, date);
create index if not exists opcoes_futuros_sym_idx on public.opcoes_futuros (symbol);
create index if not exists opcoes_futuros_date_idx on public.opcoes_futuros (date);

comment on table public.opcoes_futuros is
  'Opcoes sobre futuros agro (brapi Pro): BGI/ICF/CCM/SJC. USO INTERNO (licenca brapi cl.2): modelo/backtest/research, NAO servir publicamente. ARMADILHA moeda: currency mistura BRL (BGI,CCM) e USD (ICF,SJC) — nao agregar/comparar IV entre moedas sem tratar. IV em FRACAO. OI com data propria (open_interest_date != date).';
comment on column public.opcoes_futuros.currency is
  'BRL (BGI,CCM) ou USD (ICF,SJC). ARMADILHA: nao comparar/agregar entre moedas sem converter.';
comment on column public.opcoes_futuros.implied_volatility is 'FRACAO (0,32 = 32%), como vem da brapi. Nao percentual.';
comment on column public.opcoes_futuros.date is 'Data da observacao de analytics (EOD). Distinta de open_interest_date.';
comment on column public.opcoes_futuros.open_interest_date is 'Data do OI (/positions reportDate) — SEPARADA de date. Casar por symbol sem olhar data mistura dias.';

-- ── Seguranca (checklist da casa + trava de licenca) ────────────────────────
alter table public.opcoes_futuros enable row level security;
-- Escrita travada para todos exceto service_role (que bypassa RLS).
revoke insert, update, delete, truncate on public.opcoes_futuros from anon, authenticated;
-- LICENCA: SEM select para anon/authenticated (diferente das outras tabelas).
-- RLS habilitado + nenhuma policy = so o service_role le. Revoke explicito por seguranca.
revoke select on public.opcoes_futuros from anon, authenticated;

-- ── RPC de UPSERT (idempotente, resumivel) — NAO TRUNCATE ───────────────────
-- Serie que CRESCE (1 ano de backfill em lotes de horas + append diario). TRUNCATE
-- apagaria o historico a cada retomada/dia (viola "dado descartado nao volta").
-- Upsert on conflict (date,symbol): rerodar nao duplica (idempotente) e retomar
-- so atualiza a linha. Sem DELETE (o sql_safe_updates nao dispara). security definer,
-- execute so service_role.
create or replace function public.upsert_opcoes_futuros(p_rows jsonb)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  insert into public.opcoes_futuros (
    date, symbol, underlying, option_type, strike, expiration_date,
    option_price, underlying_price, implied_volatility, delta, gamma, theta, vega, rho,
    time_to_expiration_years, risk_free_rate, model, price_source, confidence,
    contract_multiplier, currency, quotation_type,
    open_interest, open_interest_change, open_interest_date)
  select
    r.date, r.symbol, r.underlying, r.option_type, r.strike, r.expiration_date,
    r.option_price, r.underlying_price, r.implied_volatility, r.delta, r.gamma, r.theta, r.vega, r.rho,
    r.time_to_expiration_years, r.risk_free_rate, r.model, r.price_source, r.confidence,
    r.contract_multiplier, r.currency, r.quotation_type,
    r.open_interest, r.open_interest_change, r.open_interest_date
  from jsonb_to_recordset(p_rows) as r(
    date date, symbol text, underlying text, option_type text, strike numeric, expiration_date date,
    option_price numeric, underlying_price numeric, implied_volatility numeric, delta numeric, gamma numeric,
    theta numeric, vega numeric, rho numeric, time_to_expiration_years numeric, risk_free_rate numeric,
    model text, price_source text, confidence text, contract_multiplier numeric, currency text, quotation_type text,
    open_interest numeric, open_interest_change numeric, open_interest_date date)
  on conflict (date, symbol) do update set
    option_price = excluded.option_price, underlying_price = excluded.underlying_price,
    implied_volatility = excluded.implied_volatility, delta = excluded.delta, gamma = excluded.gamma,
    theta = excluded.theta, vega = excluded.vega, rho = excluded.rho,
    time_to_expiration_years = excluded.time_to_expiration_years, risk_free_rate = excluded.risk_free_rate,
    confidence = excluded.confidence,
    -- OI: so sobrescreve quando a nova linha TEM OI (o backfill/history vem sem OI;
    -- nao apagar o OI que o diario ja gravou).
    open_interest = coalesce(excluded.open_interest, public.opcoes_futuros.open_interest),
    open_interest_change = coalesce(excluded.open_interest_change, public.opcoes_futuros.open_interest_change),
    open_interest_date = coalesce(excluded.open_interest_date, public.opcoes_futuros.open_interest_date),
    ingested_at = now();
  get diagnostics n = row_count;
  return n;
end; $$;
revoke all on function public.upsert_opcoes_futuros(jsonb) from public, anon, authenticated;
grant execute on function public.upsert_opcoes_futuros(jsonb) to service_role;

-- ============================================================================
-- VERIFICACAO — rodar em CHAMADAS SEPARADAS (empilhar mostra so o ultimo result)
-- ============================================================================
-- select count(*) from public.opcoes_futuros;
-- select underlying, count(*), min(date), max(date) from public.opcoes_futuros group by underlying order by underlying;
-- select * from public.opcoes_futuros order by date desc, symbol limit 5;
-- select has_table_privilege('anon','public.opcoes_futuros','SELECT') as anon_pode_ler;  -- deve ser false
