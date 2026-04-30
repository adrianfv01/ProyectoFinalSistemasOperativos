import { create } from 'zustand'
import { Process, Thread, ProcessState } from '../engine/processes/types'
import { createThread, forkProcess, resetTidCounter, setNextTid } from '../engine/processes/threadManager'

interface ProcessStore {
  processes: Process[]
  nextPid: number
  addProcess: (data: { arrivalTime: number; burstTime: number; priority: number; numPages: number }) => void
  removeProcess: (pid: number) => void
  updateProcess: (pid: number, data: Partial<Pick<Process, 'arrivalTime' | 'burstTime' | 'priority' | 'numPages'>>) => void
  addThread: (pid: number, burstTime: number) => void
  removeThread: (pid: number, tid: number) => void
  forkProcess: (parentPid: number) => void
  setProcesses: (processes: Process[]) => void
  clearAll: () => void
}

export const useProcessStore = create<ProcessStore>((set, get) => ({
  processes: [],
  nextPid: 1,

  addProcess: (data) => {
    set((state) => {
      const proc: Process = {
        pid: state.nextPid,
        arrivalTime: data.arrivalTime,
        burstTime: data.burstTime,
        remainingTime: data.burstTime,
        priority: data.priority,
        numPages: data.numPages,
        state: ProcessState.New,
        threads: [],
      }
      return { processes: [...state.processes, proc], nextPid: state.nextPid + 1 }
    })
  },

  removeProcess: (pid) => {
    set((state) => ({
      processes: state.processes.filter((p) => p.pid !== pid),
    }))
  },

  updateProcess: (pid, data) => {
    set((state) => ({
      processes: state.processes.map((p) => {
        if (p.pid !== pid) return p
        const updated = { ...p, ...data }
        if (data.burstTime !== undefined) {
          updated.remainingTime = data.burstTime
        }
        return updated
      }),
    }))
  },

  addThread: (pid, burstTime) => {
    set((state) => ({
      processes: state.processes.map((p) => {
        if (p.pid !== pid) return p
        const thread = createThread(p, burstTime)
        return { ...p, threads: [...p.threads, thread] }
      }),
    }))
  },

  removeThread: (pid, tid) => {
    set((state) => ({
      processes: state.processes.map((p) => {
        if (p.pid !== pid) return p
        return { ...p, threads: p.threads.filter((t: Thread) => t.tid !== tid) }
      }),
    }))
  },

  forkProcess: (parentPid) => {
    const state = get()
    const parent = state.processes.find((p) => p.pid === parentPid)
    if (!parent) return
    const child = forkProcess(parent, state.nextPid)
    set({
      processes: [...state.processes, child],
      nextPid: state.nextPid + 1,
    })
  },

  setProcesses: (processes) => {
    const maxPid = processes.reduce((max, p) => Math.max(max, p.pid), 0)
    const maxTid = processes.reduce(
      (max, p) => p.threads.reduce((m, t) => Math.max(m, t.tid), max),
      0,
    )
    if (maxTid > 0) {
      setNextTid(maxTid + 1)
    } else {
      resetTidCounter()
    }
    set({ processes, nextPid: maxPid + 1 })
  },

  clearAll: () => {
    resetTidCounter()
    set({ processes: [], nextPid: 1 })
  },
}))
