-- ============================================================================
-- USDA PSD (Production, Supply & Distribution) — balanço interno por país.
-- RODAR NO SQL EDITOR DO SUPABASE (o Gabriel roda; a ingestão vem depois).
--
-- Tabela SEPARADA do trade_flows: o PSD é UNILATERAL (país-sujeito: a produção
-- DO Brasil), o trade_flows é BILATERAL (Brasil -> China). Não fundir; o
-- encontro é no front, cada um com seu eixo de tempo (safra USDA vs mês civil).
--
-- Régua do Gabriel: guardar TODOS os atributos (85) e TODOS os países de cada
-- commodity-ano (o country/all/year traz tudo numa chamada, é barato). Filtrar
-- só por COMMODITY (as 9 do mapa que existem no PSD).
--
-- Honestidade dos números: guardar o valor CRU (em milhares) + o unit_id POR
-- LINHA. Nada de assumir tonelada (algodão vem em fardos de 480 lb, café em
-- sacas de 60 kg, carne em MT-equivalente-carcaça). A conversão é no front.
-- marketYear guardado CRU (string do PSD, "2024" = safra 2024/25). Sem
-- converter para ano civil (isso seria reatribuição).
-- ============================================================================

-- ── Tabelas de referência (metadados, ingeridas 1x pelo script) ─────────────
create table if not exists public.psd_commodities (
  commodity_code text primary key,          -- '2222000' (só as 9 alvo)
  name           text not null
);

create table if not exists public.psd_attributes (
  attribute_id   int  primary key,          -- 28 Production, 125 Dom. Consumption...
  name           text not null
);

create table if not exists public.psd_units (
  unit_id        int  primary key,          -- 8 '(1000 MT)', 27 '1000 480lb Bales'...
  name           text not null
);

-- ── Tabela do balanço (o dado) ──────────────────────────────────────────────
create table if not exists public.psd_balances (
  commodity_code text        not null,      -- código PSD
  country_code   text        not null,      -- 2-letras USDA ('BR')
  iso_a3         text,                       -- gencCode ('BRA') p/ join com geometria; null nos agregados
  market_year    int         not null,      -- rótulo cru (2024), SEM conversão
  attribute_id   int         not null,      -- TODOS os atributos (guardar tudo)
  value          numeric,                    -- valor cru, em MILHARES
  unit_id        int         not null,      -- unidade POR LINHA (o algodão-em-fardos exige)
  ingested_at    timestamptz not null default now(),
  constraint psd_balances_pk
    unique (commodity_code, country_code, market_year, attribute_id)
);

-- índices: o escopo do delete da RPC (commodity, ano) e o join do front (iso, ano)
create index if not exists psd_balances_scope_idx on public.psd_balances (commodity_code, market_year);
create index if not exists psd_balances_iso_idx   on public.psd_balances (iso_a3, market_year);
create index if not exists psd_balances_attr_idx  on public.psd_balances (commodity_code, attribute_id, market_year);

-- (sem FK de attribute_id/unit_id -> ref: a USDA pode introduzir um id novo e a
--  ingestão de dado NÃO pode quebrar por isso. As ref servem de lookup no front.
--  commodity_code também sem FK: a ingestão do balanço não depende da ordem.)

-- ── RLS + revoke de escrita (checklist da casa: revogar o grant que nasce) ───
alter table public.psd_commodities enable row level security;
alter table public.psd_attributes  enable row level security;
alter table public.psd_units       enable row level security;
alter table public.psd_balances    enable row level security;

-- leitura pública (o mapa lê produção/consumo); escrita só service_role (bypassa RLS)
revoke insert, update, delete, truncate on public.psd_commodities from anon, authenticated;
revoke insert, update, delete, truncate on public.psd_attributes  from anon, authenticated;
revoke insert, update, delete, truncate on public.psd_units        from anon, authenticated;
revoke insert, update, delete, truncate on public.psd_balances     from anon, authenticated;

grant select on public.psd_commodities to anon, authenticated;
grant select on public.psd_attributes  to anon, authenticated;
grant select on public.psd_units        to anon, authenticated;
grant select on public.psd_balances     to anon, authenticated;

do $$
begin
  -- policies idempotentes (select liberado; sem policy de escrita = nada escreve via RLS)
  if not exists (select 1 from pg_policies where tablename='psd_commodities' and policyname='psd_commodities_read') then
    create policy psd_commodities_read on public.psd_commodities for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='psd_attributes' and policyname='psd_attributes_read') then
    create policy psd_attributes_read on public.psd_attributes for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='psd_units' and policyname='psd_units_read') then
    create policy psd_units_read on public.psd_units for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='psd_balances' and policyname='psd_balances_read') then
    create policy psd_balances_read on public.psd_balances for select to anon, authenticated using (true);
  end if;
end $$;

-- ── RPC atômica: delete+insert por (commodity, ano) na MESMA transação ───────
-- Mesmo padrão do replace_trade_flows. O country/all/year traz o ano inteiro;
-- a USDA revisa anos anteriores, então o delete limpa o escopo antes do insert
-- (upsert deixaria país removido para sempre). Insert falha -> delete volta atrás.
create or replace function public.replace_psd_balances(
  p_commodity_code text,
  p_market_year    int,
  p_rows           jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  delete from public.psd_balances
   where commodity_code = p_commodity_code
     and market_year    = p_market_year;

  insert into public.psd_balances
    (commodity_code, country_code, iso_a3, market_year, attribute_id, value, unit_id)
  select p_commodity_code, r.country_code, r.iso_a3, p_market_year, r.attribute_id, r.value, r.unit_id
    from jsonb_to_recordset(p_rows) as r(
      country_code text,
      iso_a3       text,
      attribute_id int,
      value        numeric,
      unit_id      int
    );

  get diagnostics n = row_count;
  return n;
end;
$$;

-- a RPC roda como definer; só o service_role a chama (a ingestão). Fecha p/ o resto.
revoke all on function public.replace_psd_balances(text, int, jsonb) from public, anon, authenticated;
grant execute on function public.replace_psd_balances(text, int, jsonb) to service_role;
