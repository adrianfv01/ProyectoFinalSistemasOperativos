import type { SchedulerFn } from './types'
import { fcfs } from './fcfs'
import { sjf } from './sjf'
import { hrrn } from './hrrn'
import { roundRobin } from './roundRobin'
import { srtf } from './srtf'
import { priorityPreemptive } from './priorityPreemptive'
import { multilevelQueue } from './multilevelQueue'
import { multilevelFeedback } from './multilevelFeedback'

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

export function getScheduler(name: string): SchedulerFn {
  const fn = schedulers[name]
  if (!fn) {
    throw new Error(`Algoritmo de planificación desconocido: "${name}"`)
  }
  return fn
}

export { schedulers }
export * from './types'
export { computeMetrics } from './metrics'
