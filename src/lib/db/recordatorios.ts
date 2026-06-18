import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Caso, Recordatorio, RecordatorioConCaso } from "./types";

type Row = Recordatorio & { casos: Pick<Caso, "id" | "titulo"> | null };
function shape(r: Row): RecordatorioConCaso {
  const { casos, ...rec } = r;
  return { ...rec, caso: casos ?? null };
}
const SELECT = "*, casos(id, titulo)";

export async function getRecordatorios(): Promise<RecordatorioConCaso[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("recordatorios")
    .select(SELECT)
    .order("completado", { ascending: true })
    .order("fecha", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Row[] | null ?? []).map(shape);
}

export async function getRecordatorioById(id: string): Promise<RecordatorioConCaso | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("recordatorios").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return shape(data as Row);
}
