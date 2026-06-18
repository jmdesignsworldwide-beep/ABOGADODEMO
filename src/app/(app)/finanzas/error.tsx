"use client";

import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumButton } from "@/components/ui/premium-button";

export default function FinanzasError({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="No se pudo cargar el control financiero"
      description="Verifica que las variables de Supabase estén configuradas en el entorno y vuelve a intentar."
      action={<PremiumButton variant="gold" onClick={reset}>Reintentar</PremiumButton>}
    />
  );
}
