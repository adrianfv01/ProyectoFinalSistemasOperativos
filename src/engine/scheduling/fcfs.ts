import type { Process } from '../processes/types'
import type { SchedulerConfig, SchedulingResult, TimeSlice } from './types'
import { computeMetrics, deepCopyProcesses, flattenTasks } from './metrics'
import { assignToFreeCore, mergeContiguous, type CoreState } from './multiCore'

export function fcfs(
  processes: Process[],
  config: SchedulerConfig,
): SchedulingResult {
  const procs = deepCopyProcesses(processes)
  const tasks = flattenTasks(procs)
  const numCores = Math.max(1, config.numCores ?? 1)

  tasks.sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid - b.pid)

  const cores: CoreState[] = Array.from({ length: numCores }, () => ({ freeAt: 0 }))
  const perCore: TimeSlice[][] = Array.from({ length: numCores }, () => [])

  for (const task of tasks) {
    const slice = assignToFreeCore(cores, task)
    perCore[slice.core].push(slice)
  }

  const merged = perCore.map((row) => mergeContiguous(row))
  const flat = merged
    .flat()
    .slice()
    .sort((a, b) => a.start - b.start || (a.core ?? 0) - (b.core ?? 0))

  return computeMetrics(procs, flat, { timelinePerCore: merged, numCores })
}
