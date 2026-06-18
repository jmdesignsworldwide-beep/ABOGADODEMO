"use client";

import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumButton } from "@/components/ui/premium-button";

export default function HistorialError({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState icon={TriangleAlert} title="No se pudo cargar el historial" description="Verifica la configuración de Supabase y vuelve a intentar." action={<PremiumButton variant="gold" onClick={reset}>Reintentar</PremiumButton>} />
  );
}
