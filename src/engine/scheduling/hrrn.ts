import type { Process } from '../processes/types'
import type { SchedulerConfig, SchedulingResult, TimeSlice } from './types'
import {
  computeMetrics,
  deepCopyProcesses,
  flattenTasks,
  taskKey,
} from './metrics'
import { mergeContiguous, type CoreState } from './multiCore'

export function hrrn(
  processes: Process[],
  config: SchedulerConfig,
): SchedulingResult {
  const procs = deepCopyProcesses(processes)
  const tasks = flattenTasks(procs)
  const numCores = Math.max(1, config.numCores ?? 1)
  const cores: CoreState[] = Array.from({ length: numCores }, () => ({ freeAt: 0 }))
  const perCore: TimeSlice[][] = Array.from({ length: numCores }, () => [])
  const completed = new Set<string>()

  while (completed.size < tasks.length) {
    let coreIdx = 0
    for (let i = 1; i < cores.length; i++) {
      if (cores[i].freeAt < cores[coreIdx].freeAt) coreIdx = i
    }
    const coreFreeAt = cores[coreIdx].freeAt

    const pendingTasks = tasks.filter((t) => !completed.has(taskKey(t)))
    if (pendingTasks.length === 0) break

    let available = pendingTasks.filter((t) => t.arrivalTime <= coreFreeAt)
    let startTime = coreFreeAt

    if (available.length === 0) {
      startTime = pendingTasks.reduce(
        (min, t) => Math.min(min, t.arrivalTime),
        Infinity,
      )
      available = pendingTasks.filter((t) => t.arrivalTime <= startTime)
    }

    available.sort((a, b) => {
      const rrA = (startTime - a.arrivalTime + a.burstTime) / a.burstTime
      const rrB = (startTime - b.arrivalTime + b.burstTime) / b.burstTime
      return rrB - rrA || a.arrivalTime - b.arrivalTime
    })
    const task = available[0]

    perCore[coreIdx].push({
      pid: task.pid,
      tid: task.tid,
      start: startTime,
      end: startTime + task.burstTime,
      core: coreIdx,
    })
    cores[coreIdx].freeAt = startTime + task.burstTime
    completed.add(taskKey(task))
  }

  const merged = perCore.map((row) => mergeContiguous(row))
  const flat = merged
    .flat()
    .slice()
    .sort((a, b) => a.start - b.start || (a.core ?? 0) - (b.core ?? 0))

  return computeMetrics(procs, flat, { timelinePerCore: merged, numCores })
}
