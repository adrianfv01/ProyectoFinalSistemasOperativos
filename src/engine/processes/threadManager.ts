import { Process, Thread, ProcessState } from './types'

let nextTid = 1

export function resetTidCounter() {
  nextTid = 1
}

export function setNextTid(value: number) {
  nextTid = Math.max(1, value)
}

export function createThread(process: Process, burstTime: number): Thread {
  const tid = nextTid++
  const sharedPages = Array.from({ length: process.numPages }, (_, i) => i)
  return {
    tid,
    pid: process.pid,
    burstTime,
    remainingTime: burstTime,
    state: ProcessState.New,
    sharedPages,
  }
}

export function forkProcess(parent: Process, newPid: number): Process {
  return {
    pid: newPid,
    arrivalTime: parent.arrivalTime,
    burstTime: parent.burstTime,
    remainingTime: parent.remainingTime,
    priority: parent.priority,
    numPages: parent.numPages,
    state: ProcessState.New,
    threads: [],
    parentPid: parent.pid,
  }
}

export function getSchedulableUnits(process: Process): Array<{ pid: number; tid?: number; burstTime: number; remainingTime: number; arrivalTime: number; priority: number }> {
  if (process.threads.length === 0) {
    return [{
      pid: process.pid,
      burstTime: process.burstTime,
      remainingTime: process.remainingTime,
      arrivalTime: process.arrivalTime,
      priority: process.priority,
    }]
  }

  return process.threads.map(t => ({
    pid: process.pid,
    tid: t.tid,
    burstTime: t.burstTime,
    remainingTime: t.remainingTime,
    arrivalTime: process.arrivalTime,
    priority: process.priority,
  }))
}
