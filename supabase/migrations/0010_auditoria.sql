-- ============================================================================
-- JM Design — Gestión Legal · Auditoría / Historial
-- Registro vivo de acciones: quién hizo qué y cuándo. RLS: solo service_role.
-- (La app registra de aquí en adelante; se pre-puebla con historial realista.)
-- ============================================================================

create table if not exists public.auditoria (
  id          uuid primary key default gen_random_uuid(),
  usuario     text,
  rol         text,
  accion      text not null,   -- crear / editar / eliminar / login / respaldo
  modulo      text not null,   -- Clientes / Casos / Facturación / ...
  detalle     text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_auditoria_fecha on public.auditoria(created_at desc);

alter table public.auditoria enable row level security;

-- Seed: historial realista
delete from public.auditoria;
insert into public.auditoria (usuario, rol, accion, modulo, detalle, created_at) values
 ('jmadmin','admin','login','Acceso','Inició sesión en el sistema', now() - interval '6 days 2 hours'),
 ('jmadmin','admin','crear','Clientes','Registró al cliente "Distribuidora Hermanos Polanco"', now() - interval '6 days'),
 ('jmadmin','admin','crear','Casos','Creó el caso "Cobro de Pesos — Distribuidora Polanco"', now() - interval '5 days 20 hours'),
 ('jmadmin','admin','crear','Agenda','Agendó "Audiencia de conciliación laboral"', now() - interval '5 days'),
 ('jmadmin','admin','crear','Expedientes','Registró el expediente "Exp. 091-2026-LAB-00733"', now() - interval '5 days'),
 ('jmadmin','admin','crear','Facturación','Emitió la factura B0100000002', now() - interval '4 days 6 hours'),
 ('jmadmin','admin','editar','Casos','Actualizó el avance del caso "Sucesión Familia Reyes" a 64%', now() - interval '4 days'),
 ('jmadmin','admin','crear','Documentos','Subió "Contrato de compraventa.pdf"', now() - interval '3 days 8 hours'),
 ('cliente.demo','cliente','login','Acceso','Inició sesión en el sistema', now() - interval '3 days'),
 ('jmadmin','admin','crear','Contratos','Generó "Poder de Representación — Sánchez vs. Inmobiliaria"', now() - interval '2 days 9 hours'),
 ('jmadmin','admin','editar','Facturación','Marcó como pagada la factura B0100000002', now() - interval '2 days'),
 ('jmadmin','admin','crear','Finanzas','Registró el egreso "Salarios del personal"', now() - interval '1 day 12 hours'),
 ('jmadmin','admin','login','Acceso','Inició sesión en el sistema', now() - interval '1 day 3 hours'),
 ('jmadmin','admin','eliminar','Agenda','Eliminó una cita de la agenda', now() - interval '22 hours'),
 ('jmadmin','admin','respaldo','Respaldo','Forzó un respaldo manual de la base de datos', now() - interval '6 hours'),
 ('jmadmin','admin','editar','Clientes','Actualizó los datos de "María Altagracia Sánchez"', now() - interval '3 hours');
