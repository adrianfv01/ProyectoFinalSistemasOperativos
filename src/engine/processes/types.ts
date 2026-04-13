export enum ProcessState {
  New = 'new',
  Ready = 'ready',
  Running = 'running',
  Waiting = 'waiting',
  Terminated = 'terminated',
}

export interface Thread {
  tid: number
  pid: number
  burstTime: number
  remainingTime: number
  state: ProcessState
  sharedPages: number[]
}

export interface Process {
  pid: number
  arrivalTime: number
  burstTime: number
  remainingTime: number
  priority: number
  numPages: number
  state: ProcessState
  threads: Thread[]
  parentPid?: number
  queueLevel?: number
}
