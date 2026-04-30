import type { TimeSlice } from './types'
import type { SchedulableTask } from './metrics'

export interface CoreState {
  freeAt: number
}

export interface CoreSlot {
  task: SchedulableTask | null
}

/**
 * Asigna una tarea al primer núcleo que quede libre. Útil para
 * algoritmos no expropiativos (FCFS, SJF, HRRN). El reloj de cada
 * núcleo respeta el tiempo de llegada de la tarea.
 */
export function assignToFreeCore(
  cores: CoreState[],
  task: { pid: number; tid?: number; arrivalTime: number; burstTime: number },
): TimeSlice & { core: number } {
  let coreIdx = 0
  for (let i = 1; i < cores.length; i++) {
    if (cores[i].freeAt < cores[coreIdx].freeAt) coreIdx = i
  }
  const start = Math.max(cores[coreIdx].freeAt, task.arrivalTime)
  const end = start + task.burstTime
  cores[coreIdx].freeAt = end
  return { pid: task.pid, tid: task.tid, start, end, core: coreIdx }
}

/**
 * Fusiona slices consecutivos de un mismo (pid, tid, core) que estén
 * pegados en el tiempo, manteniendo el Gantt sin barras minúsculas.
 */
export function mergeContiguous(slices: TimeSlice[]): TimeSlice[] {
  if (slices.length === 0) return slices
  const out: TimeSlice[] = []
  for (const s of slices) {
    const prev = out[out.length - 1]
    if (
      prev &&
      prev.pid === s.pid &&
      prev.tid === s.tid &&
      prev.core === s.core &&
      prev.end === s.start
    ) {
      prev.end = s.end
    } else {
      out.push({ ...s })
    }
  }
  return out
}

/**
 * Resultado del simulador expropiativo por tick.
 */
export interface PreemptiveSimulationResult {
  timeline: TimeSlice[]
  timelinePerCore: TimeSlice[][]
  numCores: number
}

/**
 * Simulador genérico expropiativo por tick para múltiples núcleos.
 *
 * @param tasks       Tareas a ejecutar (rafagas y tiempos de llegada).
 * @param numCores    Número de núcleos disponibles.
 * @param pickN       Función que, dadas las tareas listas en este tick,
 *                    decide hasta `n` tareas a ejecutar (en orden de prioridad
 *                    del algoritmo). Recibe el tiempo actual y debe devolver
 *                    como máximo `n` referencias del array `ready`.
 * @param onTickStart Hook opcional para encolar tareas antes de seleccionar
 *                    (útil para colas multinivel donde la llegada importa).
 * @param onTaskAdvanced Hook opcional invocado cuando una tarea avanza un
 *                    tick (útil para colas con retroalimentación).
 */
export function runPreemptiveSimulation(
  tasks: SchedulableTask[],
  numCores: number,
  options: {
    pickN: (
      readyTasks: SchedulableTask[],
      n: number,
      currentTime: number,
    ) => SchedulableTask[]
    onTickStart?: (currentTime: number) => void
    onTaskFinished?: (task: SchedulableTask, finishedAt: number) => void
    /**
     * Indica si la tarea sigue siendo elegible. Si retorna false, no se vuelve
     * a considerar como ready (por ejemplo, ya esta corriendo en otro core).
     */
    isReady?: (task: SchedulableTask, currentTime: number) => boolean
  },
): PreemptiveSimulationResult {
  const cores = Math.max(1, numCores)
  const perCore: TimeSlice[][] = Array.from({ length: cores }, () => [])
  let currentTime = 0

  const remaining = () => tasks.some((t) => t.remainingTime > 0)
  const nextArrival = () =>
    tasks
      .filter((t) => t.remainingTime > 0 && t.arrivalTime > currentTime)
      .reduce((m, t) => Math.min(m, t.arrivalTime), Infinity)
  const anyReady = () =>
    tasks.some((t) => t.remainingTime > 0 && t.arrivalTime <= currentTime)

  let safety = 0
  const maxIters = 1_000_000

  while (remaining() && safety++ < maxIters) {
    if (!anyReady()) {
      const na = nextArrival()
      if (na === Infinity) break
      currentTime = na
    }

    options.onTickStart?.(currentTime)

    const ready = tasks.filter(
      (t) =>
        t.remainingTime > 0 &&
        t.arrivalTime <= currentTime &&
        (options.isReady ? options.isReady(t, currentTime) : true),
    )

    const picked = options.pickN(ready, cores, currentTime).slice(0, cores)

    if (picked.length === 0) {
      const na = nextArrival()
      if (na === Infinity) break
      currentTime = na
      continue
    }

    for (let coreIdx = 0; coreIdx < picked.length; coreIdx++) {
      const task = picked[coreIdx]
      const lastForCore = perCore[coreIdx][perCore[coreIdx].length - 1]
      if (
        lastForCore &&
        lastForCore.pid === task.pid &&
        lastForCore.tid === task.tid &&
        lastForCore.end === currentTime
      ) {
        lastForCore.end = currentTime + 1
      } else {
        perCore[coreIdx].push({
          pid: task.pid,
          tid: task.tid,
          start: currentTime,
          end: currentTime + 1,
          core: coreIdx,
        })
      }
      task.remainingTime -= 1
      if (task.remainingTime === 0) {
        options.onTaskFinished?.(task, currentTime + 1)
      }
    }

    currentTime += 1
  }

  const merged = perCore.map((row) => mergeContiguous(row))
  const flat = merged
    .flat()
    .slice()
    .sort((a, b) => a.start - b.start || (a.core ?? 0) - (b.core ?? 0))

  return { timeline: flat, timelinePerCore: merged, numCores: cores }
}
