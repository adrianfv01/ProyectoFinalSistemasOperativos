import { useProcessStore } from '../../store/processStore'
import { useSchedulingStore } from '../../store/schedulingStore'
import { useMemoryStore } from '../../store/memoryStore'
import type { RoutePrerequisite } from './routesConfig'

export function usePrerequisitesStatus(): Record<RoutePrerequisite, boolean> {
  const hasProcesses = useProcessStore((s) => s.processes.length > 0)
  const hasSchedulingResult = useSchedulingStore((s) => s.result !== null)
  const hasReplacementSteps = useMemoryStore(
    (s) => s.replacementSteps.length > 0,
  )

  return {
    none: true,
    requiresProcesses: hasProcesses,
    requiresSchedulingResult: hasSchedulingResult,
    requiresReplacementSteps: hasReplacementSteps,
  }
}

export function describePrerequisite(prereq: RoutePrerequisite): string | null {
  switch (prereq) {
    case 'requiresProcesses':
      return 'Requiere procesos en el módulo Procesos.'
    case 'requiresSchedulingResult':
      return 'Requiere ejecutar primero un algoritmo en Planificación.'
    case 'requiresReplacementSteps':
      return 'Requiere ejecutar primero un algoritmo en Reemplazo.'
    default:
      return null
  }
}
