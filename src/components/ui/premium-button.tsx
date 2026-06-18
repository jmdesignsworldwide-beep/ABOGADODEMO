"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface PremiumButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium select-none " +
  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-navy text-navy-foreground hover:bg-navy-strong shadow-layered hover:glow-navy",
  gold:
    "text-gold-foreground shadow-layered hover:glow-gold " +
    "bg-[linear-gradient(135deg,var(--gold-bright),var(--gold))]",
  outline:
    "border border-[var(--gold)] text-gold hover:bg-[color-mix(in_srgb,var(--gold)_12%,transparent)]",
  ghost: "text-foreground/80 hover:bg-muted hover:text-foreground",
};

/**
 * PremiumButton — botón con micro-interacción (press) y estado de carga.
 * Variantes: primary (marino), gold (degradado dorado), outline, ghost.
 * Respeta reduced-motion (sin escala). Reutilizable en todo el sistema.
 */
export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth,
      disabled,
      ...props
    },
    ref,
  ) => {
    const reduced = useReducedMotion();
    return (
      <motion.button
        ref={ref}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        whileHover={reduced ? undefined : { scale: 1.015 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        disabled={disabled || loading}
        className={cn(base, sizes[size], variants[variant], fullWidth && "w-full", className)}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon}
        <span className="relative">{children}</span>
        {!loading && rightIcon}
      </motion.button>
    );
  },
);
PremiumButton.displayName = "PremiumButton";
