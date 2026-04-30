import type { Process } from '../processes/types'
import type {
  TimeSlice,
  ProcessMetrics,
  AverageMetrics,
  SchedulingResult,
} from './types'

export interface SchedulableTask {
  pid: number
  tid?: number
  arrivalTime: number
  burstTime: number
  remainingTime: number
  priority: number
  queueLevel: number
}

export function taskKey(item: { pid: number; tid?: number }): string {
  return item.tid !== undefined ? `${item.pid}-${item.tid}` : `${item.pid}`
}

export function deepCopyProcesses(processes: Process[]): Process[] {
  return processes.map((p) => ({
    ...p,
    threads: p.threads.map((t) => ({ ...t, sharedPages: [...t.sharedPages] })),
  }))
}

export function flattenTasks(processes: Process[]): SchedulableTask[] {
  const tasks: SchedulableTask[] = []
  for (const p of processes) {
    if (p.threads.length > 0) {
      for (const t of p.threads) {
        tasks.push({
          pid: p.pid,
          tid: t.tid,
          arrivalTime: p.arrivalTime,
          burstTime: t.burstTime,
          remainingTime: t.remainingTime,
          priority: p.priority,
          queueLevel: 0,
        })
      }
    } else {
      tasks.push({
        pid: p.pid,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        remainingTime: p.remainingTime,
        priority: p.priority,
        queueLevel: 0,
      })
    }
  }
  return tasks
}

interface TaskInfo {
  pid: number
  tid?: number
  arrivalTime: number
  burstTime: number
}

function buildTaskMap(processes: Process[]): Map<string, TaskInfo> {
  const map = new Map<string, TaskInfo>()
  for (const p of processes) {
    if (p.threads.length > 0) {
      for (const t of p.threads) {
        map.set(`${p.pid}-${t.tid}`, {
          pid: p.pid,
          tid: t.tid,
          arrivalTime: p.arrivalTime,
          burstTime: t.burstTime,
        })
      }
    } else {
      map.set(`${p.pid}`, {
        pid: p.pid,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
      })
    }
  }
  return map
}

export interface ComputeMetricsOptions {
  timelinePerCore?: TimeSlice[][]
  numCores?: number
}

export function computeMetrics(
  processes: Process[],
  timeline: TimeSlice[],
  options: ComputeMetricsOptions = {},
): SchedulingResult {
  const numCores = Math.max(1, options.numCores ?? 1)
  const timelinePerCore =
    options.timelinePerCore ??
    (numCores === 1 ? [timeline] : Array.from({ length: numCores }, () => []))

  const taskMap = buildTaskMap(processes)

  const completionTimes = new Map<string, number>()
  const firstStart = new Map<string, number>()

  for (const slice of timeline) {
    const key = taskKey(slice)
    if (!firstStart.has(key)) {
      firstStart.set(key, slice.start)
    }
    const prev = completionTimes.get(key) ?? 0
    if (slice.end > prev) {
      completionTimes.set(key, slice.end)
    }
  }

  const metrics: ProcessMetrics[] = []
  for (const [key, info] of taskMap) {
    const ct = completionTimes.get(key) ?? 0
    const rt = (firstStart.get(key) ?? info.arrivalTime) - info.arrivalTime
    const tat = ct - info.arrivalTime
    const wt = tat - info.burstTime

    metrics.push({
      pid: info.pid,
      tid: info.tid,
      completionTime: ct,
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
    })
  }

  const n = metrics.length || 1
  const averages: AverageMetrics = {
    avgTurnaroundTime: metrics.reduce((s, m) => s + m.turnaroundTime, 0) / n,
    avgWaitingTime: metrics.reduce((s, m) => s + m.waitingTime, 0) / n,
    avgResponseTime: metrics.reduce((s, m) => s + m.responseTime, 0) / n,
  }

  const totalBusy = timeline.reduce((s, sl) => s + (sl.end - sl.start), 0)
  const makespan =
    timeline.length > 0
      ? Math.max(...timeline.map((s) => s.end)) -
        Math.min(...timeline.map((s) => s.start))
      : 0
  const cpuUtilization =
    makespan > 0 ? (totalBusy / (makespan * numCores)) * 100 : 0

  let contextSwitches = 0
  for (const row of timelinePerCore) {
    for (let i = 1; i < row.length; i++) {
      if (taskKey(row[i]) !== taskKey(row[i - 1])) {
        contextSwitches++
      }
    }
  }

  return {
    timeline,
    timelinePerCore,
    numCores,
    metrics,
    averages,
    cpuUtilization,
    contextSwitches,
  }
}
