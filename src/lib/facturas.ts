import type { ConceptoLinea } from "@/lib/db/types";

/* Helpers de facturación (puros, cliente + servidor). */

export const ITBIS_RATE = 0.18;

/** Formatea un monto en pesos dominicanos: RD$ 1,234.56 */
export function formatRD(monto: number): string {
  return `RD$ ${monto.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Calcula subtotal, ITBIS (18%) y total a partir de las líneas. */
export function calcularTotales(conceptos: ConceptoLinea[]): {
  subtotal: number;
  itbis: number;
  total: number;
} {
  const subtotal = conceptos.reduce(
    (acc, c) => acc + (Number(c.cantidad) || 0) * (Number(c.precio) || 0),
    0,
  );
  const itbis = Math.round(subtotal * ITBIS_RATE * 100) / 100;
  const total = Math.round((subtotal + itbis) * 100) / 100;
  return { subtotal: Math.round(subtotal * 100) / 100, itbis, total };
}

/** Siguiente NCF secuencial para un tipo, dado el último número existente. */
export function siguienteNCF(tipo: string, ultimoNumero: string | null): string {
  let n = 1;
  if (ultimoNumero && ultimoNumero.length >= 3) {
    const seq = parseInt(ultimoNumero.slice(3), 10);
    if (!Number.isNaN(seq)) n = seq + 1;
  }
  return `${tipo}${String(n).padStart(8, "0")}`;
}

export function fechaLargaRD(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
