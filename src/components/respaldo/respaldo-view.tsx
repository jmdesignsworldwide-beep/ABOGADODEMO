"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarClock, CheckCircle2, Clock, DatabaseBackup, HardDrive, RefreshCw, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PremiumButton } from "@/components/ui/premium-button";
import { forzarRespaldo } from "@/app/(app)/respaldo/actions";

function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleString("es-DO", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function RespaldoView({ ultimoISO }: { ultimoISO: string }) {
  const reduced = useReducedMotion();
  const [ultimo, setUltimo] = useState(ultimoISO);
  const [estado, setEstado] = useState<"idle" | "corriendo" | "ok">("idle");
  const [progress, setProgress] = useState(0);

  async function correr() {
    if (estado === "corriendo") return;
    setEstado("corriendo");
    setProgress(0);
    // Animación de progreso (visual).
    const steps = reduced ? 1 : 24;
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, reduced ? 200 : 90));
      setProgress(Math.round((i / steps) * 100));
    }
    const res = await forzarRespaldo();
    setUltimo(res.fecha);
    setEstado("ok");
    setTimeout(() => setEstado("idle"), 3500);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Respaldo en la nube" subtitle="Tus datos, protegidos y al día" />

      {/* Estado principal */}
      <div className="overflow-hidden rounded-2xl glass shadow-layered">
        <div className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-500">
              <DatabaseBackup className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-semibold text-foreground">Respaldo al día</h3>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Último respaldo: <span className="font-medium text-foreground">{fechaLarga(ultimo)}</span>
              </p>
            </div>
          </div>
          <PremiumButton variant="gold" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={correr} loading={estado === "corriendo"}>
            Forzar respaldo ahora
          </PremiumButton>
        </div>

        {/* Barra de progreso / confirmación */}
        <AnimatePresence>
          {estado !== "idle" && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border px-6">
              <div className="py-4">
                {estado === "corriendo" ? (
                  <>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted-foreground">Respaldando base de datos…</span>
                      <span className="tabular font-medium text-foreground">{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--navy),var(--gold))] transition-[width] duration-100" style={{ width: `${progress}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-500"><CheckCircle2 className="h-4 w-4" /> Respaldo completado correctamente.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Detalle icon={CalendarClock} titulo="Frecuencia" valor="Diaria, automática" nota="Respaldo gestionado por Supabase." />
        <Detalle icon={Clock} titulo="Retención" valor="30 días" nota="Punto de restauración por día." />
        <Detalle icon={HardDrive} titulo="Ubicación" valor="Supabase (nube)" nota="Cifrado en reposo y en tránsito." />
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p>Tu información se respalda automáticamente cada día en la infraestructura de Supabase. El botón de respaldo manual queda registrado en el historial de auditoría.</p>
      </div>
    </div>
  );
}

function Detalle({ icon: Icon, titulo, valor, nota }: { icon: typeof DatabaseBackup; titulo: string; valor: string; nota: string }) {
  return (
    <div className="rounded-2xl glass p-5 shadow-layered">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold"><Icon className="h-5 w-5" strokeWidth={1.75} /></span>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{titulo}</p>
      <p className="mt-0.5 font-display text-lg font-semibold text-foreground">{valor}</p>
      <p className="mt-1 text-xs text-muted-foreground">{nota}</p>
    </div>
  );
}
