"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";
import { cn } from "@/lib/utils";

/**
 * Formulario de login — funcional y LISTO para conectar con Supabase Auth.
 * Hoy hace una validación básica y entra al panel (modo demo). Cuando
 * conectemos auth, se reemplaza la sección marcada por
 * `supabase.auth.signInWithPassword(...)`.
 */
export function LoginForm() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("El correo no tiene un formato válido.");
      return;
    }

    setLoading(true);
    // ── Aquí irá la autenticación real con Supabase ──────────────────────
    //   const supabase = createClient();
    //   const { error } = await supabase.auth.signInWithPassword({ email, password });
    //   if (error) { setError(error.message); setLoading(false); return; }
    // ─────────────────────────────────────────────────────────────────────
    await new Promise((r) => setTimeout(r, 700)); // simula la llamada
    router.push("/panel");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Correo */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="abogado@jmasociados.do"
            className={inputCls}
          />
        </div>
      </div>

      {/* Contraseña */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <input
            id="password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={cn(inputCls, "pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPw ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
          <input type="checkbox" className="accent-[var(--gold)]" />
          Recordarme
        </label>
        <a href="#" className="font-medium text-gold transition-opacity hover:opacity-80">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {error && (
        <motion.p
          initial={reduced ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-rose-500/12 px-3 py-2 text-sm text-rose-500"
        >
          {error}
        </motion.p>
      )}

      <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={loading}>
        Entrar
      </PremiumButton>
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background/40 pl-11 pr-3.5 text-sm text-foreground " +
  "placeholder:text-muted-foreground/70 outline-none transition-colors " +
  "focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--ring)]";
