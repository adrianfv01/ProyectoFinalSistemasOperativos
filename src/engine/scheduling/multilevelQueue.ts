import type { Process } from '../processes/types'
import type { SchedulerConfig, SchedulingResult, TimeSlice } from './types'
import type { SchedulableTask } from './metrics'
import {
  computeMetrics,
  deepCopyProcesses,
  flattenTasks,
  taskKey,
} from './metrics'

function queueForPriority(priority: number): number {
  if (priority === 1) return 0
  if (priority === 2) return 1
  return 2
}

export function multilevelQueue(
  processes: Process[],
  config: SchedulerConfig,
): SchedulingResult {
  const quantum = config.quantum ?? 2
  const procs = deepCopyProcesses(processes)
  const tasks = flattenTasks(procs)

  tasks.sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid - b.pid)

  const timeline: TimeSlice[] = []
  let currentTime = 0
  const queues: SchedulableTask[][] = [[], [], []]
  let taskIdx = 0

  const addArrivals = (time: number) => {
    while (taskIdx < tasks.length && tasks[taskIdx].arrivalTime <= time) {
      const t = tasks[taskIdx++]
      queues[queueForPriority(t.priority)].push(t)
    }
  }

  addArrivals(currentTime)

  const allEmpty = () => queues.every((q) => q.length === 0)

  while (!allEmpty() || taskIdx < tasks.length) {
    if (allEmpty()) {
      currentTime = tasks[taskIdx].arrivalTime
      addArrivals(currentTime)
    }

    const qIdx = queues.findIndex((q) => q.length > 0)
    if (qIdx === -1) continue

    const task = queues[qIdx].shift()!

    let nextHigherArrival = Infinity
    for (let i = taskIdx; i < tasks.length; i++) {
      if (
        tasks[i].arrivalTime > currentTime &&
        queueForPriority(tasks[i].priority) < qIdx
      ) {
        nextHigherArrival = tasks[i].arrivalTime
        break
      }
    }

    let maxExec: number
    if (qIdx <= 1) {
      maxExec = Math.min(quantum, task.remainingTime)
    } else {
      maxExec = task.remainingTime
    }

    if (nextHigherArrival !== Infinity) {
      maxExec = Math.min(maxExec, nextHigherArrival - currentTime)
    }

    const last = timeline[timeline.length - 1]
    if (
      last &&
      last.pid === task.pid &&
      last.tid === task.tid &&
      last.end === currentTime
    ) {
      last.end += maxExec
    } else {
      timeline.push({
        pid: task.pid,
        tid: task.tid,
        start: currentTime,
        end: currentTime + maxExec,
      })
    }

    currentTime += maxExec
    task.remainingTime -= maxExec
    addArrivals(currentTime)

    if (task.remainingTime > 0) {
      if (qIdx === 2) {
        queues[qIdx].unshift(task)
      } else {
        queues[qIdx].push(task)
      }
    }
  }

  return computeMetrics(procs, timeline)
}
