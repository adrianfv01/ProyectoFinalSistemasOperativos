import type { Process } from '../processes/types'
import type { SchedulerConfig, SchedulerFn, SchedulingResult } from './types'
import { fcfs } from './fcfs'
import { sjf } from './sjf'
import { hrrn } from './hrrn'
import { roundRobin } from './roundRobin'
import { srtf } from './srtf'
import { priorityPreemptive } from './priorityPreemptive'
import { multilevelQueue } from './multilevelQueue'
import { multilevelFeedback } from './multilevelFeedback'
import { computeMetrics, deepCopyProcesses, flattenTasks } from './metrics'
import { runPreemptiveSimulation } from './multiCore'
import type { SchedulableTask } from './metrics'

const schedulers: Record<string, SchedulerFn> = {
  fcfs,
  sjf,
  hrrn,
  roundRobin,
  srtf,
  priorityPreemptive,
  multilevelQueue,
  multilevelFeedback,
}

const NON_PREEMPTIVE = new Set(['fcfs', 'sjf', 'hrrn'])

/**
 * Versión "simulada" de los algoritmos no expropiativos: fuerza un solo
 * núcleo y aplica time-slicing fino (quantum = 1) reordenando la cola en
 * cada tick según la política del algoritmo. Esto permite ver cómo un solo
 * CPU rota velozmente entre tareas listas.
 */
function simulatedNonPreemptive(
  name: string,
  processes: Process[],
): SchedulingResult {
  const procs = deepCopyProcesses(processes)
  const tasks = flattenTasks(procs)

  const pickN = (
    ready: SchedulableTask[],
    n: number,
    currentTime: number,
  ): SchedulableTask[] => {
    const sorted = ready.slice()
    if (name === 'sjf') {
      sorted.sort(
        (a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime,
      )
    } else if (name === 'hrrn') {
      sorted.sort((a, b) => {
        const rrA = (currentTime - a.arrivalTime + a.burstTime) / a.burstTime
        const rrB = (currentTime - b.arrivalTime + b.burstTime) / b.burstTime
        return rrB - rrA || a.arrivalTime - b.arrivalTime
      })
    } else {
      sorted.sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid - b.pid)
    }
    return sorted.slice(0, n)
  }

  const sim = runPreemptiveSimulation(tasks, 1, { pickN })

  return computeMetrics(procs, sim.timeline, {
    timelinePerCore: sim.timelinePerCore,
    numCores: 1,
  })
}

export function getScheduler(name: string): SchedulerFn {
  const fn = schedulers[name]
  if (!fn) {
    throw new Error(`Algoritmo de planificación desconocido: "${name}"`)
  }

  return (processes, config) => {
    const parallelism = config.parallelism ?? 'real'
    if (parallelism === 'simulated') {
      const simConfig: SchedulerConfig = { ...config, numCores: 1 }
      if (NON_PREEMPTIVE.has(name)) {
        return simulatedNonPreemptive(name, processes)
      }
      return fn(processes, simConfig)
    }
    return fn(processes, config)
  }
}

export { schedulers }
export * from './types'
export { computeMetrics } from './metrics'
