-- =========================================================
-- ESQUEMA DO BANCO DE DADOS — Ateliê de Acompanhamento de Obras
-- Execute este script no SQL Editor do Supabase (Project > SQL Editor)
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- Tabela principal: obras
-- ---------------------------------------------------------
create table if not exists obras (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  cliente_nome text not null,
  cliente_email text,
  token_acesso uuid not null default uuid_generate_v4() unique,
  status_atual text not null default 'Esboço',
  percentual_conclusao int not null default 0 check (percentual_conclusao between 0 and 100),
  estimativa_conclusao date,
  orcamento_total numeric(12,2) default 0,
  custo_materiais numeric(12,2) default 0,
  descricao text,
  observacoes text,
  exibir_custos boolean not null default false,
  imagem_referencia_url text,
  imagem_obra_atual_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column obras.status_atual is
  'Um de: Esboço, Imprimatura, Blocagem, Pintura, Detalhamento final, Concluída';

-- ---------------------------------------------------------
-- Migração: novas colunas de entrega e de rótulos internos
-- ---------------------------------------------------------
alter table obras add column if not exists entrega_status text;
alter table obras add column if not exists rotulos text[] not null default '{}';

comment on column obras.entrega_status is
  'Um de: Secagem, Embalada, Enviada. NULL = obra ainda no ateliê.';
comment on column obras.rotulos is
  'Rótulos internos do artista (ex: "pagamento atrasado", "prioridade").';

-- Renomeia os status antigos para os novos nomes (mapeamento posicional),
-- tanto na obra quanto no histórico da linha do tempo.
update obras set status_atual = case status_atual
  when 'Pintura em andamento' then 'Blocagem'
  when 'Retoques finais' then 'Pintura'
  else status_atual
end;

update historico_status set status_novo = case status_novo
  when 'Pintura em andamento' then 'Blocagem'
  when 'Retoques finais' then 'Pintura'
  else status_novo
end;

update historico_status set status_anterior = case status_anterior
  when 'Pintura em andamento' then 'Blocagem'
  when 'Retoques finais' then 'Pintura'
  else status_anterior
end;

-- ---------------------------------------------------------
-- Materiais utilizados em cada obra
-- ---------------------------------------------------------
create table if not exists materiais (
  id uuid primary key default uuid_generate_v4(),
  obra_id uuid not null references obras(id) on delete cascade,
  nome text not null,
  quantidade numeric(10,2) not null default 1,
  custo_unitario numeric(12,2) not null default 0,
  fornecedor text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Histórico de mudanças de status (linha do tempo)
-- ---------------------------------------------------------
create table if not exists historico_status (
  id uuid primary key default uuid_generate_v4(),
  obra_id uuid not null references obras(id) on delete cascade,
  status_anterior text,
  status_novo text not null,
  observacao text,
  data_mudanca timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Fotos de progresso da obra
-- ---------------------------------------------------------
create table if not exists fotos_progresso (
  id uuid primary key default uuid_generate_v4(),
  obra_id uuid not null references obras(id) on delete cascade,
  url_foto text not null,
  legenda text,
  etapa text,
  data_upload timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Trigger: atualiza updated_at e recalcula custo_materiais
-- ---------------------------------------------------------
create or replace function trg_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on obras;
create trigger set_updated_at
before update on obras
for each row execute procedure trg_set_updated_at();

create or replace function trg_recalcular_custo_materiais()
returns trigger as $$
begin
  update obras set custo_materiais = (
    select coalesce(sum(quantidade * custo_unitario), 0)
    from materiais where obra_id = coalesce(new.obra_id, old.obra_id)
  )
  where id = coalesce(new.obra_id, old.obra_id);
  return null;
end;
$$ language plpgsql;

drop trigger if exists recalc_custo_insert on materiais;
create trigger recalc_custo_insert
after insert or update or delete on materiais
for each row execute procedure trg_recalcular_custo_materiais();

-- Trigger: sempre que status_atual mudar, registra no histórico automaticamente
create or replace function trg_registrar_historico_status()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into historico_status (obra_id, status_anterior, status_novo)
    values (new.id, null, new.status_atual);
  elsif (new.status_atual is distinct from old.status_atual) then
    insert into historico_status (obra_id, status_anterior, status_novo)
    values (new.id, old.status_atual, new.status_atual);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists registrar_historico on obras;
create trigger registrar_historico
after insert or update on obras
for each row execute procedure trg_registrar_historico_status();

-- ---------------------------------------------------------
-- Índices úteis
-- ---------------------------------------------------------
create index if not exists idx_obras_token on obras(token_acesso);
create index if not exists idx_materiais_obra on materiais(obra_id);
create index if not exists idx_historico_obra on historico_status(obra_id);
create index if not exists idx_fotos_obra on fotos_progresso(obra_id);

-- ---------------------------------------------------------
-- Row Level Security (RLS)
-- A aplicação usa a chave "anon" apenas para LEITURA pública via token
-- (o filtro por token é feito na query do client). Todas as escritas do
-- painel admin passam pela Service Role Key no servidor, que ignora RLS.
-- ---------------------------------------------------------
alter table obras enable row level security;
alter table materiais enable row level security;
alter table historico_status enable row level security;
alter table fotos_progresso enable row level security;

-- Leitura pública (necessária para a página /acompanhar/[token] e Realtime)
drop policy if exists "Leitura publica obras" on obras;
create policy "Leitura publica obras" on obras for select using (true);

drop policy if exists "Leitura publica materiais" on materiais;
create policy "Leitura publica materiais" on materiais for select using (true);

drop policy if exists "Leitura publica historico" on historico_status;
create policy "Leitura publica historico" on historico_status for select using (true);

drop policy if exists "Leitura publica fotos" on fotos_progresso;
create policy "Leitura publica fotos" on fotos_progresso for select using (true);

-- Nenhuma policy de INSERT/UPDATE/DELETE é criada para a role "anon":
-- por padrão, com RLS ativo e sem policy correspondente, essas operações
-- são bloqueadas para o client público. Somente a Service Role (usada nas
-- rotas /admin no servidor) pode escrever.

-- ---------------------------------------------------------
-- Storage: buckets para imagens (execute também via SQL ou pelo Dashboard)
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('referencias', 'referencias', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('progresso', 'progresso', true)
on conflict (id) do nothing;

-- Políticas de storage: leitura pública, escrita apenas autenticada/service role
drop policy if exists "Leitura publica referencias" on storage.objects;
create policy "Leitura publica referencias" on storage.objects
  for select using (bucket_id = 'referencias');

drop policy if exists "Leitura publica progresso" on storage.objects;
create policy "Leitura publica progresso" on storage.objects
  for select using (bucket_id = 'progresso');

-- Habilitar Realtime nas tabelas usadas pela página do cliente.
-- (DO block para compatibilidade com todas as versões do Postgres, já que
-- "add table if not exists" só existe a partir do PostgreSQL 15.)
do $$
declare
  t text;
begin
  foreach t in array array['obras','historico_status','fotos_progresso','materiais']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;
