import {
  Calendar,
  FileStack,
  FileText,
  LayoutDashboard,
  Receipt,
  Scale,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Módulos aún no construidos: se muestran pero deshabilitados. */
  soon?: boolean;
};

/**
 * Navegación principal del sistema. En esta Tanda 1 solo "Panel" está activo;
 * el resto son destinos previstos (se irán activando en próximas tandas).
 */
export const navItems: NavItem[] = [
  { label: "Panel", href: "/panel", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Casos", href: "/casos", icon: Scale },
  { label: "Expedientes", href: "/expedientes", icon: FileStack },
  { label: "Agenda", href: "/agenda", icon: Calendar },
  { label: "Documentos", href: "/documentos", icon: FileText, soon: true },
  { label: "Facturación", href: "/facturacion", icon: Receipt, soon: true },
];
