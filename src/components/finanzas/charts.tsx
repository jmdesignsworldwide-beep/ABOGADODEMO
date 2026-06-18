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
export function IngresosEgresosChart({
  data,
  onMonthClick,
}: {
  data: { mes: string; key: string; ingresos: number; egresos: number }[];
  onMonthClick?: (key: string, mes: string) => void;
}) {
  const t = useChartTheme();
  const reduced = useReducedMotion();
  const mounted = useMounted();
  if (!mounted) return <ChartSkeleton />;

  const handle = (p: unknown) => {
    const row = p as { key?: string; mes?: string };
    if (row?.key && onMonthClick) onMonthClick(row.key, row.mes ?? "");
  };

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
                { label: String(label), value: "" },
                { label: "Ingresos", value: formatRD(Number(payload.find((p) => p.dataKey === "ingresos")?.value ?? 0)), color: t.ingresos },
                { label: "Egresos", value: formatRD(Number(payload.find((p) => p.dataKey === "egresos")?.value ?? 0)), color: t.egresos },
              ]} />
            ) : null
          }
        />
        <Bar dataKey="ingresos" fill={t.ingresos} radius={[5, 5, 0, 0]} isAnimationActive={!reduced} maxBarSize={28} onClick={onMonthClick ? handle : undefined} />
        <Bar dataKey="egresos" fill={t.egresos} radius={[5, 5, 0, 0]} isAnimationActive={!reduced} maxBarSize={28} onClick={onMonthClick ? handle : undefined} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Egresos por categoría (dona + leyenda) ──────────────────────────────── */
export function EgresosCategoriaChart({
  data,
  onCategoriaClick,
}: {
  data: { categoria: CategoriaEgreso; monto: number }[];
  onCategoriaClick?: (c: CategoriaEgreso) => void;
}) {
  const t = useChartTheme();
  const reduced = useReducedMotion();
  const mounted = useMounted();
  const total = data.reduce((a, d) => a + d.monto, 0);
  if (!mounted) return <ChartSkeleton h={240} />;
  if (total === 0) return <p className="py-10 text-center text-sm text-muted-foreground">Sin egresos registrados.</p>;

  const handle = (p: unknown) => {
    const row = p as { categoria?: CategoriaEgreso };
    if (row?.categoria && onCategoriaClick) onCategoriaClick(row.categoria);
  };

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="monto" nameKey="categoria" cx="50%" cy="50%" innerRadius={54} outerRadius={86} paddingAngle={2} stroke="none" isAnimationActive={!reduced} onClick={onCategoriaClick ? handle : undefined}>
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
      <ul className="w-full min-w-0 space-y-1.5">
        {data.map((d, i) => (
          <li key={d.categoria}>
            <button
              type="button"
              onClick={() => onCategoriaClick?.(d.categoria)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: t.categoria[i % t.categoria.length] }} />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{CATEGORIA_EGRESO_LABEL[d.categoria]}</span>
              <span className="shrink-0 whitespace-nowrap tabular font-medium text-foreground">{formatRD(d.monto)}</span>
              <span className="w-9 shrink-0 text-right text-xs tabular text-muted-foreground">{Math.round((d.monto / total) * 100)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Honorarios: cobrado vs pendiente (apilado, contenido) ───────────────── */
export function HonorariosChart({
  cobrado,
  pendiente,
  onSegmentClick,
}: {
  cobrado: number;
  pendiente: number;
  onSegmentClick?: (seg: "cobrado" | "pendiente") => void;
}) {
  const t = useChartTheme();
  const reduced = useReducedMotion();
  const mounted = useMounted();
  const total = cobrado + pendiente;
  if (!mounted) return <ChartSkeleton h={240} />;
  if (total === 0) return <p className="py-10 text-center text-sm text-muted-foreground">Sin honorarios registrados.</p>;

  const data = [
    { name: "Cobrado", seg: "cobrado" as const, value: cobrado, color: t.ingresos },
    { name: "Pendiente", seg: "pendiente" as const, value: pendiente, color: t.balance },
  ];

  const handle = (p: unknown) => {
    const row = p as { seg?: "cobrado" | "pendiente" };
    if (row?.seg && onSegmentClick) onSegmentClick(row.seg);
  };

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-4">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={54} outerRadius={86} paddingAngle={2} stroke="none" isAnimationActive={!reduced} onClick={onSegmentClick ? handle : undefined}>
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <TooltipBox t={t} rows={[{ label: String(payload[0].name), value: formatRD(Number(payload[0].value)), color: payload[0].payload.color }]} />
            ) : null} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-muted-foreground">Cobrado</span>
          <span className="tabular text-sm font-semibold text-foreground">{Math.round((cobrado / total) * 100)}%</span>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-2">
        {data.map((d) => (
          <li key={d.name}>
            <button
              type="button"
              onClick={() => onSegmentClick?.(d.seg)}
              className="flex w-full items-center gap-2 rounded-xl border border-border p-3 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{d.name}</span>
              <span className="shrink-0 whitespace-nowrap tabular font-semibold text-foreground">{formatRD(d.value)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
