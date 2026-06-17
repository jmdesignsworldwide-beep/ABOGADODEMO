"use client";

import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumButton } from "@/components/ui/premium-button";

/**
 * Error boundary del módulo Clientes: muestra un estado elegante (no un 500)
 * si la carga de datos falla, p. ej. faltan las variables de Supabase en el
 * entorno de despliegue.
 */
export default function ClientesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="No se pudieron cargar los clientes"
      description="Verifica que las variables de Supabase estén configuradas en el entorno (NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY) y vuelve a intentar."
      action={
        <PremiumButton variant="gold" onClick={reset}>
          Reintentar
        </PremiumButton>
      }
    />
  );
}
