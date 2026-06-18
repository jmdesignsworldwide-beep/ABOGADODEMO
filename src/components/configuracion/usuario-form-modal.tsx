"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/field";
import { PremiumButton } from "@/components/ui/premium-button";
import { DiasSelector, resolveDias, type DiasMode } from "./dias-selector";
import { crearUsuario } from "@/app/(app)/configuracion/actions";

function generarPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function UsuarioFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(true);
  const [mode, setMode] = useState<DiasMode>("15");
  const [custom, setCustom] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim()) return setError("El usuario es obligatorio.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    setLoading(true);
    const res = await crearUsuario({ username, password, dias: resolveDias(mode, custom) });
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Nueva cuenta"
      title="Crear acceso de cliente"
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <PremiumButton variant="ghost" onClick={onClose} type="button">Cancelar</PremiumButton>
          <PremiumButton variant="gold" type="submit" form="usuario-form" loading={loading}>
            Crear cuenta
          </PremiumButton>
        </div>
      }
    >
      <form id="usuario-form" onSubmit={onSubmit} className="space-y-4">
        <Field label="Usuario" htmlFor="username" required hint="Lo que el cliente escribirá para entrar.">
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ej. bufete.cliente"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
          />
        </Field>

        <Field label="Contraseña" htmlFor="password" required>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
              <button type="button" aria-label="Generar contraseña" onClick={() => { setPassword(generarPassword()); setShowPw(true); }} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-gold">
                <Sparkles className="h-4.5 w-4.5" />
              </button>
              <button type="button" aria-label={showPw ? "Ocultar" : "Mostrar"} onClick={() => setShowPw((v) => !v)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground">
                {showPw ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>
        </Field>

        <DiasSelector mode={mode} custom={custom} onMode={setMode} onCustom={setCustom} />

        {error && (
          <p className="rounded-lg bg-[var(--critical-soft)] px-3 py-2 text-sm text-critical">{error}</p>
        )}
        <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Anota el usuario y la contraseña: por seguridad no se vuelven a mostrar. El cliente entra solo con
          esos datos.
        </p>
      </form>
    </Modal>
  );
}
