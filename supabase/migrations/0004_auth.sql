-- ============================================================================
-- JM Design — Gestión Legal · Cuentas y acceso temporal (Supabase Auth)
-- perfiles: 1-1 con auth.users. Guarda username, rol y vencimiento de acceso.
-- Login real va por Supabase Auth con email fantasma (usuario@jmdesign.local).
-- RLS: cada usuario solo LEE su propio perfil. Las escrituras (crear cuentas,
-- extender, desactivar) son SOLO server-side con service_role + chequeo admin.
-- ============================================================================

create table if not exists public.perfiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text not null unique,
  rol           text not null default 'cliente' check (rol in ('admin','cliente')),
  acceso_hasta  timestamptz,          -- NULL = sin vencimiento
  activo        boolean not null default true,
  creado_por    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_perfiles_username on public.perfiles(username);

drop trigger if exists trg_perfiles_updated on public.perfiles;
create trigger trg_perfiles_updated before update on public.perfiles
  for each row execute function public.set_updated_at();

-- RLS
alter table public.perfiles enable row level security;

-- Cada usuario autenticado solo puede LEER su propio perfil (anti-escalada).
drop policy if exists "self read" on public.perfiles;
create policy "self read" on public.perfiles
  for select to authenticated using (auth.uid() = id);

-- Sin políticas de insert/update/delete para authenticated => denegado.
-- La gestión de cuentas se hace exclusivamente con service_role en el servidor.
