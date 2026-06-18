import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Egreso } from "./types";

export async function getEgresos(): Promise<Egreso[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("egresos").select("*").order("fecha", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Egreso[] | null) ?? [];
}

export async function getEgresoById(id: string): Promise<Egreso | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("egresos").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Egreso | null) ?? null;
}
