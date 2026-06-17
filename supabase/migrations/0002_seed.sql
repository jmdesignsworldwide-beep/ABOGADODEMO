-- ============================================================================
-- Seed de datos dominicanos realistas (Tanda 3).
-- Idempotente: limpia y re-inserta. UUIDs fijos para enlazar las relaciones.
-- ============================================================================

truncate table public.expedientes, public.casos, public.clientes restart identity cascade;

-- ── CLIENTES ────────────────────────────────────────────────────────────────
insert into public.clientes (id, nombre, tipo, tipo_documento, documento, email, telefono, direccion, notas) values
  ('c1000000-0000-4000-8000-000000000001', 'María Altagracia Sánchez', 'persona', 'cedula', '001-1234567-8', 'maria.sanchez@gmail.com', '(829) 412-3344', 'C/ El Conde 152, Zona Colonial, Santo Domingo', 'Clienta recurrente. Prefiere contacto por WhatsApp.'),
  ('c1000000-0000-4000-8000-000000000002', 'Inmobiliaria del Este, S.R.L.', 'empresa', 'rnc', '1-30-12345-6', 'legal@inmobiliariadeleste.do', '(809) 567-8901', 'Av. España 45, San Pedro de Macorís', 'Contraparte frecuente convertida en cliente corporativo.'),
  ('c1000000-0000-4000-8000-000000000003', 'Ramón Antonio Reyes Peña', 'persona', 'cedula', '402-2345678-9', 'ramon.reyes@hotmail.com', '(849) 223-4455', 'C/ Duarte 88, Santiago de los Caballeros', 'Caso de sucesión familiar en curso.'),
  ('c1000000-0000-4000-8000-000000000004', 'Cooperativa La Nacional de Servicios', 'empresa', 'rnc', '4-01-98765-4', 'gerencia@coopnacional.do', '(809) 730-1212', 'Av. 27 de Febrero 247, Santo Domingo', 'Recurso de amparo contra resolución administrativa.'),
  ('c1000000-0000-4000-8000-000000000005', 'Grupo Caribe, S.R.L.', 'empresa', 'rnc', '1-31-54321-0', 'admin@grupocaribe.com.do', '(809) 482-7700', 'Torre Empresarial Caribe, Piantini, D.N.', 'Constitución y asuntos comerciales.'),
  ('c1000000-0000-4000-8000-000000000006', 'Juan Carlos Pérez Mejía', 'persona', 'cedula', '001-9876543-2', 'jcperez@gmail.com', '(829) 661-9090', 'Res. Los Prados, Edif. 4 Apto 201, Santo Domingo', 'Demanda laboral contra antigua empleadora.'),
  ('c1000000-0000-4000-8000-000000000007', 'Carmen Rosa Martínez Hernández', 'persona', 'cedula', '031-0456789-1', 'carmenrosa.mh@gmail.com', '(849) 305-2211', 'C/ Restauración 12, La Vega', 'Proceso de divorcio por incompatibilidad.'),
  ('c1000000-0000-4000-8000-000000000008', 'Luis Manuel Objío Guerrero', 'persona', 'cedula', '402-1112223-3', 'lm.objio@gmail.com', '(809) 555-3471', 'C/ Máximo Gómez 305, Santo Domingo', 'Defensa penal. Confidencial.'),
  ('c1000000-0000-4000-8000-000000000009', 'Distribuidora Hermanos Polanco', 'empresa', 'rnc', '1-30-67788-9', 'cobros@dhpolanco.do', '(809) 244-5566', 'Av. Núñez de Cáceres 90, Santo Domingo', 'Cliente comercial, cobros y contratos.');

-- ── CASOS ─────────────────────────────────────────────────────────────────
insert into public.casos (id, cliente_id, titulo, tipo, estado, abogado, parte_contraria, avance, descripcion) values
  ('ca100000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Sánchez vs. Inmobiliaria del Este', 'civil', 'en_proceso', 'Lic. José Martínez', 'Inmobiliaria del Este, S.R.L.', 82, 'Demanda en reparación de daños por incumplimiento de contrato de compraventa de inmueble.'),
  ('ca100000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000003', 'Sucesión Familia Reyes', 'sucesiones', 'en_proceso', 'Licda. Carla Reyes', 'Herederos colaterales', 64, 'Determinación de herederos y partición de bienes sucesorales.'),
  ('ca100000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000004', 'Recurso de Amparo — Cooperativa La Nacional', 'civil', 'en_proceso', 'Lic. José Martínez', 'Ministerio de Industria y Comercio', 45, 'Amparo contra resolución que suspende operaciones de la cooperativa.'),
  ('ca100000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000005', 'Constitución Grupo Caribe, S.R.L.', 'comercial', 'abierto', 'Licda. Carla Reyes', null, 28, 'Constitución de sociedad de responsabilidad limitada y registro mercantil.'),
  ('ca100000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000006', 'Pérez vs. Seguros Universal', 'laboral', 'en_proceso', 'Dr. Pedro Objío', 'Seguros Universal, S.A.', 55, 'Demanda laboral por despido injustificado y prestaciones.'),
  ('ca100000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000007', 'Divorcio Martínez Hernández', 'divorcio', 'en_proceso', 'Licda. Carla Reyes', 'Sr. Fernando Castillo', 70, 'Divorcio por incompatibilidad de caracteres, con régimen de bienes.'),
  ('ca100000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000008', 'Ministerio Público vs. Objío Guerrero', 'penal', 'en_proceso', 'Dr. Pedro Objío', 'Ministerio Público', 38, 'Defensa técnica en proceso penal por presunta estafa.'),
  ('ca100000-0000-4000-8000-000000000008', 'c1000000-0000-4000-8000-000000000009', 'Cobro de Pesos — Distribuidora Polanco', 'comercial', 'abierto', 'Lic. José Martínez', 'Comercial San Rafael, S.R.L.', 15, 'Demanda en cobro de pesos por facturas vencidas.'),
  ('ca100000-0000-4000-8000-000000000009', 'c1000000-0000-4000-8000-000000000002', 'Deslinde Parcela 45-B Distrito Catastral', 'inmobiliario', 'suspendido', 'Licda. Carla Reyes', 'Sucesión Mendoza', 50, 'Proceso de deslinde y saneamiento de parcela.'),
  ('ca100000-0000-4000-8000-000000000010', 'c1000000-0000-4000-8000-000000000001', 'Sánchez — Reclamación de Alquileres', 'civil', 'cerrado', 'Lic. José Martínez', 'Inquilino moroso', 100, 'Reclamación de alquileres vencidos. Caso ganado.');

-- ── EXPEDIENTES (1—1 con caso) ────────────────────────────────────────────────
insert into public.expedientes (caso_id, numero, tribunal, juez, estado_procesal) values
  ('ca100000-0000-4000-8000-000000000001', 'Exp. 034-2026-CIV-00412', 'Juzgado de Primera Instancia, 3ª Sala Civil y Comercial, D.N.', 'Mag. Francisco Ortega', 'Producción de pruebas'),
  ('ca100000-0000-4000-8000-000000000002', 'Exp. 026-2026-SUC-00208', 'Cámara Civil de la Corte de Apelación del D.N., 1ª Sala', 'Mag. Yokasta Guzmán', 'Conclusiones'),
  ('ca100000-0000-4000-8000-000000000003', 'Exp. 472-2026-AMP-00094', 'Tribunal Superior Administrativo', 'Mag. Rafael Vásquez', 'Conocimiento del recurso'),
  ('ca100000-0000-4000-8000-000000000004', 'Ref. RM-2026-58841', 'Cámara de Comercio y Producción de Santo Domingo', null, 'En registro'),
  ('ca100000-0000-4000-8000-000000000005', 'Exp. 091-2026-LAB-00733', 'Juzgado de Trabajo del Distrito Nacional, 2ª Sala', 'Mag. Altagracia Núñez', 'Conciliación'),
  ('ca100000-0000-4000-8000-000000000006', 'Exp. 549-2026-FAM-01187', 'Juzgado de Primera Instancia, Cámara Civil, S.D. Este', 'Mag. Pedro Henríquez', 'Audiencia de fondo'),
  ('ca100000-0000-4000-8000-000000000007', 'Exp. 218-2026-PEN-00551', 'Cámara Penal del Juzgado de Primera Instancia de Santiago', 'Mag. Luisa Ferreira', 'Instrucción'),
  ('ca100000-0000-4000-8000-000000000008', 'Exp. 113-2026-COM-00302', 'Juzgado de Primera Instancia, 1ª Sala Civil y Comercial, D.N.', 'Mag. José Brito', 'Demanda depositada'),
  ('ca100000-0000-4000-8000-000000000009', 'Exp. TST-2026-00077', 'Tribunal de Jurisdicción Original de San Pedro de Macorís', 'Mag. Carmen Disla', 'Suspendido'),
  ('ca100000-0000-4000-8000-000000000010', 'Exp. 008-2025-CIV-00990', 'Juzgado de Paz de la 2ª Circunscripción, D.N.', 'Mag. Ana Belén Lora', 'Sentencia firme');
