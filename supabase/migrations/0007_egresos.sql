-- ============================================================================
-- JM Design — Gestión Legal · Control Financiero
-- Egresos del bufete (CRUD real). Ingresos salen de facturas pagadas (coherencia).
-- RLS: solo service_role (la app accede desde el servidor).
-- ============================================================================

create table if not exists public.egresos (
  id          uuid primary key default gen_random_uuid(),
  concepto    text not null,
  categoria   text not null default 'otros'
                check (categoria in ('alquiler','salarios','servicios','suministros',
                  'impuestos','honorarios_terceros','marketing','mantenimiento','otros')),
  monto       numeric(12,2) not null check (monto >= 0),
  fecha       date not null default current_date,
  descripcion text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_egresos_fecha on public.egresos(fecha);

drop trigger if exists trg_egresos_updated on public.egresos;
create trigger trg_egresos_updated before update on public.egresos
  for each row execute function public.set_updated_at();

alter table public.egresos enable row level security;

-- Coherencia: dos facturas recientes pasan a "pagada" (ingresos reales del mes).
update public.facturas set estado = 'pagada'
  where numero in ('B0200000001','B0100000002');

-- ── Seed de egresos (idempotente), 3 meses ──────────────────────────────────
delete from public.egresos;
insert into public.egresos (concepto, categoria, monto, fecha, descripcion) values
  -- Mes actual
  ('Salarios del personal', 'salarios', 165000, current_date - 13, 'Nómina mensual: paralegal, asistente y recepción.'),
  ('Alquiler de oficina', 'alquiler', 65000, current_date - 12, 'Local en Piantini, Distrito Nacional.'),
  ('Energía eléctrica (EDEEste)', 'servicios', 14200, current_date - 10, null),
  ('Internet y teléfono (Claro)', 'servicios', 6500, current_date - 10, 'Plan empresarial.'),
  ('Suministros de oficina', 'suministros', 8800, current_date - 7, 'Papelería, tóner e insumos.'),
  ('Publicidad digital', 'marketing', 12000, current_date - 5, 'Campaña en redes sociales.'),
  -- Mes anterior
  ('Salarios del personal', 'salarios', 165000, current_date - 43, 'Nómina mensual.'),
  ('Alquiler de oficina', 'alquiler', 65000, current_date - 42, null),
  ('Energía eléctrica (EDEEste)', 'servicios', 13100, current_date - 40, null),
  ('Internet y teléfono (Claro)', 'servicios', 6500, current_date - 40, null),
  ('Anticipo del ISR (DGII)', 'impuestos', 35000, current_date - 38, 'Pago a cuenta del impuesto sobre la renta.'),
  ('Honorarios de perito (avalúo)', 'honorarios_terceros', 25000, current_date - 36, 'Avalúo en proceso de deslinde.'),
  -- Hace dos meses
  ('Salarios del personal', 'salarios', 165000, current_date - 73, 'Nómina mensual.'),
  ('Alquiler de oficina', 'alquiler', 65000, current_date - 72, null),
  ('Energía eléctrica (EDEEste)', 'servicios', 12800, current_date - 70, null),
  ('Mantenimiento de equipos', 'mantenimiento', 7500, current_date - 66, 'Servicio de aires e impresoras.');
