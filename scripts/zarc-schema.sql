-- ============================================================================
-- ZARC (Zoneamento Agricola de Risco Climatico, Embrapa/MAPA; licenca CC BY).
-- RODAR NO SQL EDITOR DO SUPABASE. Tabela COMPACTA: colapsa o grao cru do ZARC
-- (cultura x ciclo x solo x manejo x clima x municipio, ~3,2M linhas so a safra
-- atual -> NAO cabe no Free) para (cultura x municipio x manejo), com a janela
-- de plantio COMPACTADA num jsonb (nao as 36 colunas dec1..dec36). Alvo ~50-80MB.
--
-- REGRA DE COLAPSO (documentada): para cada (cod_cultura, geocodigo, cod_manejo,
-- safra), sobre TODAS as linhas cruas (varios ciclos/solos/climas), para cada
-- decendio pega-se o MELHOR (menor) nivel de risco em que aquele decendio e apto
-- (o mais favoravel entre os ciclos/solos daquele par). O jsonb `janela`
-- particiona os decendios aptos por esse nivel: {"20":[...],"30":[...],"40":[...]}.
-- Principal = a janela a 20% (menor risco); a mais LARGA vai ate 40% (uniao dos
-- tres). risco_min = o menor nivel com janela (p/ ordenar "menor risco primeiro");
-- dec_ini/dec_fim = 1o/ultimo decendio apto em qualquer nivel (a "estacao").
--
-- HONESTIDADE (a trava): e RISCO CLIMATICO / recomendacao oficial (portaria do
-- ZARC no D.O.U.), NAO garantia de safra. 20/30/40 = probabilidade de perda por
-- clima. Decendio 1..36 = periodo de 10 dias do ano civil (dec1 = 01-10/jan ...
-- dec36 = 21-31/dez); a ingestao traduz para data legivel na UI.
-- ============================================================================

create table if not exists public.zarc_aptidao (
  cod_cultura  text        not null,   -- codigo da cultura zoneada (rastreavel)
  nome_cultura text        not null,   -- 'Soja', 'Cafe Arabica Producao', ...
  geocodigo    text        not null,   -- codigo IBGE do municipio (7 digitos)
  uf           text        not null,
  municipio    text        not null,
  cod_meso     text,                   -- mesorregiao IBGE (agregacao futura)
  cod_micro    text,                   -- microrregiao IBGE
  cod_manejo   int         not null,   -- 1 Sequeiro | 2 Irrigado | 3 Irrigado c/ controle de geada
  nome_manejo  text        not null,
  janela       jsonb       not null,   -- {"20":[decs],"30":[decs],"40":[decs]} decendios aptos por nivel de risco (uniao dos ciclos/solos)
  risco_min    int,                    -- menor nivel (20/30/40) com janela; ordenar "menor risco primeiro"
  dec_ini      int,                    -- 1o decendio apto (qualquer nivel) — a "estacao de plantio"
  dec_fim      int,                    -- ultimo decendio apto
  safra        text        not null,   -- '2024/2025' | 'perene' (safra de referencia)
  portaria     text,                   -- numero/data da portaria (rastreabilidade a fonte oficial)
  ingested_at  timestamptz not null default now(),
  constraint zarc_aptidao_pk unique (cod_cultura, geocodigo, cod_manejo, safra)
);

-- consulta REVERSA por municipio (a superficie desta rodada) + filtro por cultura
create index if not exists zarc_aptidao_geo_idx  on public.zarc_aptidao (geocodigo);
create index if not exists zarc_aptidao_cult_idx on public.zarc_aptidao (cod_cultura);

-- == RLS + revoke (checklist da casa: TRUNCATE escapa da RLS, revogar junto) ==
alter table public.zarc_aptidao enable row level security;
revoke insert, update, delete, truncate on public.zarc_aptidao from anon, authenticated;
grant select on public.zarc_aptidao to anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='zarc_aptidao' and policyname='zarc_aptidao_read') then
    create policy zarc_aptidao_read on public.zarc_aptidao for select to anon, authenticated using (true);
  end if;
end $$;

-- == RPC de ingestao em LOTES (a tabela e grande: ~345-500k linhas nao cabem num
-- unico payload PostgREST). p_truncate=true no 1o lote (TRUNCATE, nao DELETE: o
-- sql_safe_updates rejeita DELETE sem WHERE e 'where true' e dobrado pelo planner
-- — licao do replace_ibge_*), false nos demais (append). security definer roda
-- como owner (tem TRUNCATE; o revoke so tira de anon/authenticated). ==
create or replace function public.replace_zarc_aptidao(p_rows jsonb, p_truncate boolean default true)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if p_truncate then
    truncate table public.zarc_aptidao;
  end if;
  insert into public.zarc_aptidao
    (cod_cultura, nome_cultura, geocodigo, uf, municipio, cod_meso, cod_micro, cod_manejo, nome_manejo, janela, risco_min, dec_ini, dec_fim, safra, portaria)
  select r.cod_cultura, r.nome_cultura, r.geocodigo, r.uf, r.municipio, r.cod_meso, r.cod_micro, r.cod_manejo, r.nome_manejo, r.janela, r.risco_min, r.dec_ini, r.dec_fim, r.safra, r.portaria
    from jsonb_to_recordset(p_rows) as r(
      cod_cultura text, nome_cultura text, geocodigo text, uf text, municipio text,
      cod_meso text, cod_micro text, cod_manejo int, nome_manejo text,
      janela jsonb, risco_min int, dec_ini int, dec_fim int, safra text, portaria text
    );
  get diagnostics n = row_count;
  return n;
end; $$;

revoke all on function public.replace_zarc_aptidao(jsonb, boolean) from public, anon, authenticated;
grant execute on function public.replace_zarc_aptidao(jsonb, boolean) to service_role;
