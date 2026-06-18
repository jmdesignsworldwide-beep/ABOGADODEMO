"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { easeElegant } from "@/lib/motion";

/* ─────────────────────────────────────────────────────────────────────────
   Bienvenida cinematográfica tras el login.
   - Se muestra UNA sola vez por sesión (bandera en sessionStorage que el
     formulario de login marca como "pending"; aquí la consumimos).
   - Atmósfera SIEMPRE oscura premium (forzamos `.dark` en el overlay),
     aunque el sistema esté en tema claro: al disolverse, queda el panel
     real (ya montado debajo) en el tema del usuario.
   - Cortina de revelado por disolución + escala (nada abrupto).
   - A prueba de fallos: temporizador de seguridad que retira el velo pase
     lo que pase, así el usuario SIEMPRE llega al panel.
   - Respeta prefers-reduced-motion: fade corto y suave, sin movimiento.
   ───────────────────────────────────────────────────────────────────────── */

const SESSION_KEY = "jm:welcome";

export function WelcomeGate({ name }: { name: string }) {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);

  // Decide en el montaje si toca reproducir (solo justo tras un login fresco).
  useEffect(() => {
    let pending = false;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "pending") {
        sessionStorage.setItem(SESSION_KEY, "shown");
        pending = true;
      }
    } catch {
      pending = false;
    }
    if (pending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true);
    }
  }, []);

  // Auto-retiro tras la pausa cálida + red de seguridad redundante.
  useEffect(() => {
    if (!show) return;
    const hold = reduced ? 900 : 2600;
    const close = setTimeout(() => setShow(false), hold);
    const failsafe = setTimeout(() => setShow(false), hold + 2600);
    return () => {
      clearTimeout(close);
      clearTimeout(failsafe);
    };
  }, [show, reduced]);

  return (
    <AnimatePresence>
      {show && <WelcomeOverlay key="welcome" name={name} reduced={!!reduced} />}
    </AnimatePresence>
  );
}

function WelcomeOverlay({ name, reduced }: { name: string; reduced: boolean }) {
  return (
    <motion.div
      className="dark fixed inset-0 z-[200] grid place-items-center overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={
        reduced
          ? { opacity: 0, transition: { duration: 0.35 } }
          : { opacity: 0, scale: 1.08, filter: "blur(10px)", transition: { ...easeElegant, duration: 0.75 } }
      }
      transition={{ duration: reduced ? 0.3 : 0.5 }}
      aria-live="polite"
    >
      {/* Aurora oscura que respira (contenida en el overlay) */}
      <WelcomeAurora />

      {/* Viñeta + grano para profundidad de cine */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 120% at 50% 35%, transparent 45%, rgba(0,0,0,0.55) 100%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Contenido central */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Sello JM con anillos animados */}
        <div className="relative mb-7 grid place-items-center sm:mb-9">
          {!reduced && (
            <>
              <span
                aria-hidden="true"
                className="absolute h-20 w-20 rounded-full ring-1 ring-[var(--gold)]/40 sm:h-24 sm:w-24"
                style={{ animation: "welcome-ring 3.2s ease-out infinite" }}
              />
              <span
                aria-hidden="true"
                className="absolute h-20 w-20 rounded-full ring-1 ring-[var(--gold)]/30 sm:h-24 sm:w-24"
                style={{ animation: "welcome-ring 3.2s ease-out infinite 1.05s" }}
              />
            </>
          )}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={reduced ? { duration: 0.4 } : { ...easeElegant, delay: 0.15, duration: 0.7 }}
            className="relative grid h-20 w-20 place-items-center rounded-2xl bg-navy font-display text-3xl font-semibold tracking-tight text-gold shadow-layered ring-1 ring-[var(--gold)]/40 sm:h-24 sm:w-24 sm:text-4xl"
            style={{ boxShadow: "var(--glow-gold)" }}
          >
            <span className="text-gold-gradient">JM</span>
          </motion.div>
        </div>

        {/* "Bienvenido de nuevo," */}
        <motion.p
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={reduced ? { duration: 0.4, delay: 0.1 } : { ...easeElegant, delay: 0.55, duration: 0.6 }}
          className="text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground sm:text-base"
        >
          Bienvenido de nuevo
        </motion.p>

        {/* Nombre real en degradado marca (oro → marino) */}
        <motion.h1
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={reduced ? { duration: 0.45, delay: 0.18 } : { ...easeElegant, delay: 0.8, duration: 0.7 }}
          className="mt-3 font-display text-4xl font-semibold leading-tight text-welcome-name sm:text-6xl"
        >
          {name}
        </motion.h1>

        {/* Hairline dorada + descriptor */}
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, scaleX: 0.4 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={reduced ? { duration: 0.4, delay: 0.25 } : { ...easeElegant, delay: 1.15, duration: 0.7 }}
          className="mt-6 h-px w-40 rule-gold sm:w-52"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? { duration: 0.4, delay: 0.3 } : { duration: 0.8, delay: 1.35 }}
          className="mt-4 text-[11px] font-medium uppercase tracking-[0.32em] text-muted-foreground/80"
        >
          JM Design · Gestión Legal
        </motion.p>
      </div>
    </motion.div>
  );
}

/** Manchas de aurora oscura (marino + dorado) contenidas en el overlay. */
function WelcomeAurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-[-15%] top-[-20%] h-[70vmax] w-[70vmax] rounded-full blur-[110px]"
        style={{
          background: "radial-gradient(circle at center, var(--aurora-1), transparent 65%)",
          animation: "aurora-drift-1 26s ease-in-out infinite, aurora-breathe 11s ease-in-out infinite",
        }}
      />
      <div
        className="absolute right-[-12%] top-[-5%] h-[58vmax] w-[58vmax] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle at center, var(--aurora-2), transparent 65%)",
          animation: "aurora-drift-2 32s ease-in-out infinite, aurora-breathe 13s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-25%] left-[15%] h-[64vmax] w-[64vmax] rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(circle at center, var(--aurora-3), transparent 65%)",
          animation: "aurora-drift-3 29s ease-in-out infinite, aurora-breathe 15s ease-in-out infinite",
        }}
      />
    </div>
  );
}
