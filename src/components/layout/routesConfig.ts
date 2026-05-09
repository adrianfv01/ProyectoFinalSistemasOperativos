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

export type RoutePrerequisite =
  | 'none'
  | 'requiresProcesses'
  | 'requiresSchedulingResult'
  | 'requiresReplacementSteps'

export interface FreeModeRoute {
  to: string
  label: string
  shortLabel: string
  icon: LucideIcon
  description: string
  prerequisite: RoutePrerequisite
}

export const FREE_MODE_ROUTES: FreeModeRoute[] = [
  {
    to: '/procesos',
    label: 'Procesos',
    shortLabel: 'Procesos',
    icon: ListPlus,
    description: 'Crea procesos e hilos que servirán de entrada al simulador.',
    prerequisite: 'none',
  },
  {
    to: '/planificacion',
    label: 'Planificación',
    shortLabel: 'Planif.',
    icon: CalendarClock,
    description: 'Aplica un algoritmo de scheduling sobre tus procesos.',
    prerequisite: 'requiresProcesses',
  },
  {
    to: '/memoria',
    label: 'Memoria',
    shortLabel: 'Memoria',
    icon: HardDrive,
    description: 'Reparte páginas en marcos de memoria física.',
    prerequisite: 'requiresProcesses',
  },
  {
    to: '/reemplazo',
    label: 'Reemplazo',
    shortLabel: 'Reempl.',
    icon: RefreshCw,
    description: 'Decide qué página sacar cuando ya no caben más.',
    prerequisite: 'requiresProcesses',
  },
  {
    to: '/metricas',
    label: 'Métricas',
    shortLabel: 'Métricas',
    icon: BarChart3,
    description: 'Resumen consolidado con gráficas comparativas.',
    prerequisite: 'requiresSchedulingResult',
  },
  {
    to: '/comparacion',
    label: 'Comparación',
    shortLabel: 'Compar.',
    icon: GitCompareArrows,
    description: 'Compara varios algoritmos sobre los mismos datos.',
    prerequisite: 'requiresProcesses',
  },
]

export const DEMOS_ROUTE: FreeModeRoute = {
  to: '/demos',
  label: 'Demos',
  shortLabel: 'Demos',
  icon: FlaskConical,
  description: 'Carga escenarios precargados listos para ejecutar.',
  prerequisite: 'none',
}

const ALL_ROUTES: FreeModeRoute[] = [...FREE_MODE_ROUTES, DEMOS_ROUTE]

export function getRouteIndex(pathname: string): number {
  return FREE_MODE_ROUTES.findIndex((r) => pathname.startsWith(r.to))
}

export function getRouteByPath(pathname: string): FreeModeRoute | undefined {
  return ALL_ROUTES.find((r) => pathname.startsWith(r.to))
}
