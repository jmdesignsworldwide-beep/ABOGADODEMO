import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuditoriaEntrada } from "./types";

export async function getAuditoria(limit = 200): Promise<AuditoriaEntrada[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("auditoria")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as AuditoriaEntrada[] | null) ?? [];
}
