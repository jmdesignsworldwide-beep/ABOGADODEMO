# JM Design — Gestión Legal

Sistema de gestión legal premium para **JM & Asociados | Abogados** (bufete ficticio dominicano).

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Supabase · lucide-react · Vercel.

> Tanda 1 = cimientos: sistema de diseño, login y layout principal. Aún sin módulos de negocio.

---

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellena las llaves de Supabase
npm run dev                   # http://localhost:3000
```

### Variables de entorno

| Variable | Visibilidad | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Cliente navegador/servidor (con RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreta — solo servidor** | Cliente admin (salta RLS). Nunca con prefijo `NEXT_PUBLIC_`; en Vercel márcala *Sensitive*. |

---

## Sistema de diseño

### Tokens y temas
Todo el color vive en `src/app/globals.css` como variables CSS, mapeadas a utilidades Tailwind (`bg-background`, `text-gold`, `border-border`, `bg-navy`…). Hay **dos temas premium**: oscuro (near-black + marino, dorado que brilla) y claro (crema cálido + marino de acento). Cambia un token y todo el sistema lo hereda. El tema se conmuta con `<ThemeToggle/>` y se recuerda (next-themes).

### Primitivos reutilizables (`src/components/ui/`)

| Componente | Qué hace |
| --- | --- |
| `AuroraBackground` | Fondo aurora que respira (lento, sutil). Capa de fondo reutilizable. |
| `MagneticCard` | Tarjeta de cristal con hover magnético (escala + elevación + sheen 3D). |
| `PremiumButton` | Botón con micro-interacción y estado de carga. Variantes: primary, gold, outline, ghost. |
| `KpiCard` | Indicador con número *count-up* + tendencia. |
| `CountUp` | Número que cuenta hacia arriba al entrar en pantalla (tabular). |
| `ProgressBar` | Barra que se llena animándose (degradado marino→dorado). |
| `Skeleton` / `SkeletonCard` | Placeholder de carga con shimmer elegante. |
| `Stagger` / `StaggerItem` | Entrada en cascada (stagger ~70 ms con spring). |
| `ThemeToggle` | Conmutador sol/luna animado y persistente. |

La configuración de movimiento (springs, variantes, transición de página) está centralizada en `src/lib/motion.ts`. **Todo respeta `prefers-reduced-motion`** (vía `useReducedMotion` en los primitivos + regla global en `globals.css`).

### Layout (`src/components/layout/`)
`Sidebar` (escritorio) ↔ `MobileNav` (hamburguesa con drawer) comparten `NavLinks`. `Header` con toggle de tema y usuario. `PageTransition` anima el cambio de vistas con `AnimatePresence`.

---

## Supabase

Clientes en `src/lib/supabase/`:
- `client.ts` — navegador (anon).
- `server.ts` — Server Components / Actions (anon + cookies).
- `admin.ts` — `service_role`, **solo servidor** (protegido con `server-only`).
- `middleware.ts` + `src/proxy.ts` — refresco de sesión.

Las migraciones de esquema se aplican vía **Management API con un Personal Access Token temporal** (no se usa connection string permanente).
