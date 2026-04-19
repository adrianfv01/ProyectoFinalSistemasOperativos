import { ProcessState, type Process } from '../engine/processes/types'
import type { MiniProcess } from '../store/tutorialStore'

export function miniToProcess(
  mini: MiniProcess,
  numPages = 2,
  priority = 0,
): Process {
  return {
    pid: mini.pid,
    arrivalTime: mini.arrivalTime,
    burstTime: mini.burstTime,
    remainingTime: mini.burstTime,
    priority,
    numPages,
    state: ProcessState.New,
    threads: [],
  }
}

export function miniToProcesses(
  minis: MiniProcess[],
  pagesPerProcess: Record<number, number>,
): Process[] {
  return minis.map((m) => miniToProcess(m, pagesPerProcess[m.pid] ?? 2))
}
