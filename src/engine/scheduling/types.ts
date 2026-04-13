import type { Process } from '../processes/types'

export interface TimeSlice {
  pid: number
  tid?: number
  start: number
  end: number
}

export interface ProcessMetrics {
  pid: number
  tid?: number
  completionTime: number
  turnaroundTime: number
  waitingTime: number
  responseTime: number
}

export interface AverageMetrics {
  avgTurnaroundTime: number
  avgWaitingTime: number
  avgResponseTime: number
}

export interface SchedulingResult {
  timeline: TimeSlice[]
  metrics: ProcessMetrics[]
  averages: AverageMetrics
  cpuUtilization: number
  contextSwitches: number
}

export interface SchedulerConfig {
  quantum?: number
  quantumPerLevel?: number[]
  queueAlgorithms?: string[]
}

export type SchedulerFn = (
  processes: Process[],
  config: SchedulerConfig,
) => SchedulingResult
