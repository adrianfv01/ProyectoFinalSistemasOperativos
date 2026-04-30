import {
  ListPlus,
  CalendarClock,
  HardDrive,
  RefreshCw,
  BarChart3,
  GitCompareArrows,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react'

export interface FreeModeRoute {
  to: string
  label: string
  shortLabel: string
  icon: LucideIcon
}

export const FREE_MODE_ROUTES: FreeModeRoute[] = [
  { to: '/procesos', label: 'Procesos', shortLabel: 'Procesos', icon: ListPlus },
  { to: '/planificacion', label: 'Planificación', shortLabel: 'Planif.', icon: CalendarClock },
  { to: '/memoria', label: 'Memoria', shortLabel: 'Memoria', icon: HardDrive },
  { to: '/reemplazo', label: 'Reemplazo', shortLabel: 'Reempl.', icon: RefreshCw },
  { to: '/metricas', label: 'Métricas', shortLabel: 'Métricas', icon: BarChart3 },
  { to: '/comparacion', label: 'Comparación', shortLabel: 'Compar.', icon: GitCompareArrows },
]

export const DEMOS_ROUTE: FreeModeRoute = {
  to: '/demos',
  label: 'Demos',
  shortLabel: 'Demos',
  icon: FlaskConical,
}

const ALL_ROUTES: FreeModeRoute[] = [...FREE_MODE_ROUTES, DEMOS_ROUTE]

export function getRouteIndex(pathname: string): number {
  return FREE_MODE_ROUTES.findIndex((r) => pathname.startsWith(r.to))
}

export function getRouteByPath(pathname: string): FreeModeRoute | undefined {
  return ALL_ROUTES.find((r) => pathname.startsWith(r.to))
}
