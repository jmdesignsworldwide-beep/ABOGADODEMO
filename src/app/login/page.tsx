import type { Metadata } from "next";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/auth/login-form";
import { LoginReveal } from "@/components/auth/login-reveal";

export const metadata: Metadata = {
  title: "Acceso · JM Design — Gestión Legal",
};

export default function LoginPage() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <AuroraBackground interactive />

      {/* Toggle de tema arriba a la derecha */}
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <LoginReveal>
        <div className="w-full max-w-[420px]">
          {/* Marca */}
          <div className="mb-7 flex flex-col items-center text-center">
            <Logo size="lg" descriptor={false} />
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Gestión Legal
            </p>
          </div>

          {/* Tarjeta de cristal */}
          <div className="glass shadow-layered rounded-3xl p-6 sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="font-display text-2xl font-semibold text-foreground">
                Bienvenido de vuelta
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Accede a tu bufete digital
              </p>
            </div>

            <LoginForm />
          </div>

          {/* Footer */}
          <p className="mt-7 text-center text-xs text-muted-foreground">
            JM &amp; Asociados | Abogados ·{" "}
            <span className="text-gold-gradient font-medium">por JM Designs</span>
          </p>
        </div>
      </LoginReveal>
    </div>
  );
}
