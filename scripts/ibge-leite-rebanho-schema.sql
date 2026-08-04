-- ============================================================================
-- IBGE - o par pecuario: PRECO do leite ao produtor + REBANHO. RODAR NO SQL
-- EDITOR DO SUPABASE. Mesma fonte/licenca aberta da PAM/abate (IBGE/SIDRA, Dec.
-- 8.777), tabelas SEPARADAS (pesquisas diferentes, cadencias diferentes):
--
--   ibge_leite_preco  Pesquisa Trimestral do Leite (agregado 1086, variavel
--                     2522 "Preco medio [Reais por litro]"): o preco pago ao
--                     produtor pelo leite cru captado. TRIMESTRAL, N1+N3.
--   ibge_ppm          Pesquisa da Pecuaria Municipal (agregados 3939/94/74): o
--                     plantel fisico. ANUAL, N1+N3, varias metricas numa tabela
--                     (efetivo bovino, vacas ordenhadas, producao/valor de leite).
--
-- Honestidade da CADENCIA: leite e TRIMESTRAL (nao fingir mensal), rebanho e
-- ANUAL. Rotular o trimestre/ano. Preco AO PRODUTOR (receita na porteira), nao
-- cotacao de atacado/hub. Guardar o valor CRU + a unidade que a API devolve.
--
-- CROSS-CHECK (na ingestao): rebanho e QUANTIDADE aditiva -> soma das UF == Brasil
-- (o N3==N1 de sempre). Preco e MEDIA -> as UF NAO somam ao Brasil (Brasil e
-- media ponderada); checar plausibilidade (~2-2,5 R$/litro em 2024), nao soma.
--
-- O par pecuario (base do futuro modelo de colateral, frente de membro/RWA):
-- leite_preco (receita) + ibge_ppm (plantel) + ibge_abate (ja temos) +
-- boi/leite volume. NAO construir o modelo aqui; so os dados.
-- ============================================================================

-- == Preco do leite ao produtor (trimestral, R$/litro; N1 Brasil + N3 UF) =====
create table if not exists public.ibge_leite_preco (
  locality_level text        not null,   -- 'N1' Brasil | 'N3' UF
  locality_code  text        not null,   -- codigo IBGE da localidade
  locality_name  text        not null,   -- 'Brasil', 'Minas Gerais'
  year           int         not null,
  quarter        int         not null,   -- 1..4 (trimestre)
  value          numeric,                 -- preco medio ao produtor [R$/litro]
  unit           text        not null,   -- 'Reais por litro' (o que a API devolve; nunca assumir)
  ibge_table     int         not null default 1086,  -- rastreavel a fonte (agregado)
  ibge_variable  int         not null default 2522,  -- variavel 'Preco medio [R$/litro]'
  ingested_at    timestamptz not null default now(),
  constraint ibge_leite_preco_pk
    unique (locality_level, locality_code, year, quarter)
);
create index if not exists ibge_leite_preco_idx
  on public.ibge_leite_preco (locality_level, year, quarter);

-- == Rebanho / rebanho leiteiro fisico (anual; N1 Brasil + N3 UF) =============
-- Uma tabela, varias metricas (a pesquisa e a mesma PPM; agregados 3939/94/74):
--   efetivo_bovino        3939 var 105 classif 79=2670 [Cabecas]
--   vacas_ordenhadas      94   var 107                 [Cabecas]
--   producao_leite        74   var 106 classif 80=2682 [Mil litros]
--   valor_producao_leite  74   var 215 classif 80=2682 [Mil Reais]
create table if not exists public.ibge_ppm (
  locality_level text        not null,   -- 'N1' | 'N3'
  locality_code  text        not null,
  locality_name  text        not null,
  year           int         not null,
  metric         text        not null,   -- 'efetivo_bovino'|'vacas_ordenhadas'|'producao_leite'|'valor_producao_leite'
  value          numeric,                 -- valor CRU
  unit           text        not null,   -- 'Cabecas' | 'Mil litros' | 'Mil Reais' (o que a API devolve)
  ibge_table     int         not null,   -- 3939 | 94 | 74 (agregado de origem)
  ibge_variable  int         not null,   -- 105 | 107 | 106 | 215
  ingested_at    timestamptz not null default now(),
  constraint ibge_ppm_pk
    unique (locality_level, locality_code, year, metric)
);
create index if not exists ibge_ppm_idx
  on public.ibge_ppm (metric, locality_level, year);

-- == RLS + revoke (checklist da casa: TRUNCATE escapa da RLS, revogar junto) ==
alter table public.ibge_leite_preco enable row level security;
alter table public.ibge_ppm         enable row level security;

revoke insert, update, delete, truncate on public.ibge_leite_preco from anon, authenticated;
revoke insert, update, delete, truncate on public.ibge_ppm         from anon, authenticated;

grant select on public.ibge_leite_preco to anon, authenticated;
grant select on public.ibge_ppm         to anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='ibge_leite_preco' and policyname='ibge_leite_preco_read') then
    create policy ibge_leite_preco_read on public.ibge_leite_preco for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='ibge_ppm' and policyname='ibge_ppm_read') then
    create policy ibge_ppm_read on public.ibge_ppm for select to anon, authenticated using (true);
  end if;
end $$;

-- == RPC atomica: delete+insert na MESMA transacao (o IBGE revisa anos) =======
-- Escopo = tabela inteira: uma ingestao traz a serie toda (N1+N3, todos os
-- periodos, todas as metricas). Insert falha -> delete volta atras. Mesmo padrao
-- do replace_ibge_pam / replace_trade_flows.
create or replace function public.replace_ibge_leite_preco(p_rows jsonb)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  delete from public.ibge_leite_preco;
  insert into public.ibge_leite_preco
    (locality_level, locality_code, locality_name, year, quarter, value, unit, ibge_table, ibge_variable)
  select r.locality_level, r.locality_code, r.locality_name, r.year, r.quarter, r.value, r.unit,
         coalesce(r.ibge_table, 1086), coalesce(r.ibge_variable, 2522)
    from jsonb_to_recordset(p_rows) as r(
      locality_level text, locality_code text, locality_name text,
      year int, quarter int, value numeric, unit text, ibge_table int, ibge_variable int
    );
  get diagnostics n = row_count;
  return n;
end; $$;

create or replace function public.replace_ibge_ppm(p_rows jsonb)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  delete from public.ibge_ppm;
  insert into public.ibge_ppm
    (locality_level, locality_code, locality_name, year, metric, value, unit, ibge_table, ibge_variable)
  select r.locality_level, r.locality_code, r.locality_name, r.year, r.metric, r.value, r.unit, r.ibge_table, r.ibge_variable
    from jsonb_to_recordset(p_rows) as r(
      locality_level text, locality_code text, locality_name text,
      year int, metric text, value numeric, unit text, ibge_table int, ibge_variable int
    );
  get diagnostics n = row_count;
  return n;
end; $$;

revoke all on function public.replace_ibge_leite_preco(jsonb) from public, anon, authenticated;
revoke all on function public.replace_ibge_ppm(jsonb)         from public, anon, authenticated;
grant execute on function public.replace_ibge_leite_preco(jsonb) to service_role;
grant execute on function public.replace_ibge_ppm(jsonb)         to service_role;
