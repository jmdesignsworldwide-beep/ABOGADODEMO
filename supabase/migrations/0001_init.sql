-- ============================================================================
-- JM Design — Gestión Legal · Esquema inicial (Tanda 3)
-- Tablas: clientes, casos, expedientes
--   - Un cliente tiene muchos casos (1—*)
--   - Un caso tiene un expediente (1—1)
-- RLS activado en TODAS las tablas desde el inicio.
-- ============================================================================

create extension if not exists "pgcrypto";

-- Trigger genérico para mantener updated_at -----------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── clientes ────────────────────────────────────────────────────────────────
create table if not exists public.clientes (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null,
  tipo           text not null default 'persona'
                   check (tipo in ('persona','empresa')),
  tipo_documento text not null default 'cedula'
                   check (tipo_documento in ('cedula','rnc','pasaporte')),
  documento      text,
  email          text,
  telefono       text,
  direccion      text,
  notas          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── casos ─────────────────────────────────────────────────────────────────
create table if not exists public.casos (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid not null references public.clientes(id) on delete cascade,
  titulo          text not null,
  tipo            text not null
                    check (tipo in ('civil','penal','laboral','comercial',
                                    'divorcio','sucesiones','inmobiliario')),
  estado          text not null default 'abierto'
                    check (estado in ('abierto','en_proceso','suspendido',
                                      'cerrado','archivado')),
  abogado         text,
  parte_contraria text,
  avance          int not null default 0 check (avance between 0 and 100),
  descripcion     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_casos_cliente on public.casos(cliente_id);

-- ── expedientes (1—1 con caso) ───────────────────────────────────────────────
create table if not exists public.expedientes (
  id             uuid primary key default gen_random_uuid(),
  caso_id        uuid not null unique references public.casos(id) on delete cascade,
  numero         text not null,
  tribunal       text,
  juez           text,
  estado_procesal text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Triggers updated_at ---------------------------------------------------------
drop trigger if exists trg_clientes_updated on public.clientes;
create trigger trg_clientes_updated before update on public.clientes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_casos_updated on public.casos;
create trigger trg_casos_updated before update on public.casos
  for each row execute function public.set_updated_at();

drop trigger if exists trg_expedientes_updated on public.expedientes;
create trigger trg_expedientes_updated before update on public.expedientes
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS — activado en todas las tablas.
-- El acceso de la app va por el servidor con la service_role (que ignora RLS).
-- Estas políticas dan acceso completo al rol `authenticated`, listo para
-- cuando se conecte Supabase Auth en una próxima tanda. El rol `anon` queda
-- sin políticas (denegado), por seguridad.
-- ============================================================================
alter table public.clientes    enable row level security;
alter table public.casos       enable row level security;
alter table public.expedientes enable row level security;

drop policy if exists "auth full access" on public.clientes;
create policy "auth full access" on public.clientes
  for all to authenticated using (true) with check (true);

drop policy if exists "auth full access" on public.casos;
create policy "auth full access" on public.casos
  for all to authenticated using (true) with check (true);

drop policy if exists "auth full access" on public.expedientes;
create policy "auth full access" on public.expedientes
  for all to authenticated using (true) with check (true);
