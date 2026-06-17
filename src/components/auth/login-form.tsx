"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";
import { login } from "@/app/login/actions";
import { cn } from "@/lib/utils";

/**
 * Formulario de login: usuario + contraseña puro. El email es interno y nunca
 * se muestra. La autenticación y la validación de acceso ocurren en el servidor.
 */
export function LoginForm() {
  const reduced = useReducedMotion();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("Ingresa tu usuario y contraseña.");
      return;
    }
    setLoading(true);
    const res = await login(username, password);
    // Si llega aquí con resultado, hubo error (el éxito redirige en el servidor).
    if (res && !res.ok) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="username" className="text-sm font-medium text-foreground">
          Usuario
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <input
            id="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tu usuario"
            className={inputCls}
          />
        </div>
      </div>

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

      {error && (
        <motion.p
          initial={reduced ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical"
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
