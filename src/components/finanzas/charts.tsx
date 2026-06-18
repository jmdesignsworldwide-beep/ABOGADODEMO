"use client";

import { useReducedMotion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme, useMounted, rdCompact } from "./use-chart-theme";
import { formatRD } from "@/lib/facturas";
import { CATEGORIA_EGRESO_LABEL, type CategoriaEgreso } from "@/lib/db/types";
import { cn } from "@/lib/utils";

function ChartSkeleton({ h = 280 }: { h?: number }) {
  return <div className="w-full animate-pulse rounded-xl bg-muted/50" style={{ height: h }} />;
}

function TooltipBox({ t, rows }: { t: ReturnType<typeof useChartTheme>; rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-layered" style={{ background: t.tooltipBg, borderColor: t.tooltipBorder, color: t.text }}>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 tabular">
          {r.color && <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />}
          <span className="opacity-70">{r.label}:</span>
          <span className="font-medium">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Ingresos vs Egresos por mes ─────────────────────────────────────────── */
export function IngresosEgresosChart({ data }: { data: { mes: string; ingresos: number; egresos: number }[] }) {
  const t = useChartTheme();
  const reduced = useReducedMotion();
  const mounted = useMounted();
  if (!mounted) return <ChartSkeleton />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={4}>
        <XAxis dataKey="mes" tick={{ fill: t.axis, fontSize: 12 }} axisLine={{ stroke: t.grid }} tickLine={false} />
        <YAxis tickFormatter={rdCompact} tick={{ fill: t.axis, fontSize: 11 }} axisLine={false} tickLine={false} width={64} />
        <Tooltip
          cursor={{ fill: t.grid }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipBox t={t} rows={[
                { label: String(label), value: "", },
                { label: "Ingresos", value: formatRD(Number(payload.find((p) => p.dataKey === "ingresos")?.value ?? 0)), color: t.ingresos },
                { label: "Egresos", value: formatRD(Number(payload.find((p) => p.dataKey === "egresos")?.value ?? 0)), color: t.egresos },
              ]} />
            ) : null
          }
        />
        <Bar dataKey="ingresos" fill={t.ingresos} radius={[5, 5, 0, 0]} isAnimationActive={!reduced} maxBarSize={28} />
        <Bar dataKey="egresos" fill={t.egresos} radius={[5, 5, 0, 0]} isAnimationActive={!reduced} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Egresos por categoría (dona + leyenda) ──────────────────────────────── */
export function EgresosCategoriaChart({ data }: { data: { categoria: CategoriaEgreso; monto: number }[] }) {
  const t = useChartTheme();
  const reduced = useReducedMotion();
  const mounted = useMounted();
  const total = data.reduce((a, d) => a + d.monto, 0);
  if (!mounted) return <ChartSkeleton h={240} />;
  if (total === 0) return <p className="py-10 text-center text-sm text-muted-foreground">Sin egresos registrados.</p>;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-[200px] w-[200px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="monto" nameKey="categoria" cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={2} stroke="none" isAnimationActive={!reduced}>
              {data.map((d, i) => <Cell key={d.categoria} fill={t.categoria[i % t.categoria.length]} />)}
            </Pie>
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <TooltipBox t={t} rows={[{ label: CATEGORIA_EGRESO_LABEL[payload[0].payload.categoria as CategoriaEgreso], value: formatRD(Number(payload[0].value)), color: payload[0].payload.fill }]} />
            ) : null} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-muted-foreground">Total</span>
          <span className="tabular text-sm font-semibold text-foreground">{rdCompact(total)}</span>
        </div>
      </div>
      <ul className="w-full space-y-1.5">
        {data.map((d, i) => (
          <li key={d.categoria} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: t.categoria[i % t.categoria.length] }} />
            <span className="flex-1 truncate text-muted-foreground">{CATEGORIA_EGRESO_LABEL[d.categoria]}</span>
            <span className="tabular font-medium text-foreground">{formatRD(d.monto)}</span>
            <span className="w-10 text-right text-xs tabular text-muted-foreground">{Math.round((d.monto / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Honorarios: cobrado vs pendiente ────────────────────────────────────── */
export function HonorariosChart({ cobrado, pendiente }: { cobrado: number; pendiente: number }) {
  const t = useChartTheme();
  const reduced = useReducedMotion();
  const mounted = useMounted();
  const total = cobrado + pendiente;
  if (!mounted) return <ChartSkeleton h={240} />;
  if (total === 0) return <p className="py-10 text-center text-sm text-muted-foreground">Sin honorarios registrados.</p>;

  const data = [
    { name: "Cobrado", value: cobrado, color: t.ingresos },
    { name: "Pendiente", value: pendiente, color: t.balance },
  ];

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-[200px] w-[200px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={2} stroke="none" isAnimationActive={!reduced}>
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <TooltipBox t={t} rows={[{ label: String(payload[0].name), value: formatRD(Number(payload[0].value)), color: payload[0].payload.color }]} />
            ) : null} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-muted-foreground">Cobrado</span>
          <span className="tabular text-sm font-semibold text-foreground">{total > 0 ? Math.round((cobrado / total) * 100) : 0}%</span>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {data.map((d) => (
          <li key={d.name} className={cn("flex items-center gap-2 rounded-xl border border-border p-3 text-sm")}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="flex-1 text-muted-foreground">{d.name}</span>
            <span className="tabular font-semibold text-foreground">{formatRD(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
