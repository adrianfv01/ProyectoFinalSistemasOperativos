import type { Process } from '../processes/types'
import type { SchedulerConfig, SchedulingResult } from './types'
import { computeMetrics, deepCopyProcesses, flattenTasks } from './metrics'
import { runPreemptiveSimulation } from './multiCore'

export function priorityPreemptive(
  processes: Process[],
  config: SchedulerConfig,
): SchedulingResult {
  const procs = deepCopyProcesses(processes)
  const tasks = flattenTasks(procs)
  const numCores = Math.max(1, config.numCores ?? 1)

  const sim = runPreemptiveSimulation(tasks, numCores, {
    pickN: (ready, n) => {
      const sorted = ready
        .slice()
        .sort(
          (a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime,
        )
      return sorted.slice(0, n)
    },
  })

  return computeMetrics(procs, sim.timeline, {
    timelinePerCore: sim.timelinePerCore,
    numCores: sim.numCores,
  })
}
