import type { Process } from '../processes/types'
import type { SchedulerConfig, SchedulingResult, TimeSlice } from './types'
import type { SchedulableTask } from './metrics'
import {
  computeMetrics,
  deepCopyProcesses,
  flattenTasks,
  taskKey,
} from './metrics'

export function multilevelFeedback(
  processes: Process[],
  config: SchedulerConfig,
): SchedulingResult {
  const quantumPerLevel = config.quantumPerLevel ?? [2, 4, 8]
  const procs = deepCopyProcesses(processes)
  const tasks = flattenTasks(procs)

  tasks.sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid - b.pid)

  const timeline: TimeSlice[] = []
  let currentTime = 0
  const queues: SchedulableTask[][] = [[], [], []]
  let taskIdx = 0

  const addArrivals = (time: number) => {
    while (taskIdx < tasks.length && tasks[taskIdx].arrivalTime <= time) {
      tasks[taskIdx].queueLevel = 0
      queues[0].push(tasks[taskIdx++])
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
    const levelQuantum =
      quantumPerLevel[qIdx] ?? quantumPerLevel[quantumPerLevel.length - 1]

    let nextPreemptArrival = Infinity
    if (qIdx > 0) {
      // New arrivals enter queue 0, which preempts lower queues
      if (taskIdx < tasks.length && tasks[taskIdx].arrivalTime > currentTime) {
        nextPreemptArrival = tasks[taskIdx].arrivalTime
      }
    }

    let maxExec = Math.min(levelQuantum, task.remainingTime)
    if (nextPreemptArrival !== Infinity) {
      maxExec = Math.min(maxExec, nextPreemptArrival - currentTime)
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
      const wasPreempted = maxExec < levelQuantum
      if (wasPreempted) {
        queues[qIdx].push(task)
      } else {
        const nextLevel = Math.min(qIdx + 1, 2)
        task.queueLevel = nextLevel
        queues[nextLevel].push(task)
      }
    }
  }

  return computeMetrics(procs, timeline)
}
