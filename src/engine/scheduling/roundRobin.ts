import type { Process } from '../processes/types'
import type { SchedulerConfig, SchedulingResult, TimeSlice } from './types'
import type { SchedulableTask } from './metrics'
import { computeMetrics, deepCopyProcesses, flattenTasks } from './metrics'

export function roundRobin(
  processes: Process[],
  config: SchedulerConfig,
): SchedulingResult {
  const quantum = config.quantum ?? 2
  const procs = deepCopyProcesses(processes)
  const tasks = flattenTasks(procs)

  tasks.sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid - b.pid)

  const timeline: TimeSlice[] = []
  let currentTime = 0
  const queue: SchedulableTask[] = []
  let taskIdx = 0

  while (taskIdx < tasks.length && tasks[taskIdx].arrivalTime <= currentTime) {
    queue.push(tasks[taskIdx++])
  }

  while (queue.length > 0 || taskIdx < tasks.length) {
    if (queue.length === 0) {
      currentTime = tasks[taskIdx].arrivalTime
      while (
        taskIdx < tasks.length &&
        tasks[taskIdx].arrivalTime <= currentTime
      ) {
        queue.push(tasks[taskIdx++])
      }
    }

    const task = queue.shift()!
    const execTime = Math.min(quantum, task.remainingTime)

    timeline.push({
      pid: task.pid,
      tid: task.tid,
      start: currentTime,
      end: currentTime + execTime,
    })

    currentTime += execTime
    task.remainingTime -= execTime

    while (
      taskIdx < tasks.length &&
      tasks[taskIdx].arrivalTime <= currentTime
    ) {
      queue.push(tasks[taskIdx++])
    }

    if (task.remainingTime > 0) {
      queue.push(task)
    }
  }

  return computeMetrics(procs, timeline)
}
