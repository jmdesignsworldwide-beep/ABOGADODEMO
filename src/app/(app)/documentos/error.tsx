"use client";

import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumButton } from "@/components/ui/premium-button";

export default function DocumentosError({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="No se pudieron cargar los documentos"
      description="Verifica la configuración de Supabase (incluido el bucket de Storage) y vuelve a intentar."
      action={<PremiumButton variant="gold" onClick={reset}>Reintentar</PremiumButton>}
    />
  );
}
