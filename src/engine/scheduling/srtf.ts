import type { Process } from '../processes/types'
import type { SchedulerConfig, SchedulingResult, TimeSlice } from './types'
import {
  computeMetrics,
  deepCopyProcesses,
  flattenTasks,
  taskKey,
  SchedulableTask,
} from './metrics'

export function srtf(
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
      (t) => t.arrivalTime <= currentTime && t.remainingTime > 0,
    )

    if (available.length === 0) {
      currentTime = tasks
        .filter((t) => t.remainingTime > 0)
        .reduce((min, t) => Math.min(min, t.arrivalTime), Infinity)
      continue
    }

    available.sort(
      (a, b) =>
        a.remainingTime - b.remainingTime || a.arrivalTime - b.arrivalTime,
    )
    const task = available[0]

    const nextArrival = tasks
      .filter((t) => t.arrivalTime > currentTime && t.remainingTime > 0)
      .reduce((min, t) => Math.min(min, t.arrivalTime), Infinity)

    const execTime = Math.min(
      task.remainingTime,
      nextArrival === Infinity ? task.remainingTime : nextArrival - currentTime,
    )

    const last = timeline[timeline.length - 1]
    if (
      last &&
      last.pid === task.pid &&
      last.tid === task.tid &&
      last.end === currentTime
    ) {
      last.end += execTime
    } else {
      timeline.push({
        pid: task.pid,
        tid: task.tid,
        start: currentTime,
        end: currentTime + execTime,
      })
    }

    currentTime += execTime
    task.remainingTime -= execTime

    if (task.remainingTime === 0) {
      completed.add(taskKey(task))
    }
  }

  return computeMetrics(procs, timeline)
}
