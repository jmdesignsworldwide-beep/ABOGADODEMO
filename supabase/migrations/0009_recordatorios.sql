-- ============================================================================
-- JM Design — Gestión Legal · Recordatorios
-- Alertas de plazos, vencimientos y audiencias, vinculadas a casos reales.
-- RLS: solo service_role.
-- ============================================================================

create table if not exists public.recordatorios (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  fecha       timestamptz not null,
  caso_id     uuid references public.casos(id) on delete set null,
  nota        text,
  completado  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_recordatorios_fecha on public.recordatorios(fecha);

drop trigger if exists trg_recordatorios_updated on public.recordatorios;
create trigger trg_recordatorios_updated before update on public.recordatorios
  for each row execute function public.set_updated_at();

alter table public.recordatorios enable row level security;

-- Seed (fechas relativas a ahora para que se vean vigentes)
delete from public.recordatorios;
insert into public.recordatorios (titulo, fecha, caso_id, nota, completado) values
 ('Audiencia de fondo — Sánchez vs. Inmobiliaria del Este', now() + interval '18 hours', 'ca100000-0000-4000-8000-000000000001', 'Llevar originales del contrato y recibos.', false),
 ('Vence plazo de conclusiones — Sucesión Familia Reyes', now() + interval '30 hours', 'ca100000-0000-4000-8000-000000000002', 'Depositar conclusiones escritas antes del cierre.', false),
 ('Depositar pruebas — Pérez vs. Seguros Universal', now() + interval '4 days', 'ca100000-0000-4000-8000-000000000005', null, false),
 ('Llamar al cliente Grupo Caribe (registro mercantil)', now() + interval '6 days', 'ca100000-0000-4000-8000-000000000004', 'Confirmar documentos pendientes.', false),
 ('Renovar poder — Cooperativa La Nacional', now() + interval '12 days', 'ca100000-0000-4000-8000-000000000003', null, false),
 ('Enviar borrador de contrato a Grupo Caribe', now() - interval '2 days', 'ca100000-0000-4000-8000-000000000004', 'Borrador enviado por correo.', true);
