import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MiniProcess {
  pid: number
  arrivalTime: number
  burstTime: number
}

export type SchedulingChoice = 'fcfs' | 'sjf' | 'roundRobin'
export type ReplacementChoice = 'fifo' | 'lru' | 'optimal'

interface TutorialState {
  currentChapterId: string
  currentStepIndex: number
  completedChapters: string[]

  miniProcesses: MiniProcess[]

  schedulingChoice: SchedulingChoice | null
  schedulingQuantum: number

  totalMemory: number
  pageSize: number
  pagesPerProcess: Record<number, number>

  replacementChoice: ReplacementChoice | null
  numFramesGuide: number

  setChapter: (id: string) => void
  setStep: (index: number) => void
  markChapterCompleted: (id: string) => void

  addMiniProcess: (p: Omit<MiniProcess, 'pid'>) => void
  removeMiniProcess: (pid: number) => void
  resetMiniProcesses: () => void
  seedDefaultProcesses: () => void

  setSchedulingChoice: (c: SchedulingChoice) => void
  setSchedulingQuantum: (q: number) => void

  setTotalMemory: (m: number) => void
  setPageSize: (s: number) => void
  setPagesForProcess: (pid: number, pages: number) => void

  setReplacementChoice: (c: ReplacementChoice) => void
  setNumFramesGuide: (n: number) => void

  resetAll: () => void
}

const INITIAL_STATE: Omit<
  TutorialState,
  | 'setChapter'
  | 'setStep'
  | 'markChapterCompleted'
  | 'addMiniProcess'
  | 'removeMiniProcess'
  | 'resetMiniProcesses'
  | 'seedDefaultProcesses'
  | 'setSchedulingChoice'
  | 'setSchedulingQuantum'
  | 'setTotalMemory'
  | 'setPageSize'
  | 'setPagesForProcess'
  | 'setReplacementChoice'
  | 'setNumFramesGuide'
  | 'resetAll'
> = {
  currentChapterId: 'welcome',
  currentStepIndex: 0,
  completedChapters: [],
  miniProcesses: [],
  schedulingChoice: null,
  schedulingQuantum: 2,
  totalMemory: 32,
  pageSize: 4,
  pagesPerProcess: {},
  replacementChoice: null,
  numFramesGuide: 3,
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setChapter: (id) => set({ currentChapterId: id, currentStepIndex: 0 }),
      setStep: (index) => set({ currentStepIndex: Math.max(0, index) }),

      markChapterCompleted: (id) =>
        set((s) => {
          if (s.completedChapters.includes(id)) return s
          return { completedChapters: [...s.completedChapters, id] }
        }),

      addMiniProcess: (p) =>
        set((s) => {
          if (s.miniProcesses.length >= 5) return s
          const nextPid =
            s.miniProcesses.length === 0
              ? 1
              : Math.max(...s.miniProcesses.map((mp) => mp.pid)) + 1
          return {
            miniProcesses: [...s.miniProcesses, { pid: nextPid, ...p }],
          }
        }),

      removeMiniProcess: (pid) =>
        set((s) => ({
          miniProcesses: s.miniProcesses.filter((mp) => mp.pid !== pid),
        })),

      resetMiniProcesses: () => set({ miniProcesses: [] }),

      seedDefaultProcesses: () => {
        if (get().miniProcesses.length > 0) return
        set({
          miniProcesses: [
            { pid: 1, arrivalTime: 0, burstTime: 4 },
            { pid: 2, arrivalTime: 1, burstTime: 3 },
            { pid: 3, arrivalTime: 2, burstTime: 5 },
          ],
        })
      },

      setSchedulingChoice: (c) => set({ schedulingChoice: c }),
      setSchedulingQuantum: (q) =>
        set({ schedulingQuantum: Math.max(1, Math.min(8, q)) }),

      setTotalMemory: (m) => set({ totalMemory: Math.max(8, Math.min(128, m)) }),
      setPageSize: (s) => set({ pageSize: Math.max(1, Math.min(16, s)) }),

      setPagesForProcess: (pid, pages) =>
        set((s) => ({
          pagesPerProcess: {
            ...s.pagesPerProcess,
            [pid]: Math.max(1, Math.min(8, pages)),
          },
        })),

      setReplacementChoice: (c) => set({ replacementChoice: c }),
      setNumFramesGuide: (n) =>
        set({ numFramesGuide: Math.max(2, Math.min(6, n)) }),

      resetAll: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: 'simulador-so-tutorial',
      version: 1,
    },
  ),
)

export function getPagesForProcess(
  pagesPerProcess: Record<number, number>,
  pid: number,
): number {
  return pagesPerProcess[pid] ?? 2
}
