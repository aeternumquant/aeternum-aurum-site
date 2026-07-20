-- ============================================================================
-- IBGE — producao brasileira de campo. RODAR NO SQL EDITOR DO SUPABASE.
--
-- Duas fontes, tabelas SEPARADAS (nao fundir com USDA nem Comex; o encontro e
-- no front):
--   ibge_pam   — Producao Agricola Municipal (agregado 5457): producao/area/
--                rendimento por produto x localidade x ano. TONELADAS PURAS
--                (o USDA era 1000 MT — fator 1000; guardar cru + unidade).
--   ibge_abate — Pesquisa Trimestral do Abate (1092 bovino / 1094 frango):
--                peso de carcaca [kg], somado por ano (comparavel ao MT CWE).
--
-- Honestidade do ESTAGIO (decisao do Gabriel): guardamos IBGE de TODOS os 10
-- produtos, mas o CARD so confronta com o USDA onde medem o mesmo estagio
-- (grao vs grao). Cana!=acucar, caroco!=pluma, casca!=beneficiado ficam no
-- banco, fora do card publico. Cacau/laranja: so IBGE (o USDA nao tem).
-- ============================================================================

-- ── PAM: producao agricola (produto x localidade x ano x variavel) ──────────
create table if not exists public.ibge_pam (
  product_slug   text        not null,   -- nosso slug ('soja','cacau') via mapa manual
  ibge_code      int         not null,   -- 40138 etc — rastreavel a fonte
  locality_level text        not null,   -- 'N1' Brasil | 'N3' estado
  locality_code  text        not null,   -- codigo IBGE da localidade
  locality_name  text        not null,   -- 'Brasil', 'Goias'
  year           int         not null,
  variable_id    int         not null,   -- 214 producao, 216 area colhida, 112 rendimento
  value          numeric,                 -- valor CRU (toneladas puras p/ producao)
  unit           text        not null,   -- 'Toneladas' | 'Hectares' | 'Quilogramas por Hectare'
  ingested_at    timestamptz not null default now(),
  constraint ibge_pam_pk
    unique (product_slug, locality_level, locality_code, year, variable_id)
);

create index if not exists ibge_pam_slug_idx on public.ibge_pam (product_slug, variable_id, locality_level, year);
create index if not exists ibge_pam_year_idx on public.ibge_pam (product_slug, year, locality_level);

-- ── Abate: peso de carcaca agregado por ano ─────────────────────────────────
create table if not exists public.ibge_abate (
  species      text        not null,     -- 'bovino' | 'frango'
  year         int         not null,
  carcass_kg   numeric,                   -- soma dos 4 trimestres do ano [kg]
  quarters     int,                        -- quantos trimestres somados (4 = ano completo)
  ingested_at  timestamptz not null default now(),
  constraint ibge_abate_pk unique (species, year)
);

-- ── RLS + revoke (checklist da casa: TRUNCATE escapa da RLS, revogar junto) ──
alter table public.ibge_pam   enable row level security;
alter table public.ibge_abate enable row level security;

revoke insert, update, delete, truncate on public.ibge_pam   from anon, authenticated;
revoke insert, update, delete, truncate on public.ibge_abate from anon, authenticated;

grant select on public.ibge_pam   to anon, authenticated;
grant select on public.ibge_abate to anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='ibge_pam' and policyname='ibge_pam_read') then
    create policy ibge_pam_read on public.ibge_pam for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='ibge_abate' and policyname='ibge_abate_read') then
    create policy ibge_abate_read on public.ibge_abate for select to anon, authenticated using (true);
  end if;
end $$;

-- ── RPC atomica: delete+insert do escopo de UM produto na MESMA transacao ────
-- O IBGE revisa anos anteriores; o delete limpa o produto inteiro (todos os
-- anos/localidades/variaveis) antes do insert. Escopo = product_slug (uma
-- ingestao por produto traz N1+N3, 1990-2024, as 3 variaveis). Insert falha ->
-- delete volta atras. Mesmo padrao do replace_trade_flows / replace_psd_balances.
create or replace function public.replace_ibge_pam(
  p_product_slug text,
  p_rows         jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  delete from public.ibge_pam where product_slug = p_product_slug;

  insert into public.ibge_pam
    (product_slug, ibge_code, locality_level, locality_code, locality_name, year, variable_id, value, unit)
  select p_product_slug, r.ibge_code, r.locality_level, r.locality_code, r.locality_name, r.year, r.variable_id, r.value, r.unit
    from jsonb_to_recordset(p_rows) as r(
      ibge_code      int,
      locality_level text,
      locality_code  text,
      locality_name  text,
      year           int,
      variable_id    int,
      value          numeric,
      unit           text
    );

  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.replace_ibge_pam(text, jsonb) from public, anon, authenticated;
grant execute on function public.replace_ibge_pam(text, jsonb) to service_role;

-- abate e pequeno (2 especies x ~28 anos = 56 linhas): upsert direto via a
-- UNIQUE, sem RPC. O service_role (ingestao) grava; anon so le.
