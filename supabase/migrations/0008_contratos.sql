-- ============================================================================
-- JM Design — Gestión Legal · Generador de Documentos / Contratos
-- ⚠️ Documentos de EJEMPLO para demostración. No son documentos legales válidos.
-- Guarda los documentos generados (texto) para verlos/re-descargarlos después.
-- RLS: solo service_role (la app accede desde el servidor).
-- ============================================================================

create table if not exists public.documentos_generados (
  id          uuid primary key default gen_random_uuid(),
  plantilla   text not null,
  titulo      text not null,
  contenido   text not null,
  cliente_id  uuid references public.clientes(id) on delete set null,
  caso_id     uuid references public.casos(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_docgen_cliente on public.documentos_generados(cliente_id);
create index if not exists idx_docgen_caso on public.documentos_generados(caso_id);

alter table public.documentos_generados enable row level security;

-- ── Seed: dos documentos de ejemplo ─────────────────────────────────────────
delete from public.documentos_generados;
insert into public.documentos_generados (plantilla, titulo, contenido, cliente_id, caso_id) values
 ('poder_representacion',
  'Poder de Representación — Sánchez vs. Inmobiliaria del Este',
  E'PODER DE REPRESENTACIÓN\n\nEn la ciudad de Santo Domingo, República Dominicana.\n\nYO, MARÍA ALTAGRACIA SÁNCHEZ, dominicana, mayor de edad, portadora de la cédula de identidad y electoral No. 001-1234567-8, otorgo PODER ESPECIAL al Lic. José Martínez, del bufete JM & Asociados | Abogados, para que me represente en el caso "Sánchez vs. Inmobiliaria del Este" por ante el Juzgado de Primera Instancia, 3ª Sala Civil y Comercial, D.N.\n\n(Documento de ejemplo para demostración.)',
  'c1000000-0000-4000-8000-000000000001', 'ca100000-0000-4000-8000-000000000001'),
 ('contrato_servicios',
  'Contrato de Servicios Profesionales — Grupo Caribe, S.R.L.',
  E'CONTRATO DE SERVICIOS PROFESIONALES\n\nEntre JM & Asociados | Abogados y GRUPO CARIBE, S.R.L. (RNC 1-31-54321-0), se conviene la prestación de servicios legales relativos a la constitución de la sociedad, por los honorarios pactados entre las partes.\n\n(Documento de ejemplo para demostración.)',
  'c1000000-0000-4000-8000-000000000005', 'ca100000-0000-4000-8000-000000000004');
