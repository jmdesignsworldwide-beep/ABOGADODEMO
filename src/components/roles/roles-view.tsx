"use client";

import { Briefcase, Calculator, Scale, UserCog } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

type Nivel = "total" | "editar" | "ver" | "none";

const MODULOS = ["Clientes", "Casos", "Expedientes", "Agenda", "Recordatorios", "Documentos", "Contratos", "Facturación", "Finanzas", "Usuarios"];

const ROLES: { nombre: string; desc: string; icon: typeof Scale; permisos: Nivel[] }[] = [
  { nombre: "Socio", desc: "Acceso total al bufete", icon: Briefcase,
    permisos: ["total", "total", "total", "total", "total", "total", "total", "total", "total", "total"] },
  { nombre: "Abogado", desc: "Casos, clientes y documentos", icon: Scale,
    permisos: ["total", "total", "total", "total", "total", "total", "total", "ver", "ver", "none"] },
  { nombre: "Asistente", desc: "Agenda, recordatorios y archivos", icon: UserCog,
    permisos: ["ver", "ver", "ver", "editar", "total", "editar", "editar", "none", "none", "none"] },
  { nombre: "Contable", desc: "Facturación y finanzas", icon: Calculator,
    permisos: ["ver", "none", "none", "none", "none", "ver", "none", "total", "total", "none"] },
];

const NIVEL = {
  total: { label: "Total", cls: "bg-emerald-500/15 text-emerald-500" },
  editar: { label: "Editar", cls: "bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-gold" },
  ver: { label: "Ver", cls: "bg-[color-mix(in_srgb,var(--navy)_18%,transparent)] text-foreground" },
  none: { label: "—", cls: "text-muted-foreground/50" },
} as const;

export function RolesView() {
  return (
    <div className="space-y-6">
      <PageHeader title="Roles y permisos" subtitle="Estructura de acceso interno del bufete (demostración)" />

      {/* Tarjetas de roles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const total = r.permisos.filter((p) => p !== "none").length;
          return (
            <div key={r.nombre} className="rounded-2xl glass p-4 shadow-layered">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-gold"><Icon className="h-5 w-5" strokeWidth={1.75} /></span>
              <h3 className="mt-3 font-display text-base font-semibold text-foreground">{r.nombre}</h3>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
              <p className="mt-2 text-[11px] tabular text-muted-foreground">{total}/{MODULOS.length} módulos</p>
            </div>
          );
        })}
      </div>

      {/* Matriz de permisos */}
      <div className="rounded-2xl glass p-2 shadow-layered sm:p-4">
        <h3 className="px-2 pb-3 pt-2 font-display text-lg font-semibold text-foreground">Matriz de permisos</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-surface/95 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">Rol</th>
                {MODULOS.map((m) => (
                  <th key={m} className="whitespace-nowrap px-3 py-2 text-center text-[11px] font-medium text-muted-foreground">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r.nombre}>
                  <td className="sticky left-0 z-10 whitespace-nowrap border-t border-border bg-surface/95 px-3 py-2.5 font-medium text-foreground backdrop-blur">{r.nombre}</td>
                  {r.permisos.map((p, i) => (
                    <td key={i} className="border-t border-border px-3 py-2.5 text-center">
                      <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold", NIVEL[p].cls)}>{NIVEL[p].label}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-2 pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Total</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gold" /> Editar</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-navy" /> Ver</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Sin acceso</span>
        </div>
      </div>

      <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        Esta matriz ilustra la estructura de roles internos del bufete. El control de acceso del sistema (administrador vs. cliente) ya está activo y protege cada módulo en el servidor.
      </p>
    </div>
  );
}
