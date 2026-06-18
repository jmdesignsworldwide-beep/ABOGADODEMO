"use client";

import { useMemo, useState } from "react";
import { FilePlus2, FileX2, History, LogIn, PencilLine, Search, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { initials } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AuditoriaEntrada } from "@/lib/db/types";

const ACCION = {
  crear: { label: "Creó", icon: FilePlus2, cls: "bg-emerald-500/15 text-emerald-500" },
  editar: { label: "Editó", icon: PencilLine, cls: "bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-gold" },
  eliminar: { label: "Eliminó", icon: FileX2, cls: "bg-[var(--critical-soft)] text-critical" },
  login: { label: "Acceso", icon: LogIn, cls: "bg-[color-mix(in_srgb,var(--navy)_18%,transparent)] text-foreground" },
  respaldo: { label: "Respaldo", icon: ShieldCheck, cls: "bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-gold" },
} as const;

function accionMeta(a: string) {
  return ACCION[a as keyof typeof ACCION] ?? { label: a, icon: History, cls: "bg-muted text-muted-foreground" };
}

function diaLabel(iso: string): string {
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date(); ayer.setDate(hoy.getDate() - 1);
  if (d.toDateString() === hoy.toDateString()) return "Hoy";
  if (d.toDateString() === ayer.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" });
}
function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit" });
}

export function AuditoriaView({ entradas }: { entradas: AuditoriaEntrada[] }) {
  const [query, setQuery] = useState("");
  const [usuario, setUsuario] = useState("todos");
  const [modulo, setModulo] = useState("todos");

  const usuarios = useMemo(() => [...new Set(entradas.map((e) => e.usuario).filter(Boolean))] as string[], [entradas]);
  const modulos = useMemo(() => [...new Set(entradas.map((e) => e.modulo))], [entradas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entradas.filter((e) => {
      if (usuario !== "todos" && e.usuario !== usuario) return false;
      if (modulo !== "todos" && e.modulo !== modulo) return false;
      if (!q) return true;
      return [e.detalle, e.usuario, e.modulo].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
    });
  }, [entradas, query, usuario, modulo]);

  // Agrupar por día
  const grupos = useMemo(() => {
    const map = new Map<string, AuditoriaEntrada[]>();
    for (const e of filtered) {
      const k = diaLabel(e.created_at);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader title="Historial / Auditoría" subtitle="Registro vivo de acciones en el sistema" />

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar en el historial…" className="pl-11" aria-label="Buscar" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Select value={usuario} onChange={(e) => setUsuario(e.target.value)} aria-label="Filtrar por usuario" className="sm:w-40">
            <option value="todos">Todos los usuarios</option>
            {usuarios.map((u) => <option key={u} value={u}>{u}</option>)}
          </Select>
          <Select value={modulo} onChange={(e) => setModulo(e.target.value)} aria-label="Filtrar por módulo" className="sm:w-40">
            <option value="todos">Todos los módulos</option>
            {modulos.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={History} title="Sin registros" description="No hay acciones que coincidan con los filtros." />
      ) : (
        <div className="space-y-8">
          {grupos.map(([dia, items]) => (
            <section key={dia}>
              <div className="mb-3 flex items-center gap-3">
                <h3 className="font-display text-base font-semibold capitalize text-foreground">{dia}</h3>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Stagger className="space-y-2">
                {items.map((e) => {
                  const m = accionMeta(e.accion);
                  const Icon = m.icon;
                  return (
                    <StaggerItem key={e.id}>
                      <div className="flex items-start gap-3 rounded-2xl glass p-3.5 shadow-layered">
                        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", m.cls)}><Icon className="h-4 w-4" strokeWidth={1.75} /></span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground"><span className="font-medium">{e.detalle ?? m.label}</span></p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <span className="grid h-4 w-4 place-items-center rounded bg-navy text-[8px] font-semibold text-gold-on-navy">{initials(e.usuario ?? "·")}</span>
                              {e.usuario ?? "sistema"}
                            </span>
                            <span>·</span>
                            <span className="rounded bg-muted px-1.5 py-0.5 font-medium">{e.modulo}</span>
                            <span>·</span>
                            <span className="tabular">{hora(e.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
