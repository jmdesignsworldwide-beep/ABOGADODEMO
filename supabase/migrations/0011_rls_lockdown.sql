-- ============================================================================
-- 0011 — Cierre de RLS: elimina el acceso abierto al rol `authenticated`.
--
-- Las tablas clientes, casos, expedientes y audiencias_citas tenían una
-- política "auth full access" (FOR ALL TO authenticated USING(true)
-- WITH CHECK(true)) que permitía a CUALQUIER usuario autenticado leer/editar/
-- borrar TODO directamente vía la API REST de Supabase, saltándose la app.
--
-- La aplicación SIEMPRE accede a estas tablas desde el SERVIDOR con la
-- service_role (que ignora RLS), por lo que quitar estas políticas NO rompe
-- ninguna funcionalidad: solo bloquea el acceso directo del rol authenticated.
--
-- Resultado: RLS sigue habilitado y, sin políticas para authenticated, el
-- acceso queda denegado salvo para service_role — igual que ya ocurre con
-- facturas, egresos, documentos, documentos_generados, recordatorios y
-- auditoria. Idempotente (drop if exists).
-- ============================================================================

drop policy if exists "auth full access" on public.clientes;
drop policy if exists "auth full access" on public.casos;
drop policy if exists "auth full access" on public.expedientes;
drop policy if exists "auth full access" on public.audiencias_citas;
