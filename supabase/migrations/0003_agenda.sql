-- ============================================================================
-- JM Design — Gestión Legal · Agenda (audiencias y citas)
-- Una audiencia/cita pertenece a un caso (enlace cruzado real).
-- RLS activado. Seed con fechas relativas a CURRENT_DATE para que la agenda
-- siempre tenga eventos vigentes (Hoy / Mañana / Esta semana / Próximas).
-- ============================================================================

create table if not exists public.audiencias_citas (
  id          uuid primary key default gen_random_uuid(),
  caso_id     uuid not null references public.casos(id) on delete cascade,
  tipo        text not null default 'audiencia' check (tipo in ('audiencia','cita')),
  titulo      text not null,
  fecha       date not null,
  hora        time,
  lugar       text,
  estado      text not null default 'programada'
                check (estado in ('programada','confirmada','realizada','cancelada','aplazada')),
  notas       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_agenda_caso on public.audiencias_citas(caso_id);
create index if not exists idx_agenda_fecha on public.audiencias_citas(fecha);

drop trigger if exists trg_agenda_updated on public.audiencias_citas;
create trigger trg_agenda_updated before update on public.audiencias_citas
  for each row execute function public.set_updated_at();

-- RLS
alter table public.audiencias_citas enable row level security;
drop policy if exists "auth full access" on public.audiencias_citas;
create policy "auth full access" on public.audiencias_citas
  for all to authenticated using (true) with check (true);

-- ── Seed (idempotente) ──────────────────────────────────────────────────────
delete from public.audiencias_citas;

insert into public.audiencias_citas (caso_id, tipo, titulo, fecha, hora, lugar, estado, notas) values
  ('ca100000-0000-4000-8000-000000000001', 'audiencia', 'Audiencia de fondo — producción de pruebas', CURRENT_DATE, '09:30', 'Juzgado de Primera Instancia, 3ª Sala Civil y Comercial, D.N.', 'confirmada', 'Llevar originales del contrato de compraventa y recibos.'),
  ('ca100000-0000-4000-8000-000000000006', 'cita', 'Reunión con clienta — firma de poder', CURRENT_DATE, '15:00', 'Oficina JM & Asociados, Piantini', 'confirmada', 'Preparar poder especial para el divorcio.'),
  ('ca100000-0000-4000-8000-000000000005', 'audiencia', 'Audiencia de conciliación laboral', CURRENT_DATE + 1, '11:00', 'Juzgado de Trabajo del Distrito Nacional, 2ª Sala', 'programada', null),
  ('ca100000-0000-4000-8000-000000000003', 'audiencia', 'Conocimiento del recurso de amparo', CURRENT_DATE + 3, '10:00', 'Tribunal Superior Administrativo', 'programada', 'Coordinar asistencia del representante de la cooperativa.'),
  ('ca100000-0000-4000-8000-000000000002', 'cita', 'Reunión de estrategia — partición sucesoral', CURRENT_DATE + 4, '16:30', 'Oficina JM & Asociados, Piantini', 'programada', null),
  ('ca100000-0000-4000-8000-000000000007', 'audiencia', 'Audiencia preliminar', CURRENT_DATE + 6, '09:00', 'Cámara Penal del Juzgado de Primera Instancia de Santiago', 'confirmada', 'El cliente debe asistir puntual y formalmente vestido.'),
  ('ca100000-0000-4000-8000-000000000006', 'audiencia', 'Audiencia de fondo — divorcio', CURRENT_DATE + 10, '14:00', 'Juzgado de Primera Instancia, Cámara Civil, S.D. Este', 'programada', null),
  ('ca100000-0000-4000-8000-000000000009', 'cita', 'Inspección de parcela (deslinde)', CURRENT_DATE + 14, '08:00', 'Parcela 45-B, San Pedro de Macorís', 'programada', 'Coordinar agrimensor y acceso al terreno.'),
  ('ca100000-0000-4000-8000-000000000008', 'audiencia', 'Lectura íntegra de sentencia', CURRENT_DATE + 20, '09:00', 'Juzgado de Primera Instancia, 1ª Sala Civil y Comercial, D.N.', 'programada', null);
