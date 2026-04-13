import type { Process } from '../processes/types'
import type { SchedulerConfig, SchedulingResult, TimeSlice } from './types'
import { computeMetrics, deepCopyProcesses, flattenTasks } from './metrics'

export function fcfs(
  processes: Process[],
  _config: SchedulerConfig,
): SchedulingResult {
  const procs = deepCopyProcesses(processes)
  const tasks = flattenTasks(procs)

  tasks.sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid - b.pid)

  const timeline: TimeSlice[] = []
  let currentTime = 0

  for (const task of tasks) {
    if (currentTime < task.arrivalTime) {
      currentTime = task.arrivalTime
    }
    timeline.push({
      pid: task.pid,
      tid: task.tid,
      start: currentTime,
      end: currentTime + task.burstTime,
    })
    currentTime += task.burstTime
  }

  return computeMetrics(procs, timeline)
}
