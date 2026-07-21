-- ============================================================================
-- USGS Mineral Commodity Summaries 2026 — producao/reserva de minerais por
-- pais. RODAR NO SQL EDITOR DO SUPABASE. CC0 (dominio publico); creditamos
-- "USGS MCS 2026" por rigor da casa.
--
-- Unilateral (pais-sujeito: producao/reserva DE cada pais), como o PSD/IBGE —
-- NAO e fluxo bilateral. Tabela SEPARADA; o encontro e no front.
--
-- Honestidade: valor CRU + unidade POR LINHA (terras raras em REO equivalente,
-- nao tonelada simples — nunca assumir). Nome de pais em texto ("China",
-- "Congo (Kinshasa)"); ponte nome->iso curada no script, fallback null (nao
-- quebra, so nao pinta no mapa).
-- ============================================================================

create table if not exists public.usgs_minerals (
  commodity        text        not null,   -- 'Rare Earths', 'Niobium (Columbium)'...
  country          text        not null,   -- nome USGS ('China','Brazil','Congo (Kinshasa)')
  country_iso      text,                    -- iso_a3 via ponte curada; null se nao mapeado
  statistic        text        not null,   -- 'Production','Reserves','Capacity'...
  statistic_detail text,                    -- o Statistics_detail do CSV (pode ser '')
  value            numeric,                 -- valor CRU
  unit             text        not null,   -- 'metric tons' (REO nas terras raras)
  year             int         not null,
  is_critical      boolean,                 -- o "Is critical mineral 2025"
  ingested_at      timestamptz not null default now(),
  -- statistic_detail entra na chave via coalesce (pode ser '' / null); um mineral
  -- tem varias linhas de Production com detail diferente (ex.: por composto).
  constraint usgs_minerals_pk
    unique (commodity, country, statistic, statistic_detail, year)
);

create index if not exists usgs_commodity_idx on public.usgs_minerals (commodity, statistic, year);
create index if not exists usgs_iso_idx        on public.usgs_minerals (commodity, statistic, country_iso);

-- ── RLS + revoke (checklist: TRUNCATE escapa da RLS, revogar junto) ──────────
alter table public.usgs_minerals enable row level security;
revoke insert, update, delete, truncate on public.usgs_minerals from anon, authenticated;
grant select on public.usgs_minerals to anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='usgs_minerals' and policyname='usgs_minerals_read') then
    create policy usgs_minerals_read on public.usgs_minerals for select to anon, authenticated using (true);
  end if;
end $$;

-- ── RPC atomica: delete+insert por COMMODITY na mesma transacao ──────────────
-- O release e um arquivo unico, mas o replace por commodity permite reingestao
-- PARCIAL segura (um mineral por vez) e o release anual reescreve o mineral. O
-- delete limpa o mineral inteiro (todos os paises/stats/anos) antes do insert.
-- Insert falha -> delete volta atras. Mesmo padrao do replace_psd_balances.
create or replace function public.replace_usgs_minerals(
  p_commodity text,
  p_rows      jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  delete from public.usgs_minerals where commodity = p_commodity;

  insert into public.usgs_minerals
    (commodity, country, country_iso, statistic, statistic_detail, value, unit, year, is_critical)
  select p_commodity, r.country, r.country_iso, r.statistic, r.statistic_detail, r.value, r.unit, r.year, r.is_critical
    from jsonb_to_recordset(p_rows) as r(
      country          text,
      country_iso      text,
      statistic        text,
      statistic_detail text,
      value            numeric,
      unit             text,
      year             int,
      is_critical      boolean
    );

  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.replace_usgs_minerals(text, jsonb) from public, anon, authenticated;
grant execute on function public.replace_usgs_minerals(text, jsonb) to service_role;
