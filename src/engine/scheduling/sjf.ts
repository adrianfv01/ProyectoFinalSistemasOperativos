import type { Process } from '../processes/types'
import type { SchedulerConfig, SchedulingResult, TimeSlice } from './types'
import {
  computeMetrics,
  deepCopyProcesses,
  flattenTasks,
  taskKey,
} from './metrics'

export function sjf(
  processes: Process[],
  _config: SchedulerConfig,
): SchedulingResult {
  const procs = deepCopyProcesses(processes)
  const tasks = flattenTasks(procs)
  const timeline: TimeSlice[] = []
  let currentTime = 0
  const completed = new Set<string>()

  while (completed.size < tasks.length) {
    const available = tasks.filter(
      (t) => t.arrivalTime <= currentTime && !completed.has(taskKey(t)),
    )

    if (available.length === 0) {
      currentTime = tasks
        .filter((t) => !completed.has(taskKey(t)))
        .reduce((min, t) => Math.min(min, t.arrivalTime), Infinity)
      continue
    }

    available.sort(
      (a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime,
    )
    const task = available[0]

    timeline.push({
      pid: task.pid,
      tid: task.tid,
      start: currentTime,
      end: currentTime + task.burstTime,
    })
    currentTime += task.burstTime
    completed.add(taskKey(task))
  }

  return computeMetrics(procs, timeline)
}
