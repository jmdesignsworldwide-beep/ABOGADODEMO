import type { Metadata } from "next";
import { Clock, Mail } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/brand/logo";
import { PremiumButton } from "@/components/ui/premium-button";
import { logout } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Acceso expirado · JM Design" };
export const dynamic = "force-dynamic";

export default function AccesoExpiradoPage() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <AuroraBackground interactive />

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="mb-7 flex justify-center">
          <Logo size="lg" descriptor={false} />
        </div>

        <div className="glass shadow-layered rounded-3xl p-7 text-center sm:p-9">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--critical-soft)] text-critical">
            <Clock className="h-8 w-8" strokeWidth={1.5} />
          </div>

          <h1 className="mt-5 font-display text-2xl font-semibold text-foreground">
            Tu acceso ha expirado
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Tu periodo de acceso al sistema ha finalizado. Para seguir usando
            JM Design — Gestión Legal, contacta a JM Designs y renueva tu cuenta.
          </p>

          <a
            href="mailto:jm.designs.worldwide@gmail.com?subject=Renovar%20acceso%20JM%20Design"
            className="mt-6 inline-flex"
          >
            <PremiumButton variant="gold" leftIcon={<Mail className="h-4 w-4" />}>
              Contactar a JM Designs
            </PremiumButton>
          </a>

          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Salir
            </button>
          </form>
        </div>

        <p className="mt-7 text-center text-xs text-muted-foreground">
          JM &amp; Asociados | Abogados ·{" "}
          <span className="text-gold-gradient font-medium">por JM Designs</span>
        </p>
      </div>
    </div>
  );
}
