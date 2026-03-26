-- ═══════════════════════════════════════════════════════════════
--  B&H Flow — Migração inicial do banco Supabase
--  Execute no SQL Editor do Supabase antes do primeiro deploy.
--  Dashboard: https://supabase.com → seu projeto → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Tabela principal ───────────────────────────────────────
create table if not exists public.registros (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  nome          text        not null,
  telefone      text        not null,
  origem        text        not null default 'Outros',
  status        text        not null default 'novo',
  observacoes   text,
  data_cadastro timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ── 2. Índices de performance ─────────────────────────────────
create index if not exists idx_registros_user_id  on public.registros(user_id);
create index if not exists idx_registros_status   on public.registros(status);
create index if not exists idx_registros_cadastro on public.registros(data_cadastro desc);

-- ── 3. Trigger: atualiza atualizado_em automaticamente ────────
create or replace function public.fn_set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_registros_atualizado_em on public.registros;
create trigger trg_registros_atualizado_em
  before update on public.registros
  for each row execute function public.fn_set_atualizado_em();

-- ── 4. Trigger: injeta user_id no INSERT ─────────────────────
create or replace function public.fn_set_user_id()
returns trigger language plpgsql security definer as $$
begin
  new.user_id = auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_registros_user_id on public.registros;
create trigger trg_registros_user_id
  before insert on public.registros
  for each row execute function public.fn_set_user_id();

-- ── 5. Row Level Security — ISOLAMENTO MULTI-TENANT ──────────
alter table public.registros enable row level security;

create policy "ver_proprios"      on public.registros for select using (auth.uid() = user_id);
create policy "inserir_proprios"  on public.registros for insert with check (auth.uid() = user_id);
create policy "atualizar_proprios" on public.registros for update using (auth.uid() = user_id);
create policy "excluir_proprios"  on public.registros for delete using (auth.uid() = user_id);

-- ── 6. Constraint de status válido ───────────────────────────
alter table public.registros drop constraint if exists chk_status;
alter table public.registros add constraint chk_status check (
  status in ('novo','atendimento','sem_interesse','reuniao','em_processo','aprovado','recusado')
);
