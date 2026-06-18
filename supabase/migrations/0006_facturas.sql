-- ============================================================================
-- JM Design — Gestión Legal · Facturación (NCF SIMULADO — demostración)
-- ⚠️ Las facturas y NCF son de DEMOSTRACIÓN, no certificados ante la DGII.
-- Tabla facturas con RLS (solo service_role). Vínculo a cliente (obligatorio)
-- y caso (opcional). ITBIS 18%, NCF B01 (crédito fiscal) / B02 (consumidor final).
-- ============================================================================

create table if not exists public.facturas (
  id          uuid primary key default gen_random_uuid(),
  numero      text not null unique,                 -- p. ej. B0100000001
  tipo_ncf    text not null default 'B02' check (tipo_ncf in ('B01','B02')),
  cliente_id  uuid not null references public.clientes(id) on delete restrict,
  caso_id     uuid references public.casos(id) on delete set null,
  conceptos   jsonb not null default '[]'::jsonb,   -- [{descripcion,cantidad,precio}]
  subtotal    numeric(12,2) not null default 0,
  itbis       numeric(12,2) not null default 0,
  total       numeric(12,2) not null default 0,
  estado      text not null default 'pendiente' check (estado in ('pendiente','pagada','anulada')),
  fecha       date not null default current_date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_facturas_cliente on public.facturas(cliente_id);
create index if not exists idx_facturas_caso on public.facturas(caso_id);

drop trigger if exists trg_facturas_updated on public.facturas;
create trigger trg_facturas_updated before update on public.facturas
  for each row execute function public.set_updated_at();

-- RLS: solo service_role (la app accede desde el servidor).
alter table public.facturas enable row level security;

-- ── Seed (idempotente) ──────────────────────────────────────────────────────
delete from public.facturas;

insert into public.facturas (numero, tipo_ncf, cliente_id, caso_id, conceptos, subtotal, itbis, total, estado, fecha) values
 ('B0100000001','B01','c1000000-0000-4000-8000-000000000002','ca100000-0000-4000-8000-000000000001',
   '[{"descripcion":"Honorarios profesionales — demanda civil en daños y perjuicios","cantidad":1,"precio":150000}]'::jsonb,
   150000, 27000, 177000, 'pagada', current_date - 25),

 ('B0200000001','B02','c1000000-0000-4000-8000-000000000001','ca100000-0000-4000-8000-000000000010',
   '[{"descripcion":"Honorarios — reclamación de alquileres vencidos","cantidad":1,"precio":45000}]'::jsonb,
   45000, 8100, 53100, 'pendiente', current_date - 12),

 ('B0100000002','B01','c1000000-0000-4000-8000-000000000004','ca100000-0000-4000-8000-000000000003',
   '[{"descripcion":"Honorarios — recurso de amparo","cantidad":1,"precio":200000},{"descripcion":"Gastos legales y notariales","cantidad":1,"precio":15000}]'::jsonb,
   215000, 38700, 253700, 'pendiente', current_date - 8),

 ('B0100000003','B01','c1000000-0000-4000-8000-000000000005','ca100000-0000-4000-8000-000000000004',
   '[{"descripcion":"Constitución de sociedad de responsabilidad limitada (S.R.L.)","cantidad":1,"precio":80000},{"descripcion":"Registro mercantil y trámites","cantidad":1,"precio":20000}]'::jsonb,
   100000, 18000, 118000, 'pagada', current_date - 20),

 ('B0200000002','B02','c1000000-0000-4000-8000-000000000006','ca100000-0000-4000-8000-000000000005',
   '[{"descripcion":"Honorarios — demanda laboral por despido injustificado","cantidad":1,"precio":60000}]'::jsonb,
   60000, 10800, 70800, 'pendiente', current_date - 5),

 ('B0100000004','B01','c1000000-0000-4000-8000-000000000009','ca100000-0000-4000-8000-000000000008',
   '[{"descripcion":"Honorarios — demanda en cobro de pesos","cantidad":1,"precio":35000}]'::jsonb,
   35000, 6300, 41300, 'anulada', current_date - 15);
