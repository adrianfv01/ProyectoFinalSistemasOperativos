import type { Process } from '../processes/types'
import type { SchedulerConfig, SchedulingResult, TimeSlice } from './types'
import type { SchedulableTask } from './metrics'
import { computeMetrics, deepCopyProcesses, flattenTasks } from './metrics'
import { mergeContiguous } from './multiCore'

function queueForPriority(priority: number): number {
  if (priority === 1) return 0
  if (priority === 2) return 1
  return 2
}

interface Slot {
  task: SchedulableTask | null
  queueIdx: number
  quantumUsed: number
}

export function multilevelQueue(
  processes: Process[],
  config: SchedulerConfig,
): SchedulingResult {
  const quantum = Math.max(1, config.quantum ?? 2)
  const numCores = Math.max(1, config.numCores ?? 1)
  const procs = deepCopyProcesses(processes)
  const tasks = flattenTasks(procs)

  tasks.sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid - b.pid)

  const queues: SchedulableTask[][] = [[], [], []]
  const added = new Set<SchedulableTask>()
  const slots: Slot[] = Array.from({ length: numCores }, () => ({
    task: null,
    queueIdx: 0,
    quantumUsed: 0,
  }))
  const perCore: TimeSlice[][] = Array.from({ length: numCores }, () => [])

  let currentTime = 0

  const enqueueArrivals = (time: number) => {
    for (const t of tasks) {
      if (!added.has(t) && t.arrivalTime <= time && t.remainingTime > 0) {
        queues[queueForPriority(t.priority)].push(t)
        added.add(t)
      }
    }
  }

  const allDone = () => tasks.every((t) => t.remainingTime === 0)
  const queuesEmpty = () => queues.every((q) => q.length === 0)
  const slotsEmpty = () => slots.every((s) => s.task === null)
  const highestNonEmptyQueue = () => queues.findIndex((q) => q.length > 0)

  let safety = 0
  const MAX = 1_000_000

  while (!allDone() && safety++ < MAX) {
    enqueueArrivals(currentTime)

    if (queuesEmpty() && slotsEmpty()) {
      const next = tasks
        .filter((t) => t.remainingTime > 0 && t.arrivalTime > currentTime)
        .reduce((m, t) => Math.min(m, t.arrivalTime), Infinity)
      if (next === Infinity) break
      currentTime = next
      continue
    }

    // Preempt: si un slot tiene tarea de cola baja y llega una de cola más alta,
    // libera el slot para que la nueva tome su lugar este mismo tick.
    for (const slot of slots) {
      if (!slot.task) continue
      const better = highestNonEmptyQueue()
      if (better !== -1 && better < slot.queueIdx) {
        queues[slot.queueIdx].unshift(slot.task)
        slot.task = null
        slot.quantumUsed = 0
      }
    }

    // Asigna a slots libres tomando de la cola más prioritaria disponible.
    for (const slot of slots) {
      if (slot.task !== null) continue
      const qIdx = highestNonEmptyQueue()
      if (qIdx === -1) break
      slot.task = queues[qIdx].shift()!
      slot.queueIdx = qIdx
      slot.quantumUsed = 0
    }

    let anyRan = false
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]
      if (!slot.task) continue
      anyRan = true
      const last = perCore[i][perCore[i].length - 1]
      if (
        last &&
        last.pid === slot.task.pid &&
        last.tid === slot.task.tid &&
        last.end === currentTime
      ) {
        last.end = currentTime + 1
      } else {
        perCore[i].push({
          pid: slot.task.pid,
          tid: slot.task.tid,
          start: currentTime,
          end: currentTime + 1,
          core: i,
        })
      }
      slot.task.remainingTime -= 1
      slot.quantumUsed += 1
    }

    currentTime += 1
    enqueueArrivals(currentTime)

    for (const slot of slots) {
      if (!slot.task) continue
      if (slot.task.remainingTime === 0) {
        slot.task = null
        slot.quantumUsed = 0
      } else if (slot.queueIdx <= 1 && slot.quantumUsed === quantum) {
        queues[slot.queueIdx].push(slot.task)
        slot.task = null
        slot.quantumUsed = 0
      }
    }

    if (!anyRan) {
      const next = tasks
        .filter((t) => t.remainingTime > 0 && t.arrivalTime > currentTime - 1)
        .reduce((m, t) => Math.min(m, t.arrivalTime), Infinity)
      if (next === Infinity) break
      currentTime = next
    }
  }

  const merged = perCore.map((row) => mergeContiguous(row))
  const flat = merged
    .flat()
    .slice()
    .sort((a, b) => a.start - b.start || (a.core ?? 0) - (b.core ?? 0))

  return computeMetrics(procs, flat, { timelinePerCore: merged, numCores })
}
