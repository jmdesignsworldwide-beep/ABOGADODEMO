"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

/** Botón/enlace que cierra la sesión (server action). */
export function LogoutButton({
  className,
  children = "Cerrar sesión",
  withIcon = true,
}: {
  className?: string;
  children?: React.ReactNode;
  withIcon?: boolean;
}) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className={cn(
          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
          className,
        )}
      >
        {withIcon && <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        {children}
      </button>
    </form>
  );
}
