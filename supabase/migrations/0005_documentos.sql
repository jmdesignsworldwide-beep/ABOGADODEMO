-- ============================================================================
-- JM Design — Gestión Legal · Documentos + Supabase Storage
-- Tabla documentos (metadatos) + bucket PRIVADO para los archivos.
-- Seguridad: el bucket es privado y SIN políticas para anon/authenticated, así
-- que NADIE puede acceder a un archivo por URL directa. La app sube/borra desde
-- el servidor (service_role) y sirve descargas con URLs firmadas de corta
-- duración, generadas solo para usuarios con sesión activa.
-- ============================================================================

create table if not exists public.documentos (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  tipo_documento  text not null default 'otro'
                    check (tipo_documento in ('contrato','sentencia','poder',
                      'prueba','escrito','factura','identificacion','otro')),
  storage_path    text not null,
  mime_type       text,
  tamano          bigint,
  caso_id         uuid references public.casos(id) on delete set null,
  cliente_id      uuid references public.clientes(id) on delete set null,
  subido_por      uuid,
  created_at      timestamptz not null default now()
);
create index if not exists idx_documentos_caso on public.documentos(caso_id);
create index if not exists idx_documentos_cliente on public.documentos(cliente_id);

-- RLS: sin políticas para authenticated => solo service_role (servidor).
-- Los clientes nunca leen documentos directamente; todo pasa por el servidor.
alter table public.documentos enable row level security;

-- ── Bucket privado ──────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos', 'documentos', false, 15728640,
  array[
    'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- storage.objects ya tiene RLS habilitado por defecto. Al no crear políticas
-- para anon/authenticated, solo service_role accede a los archivos.
