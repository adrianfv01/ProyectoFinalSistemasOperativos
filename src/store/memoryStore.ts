import { create } from 'zustand'
import { ReplacementStep } from '../engine/memory/types'

export type ReplacementAlgorithmName = 'fifo' | 'lru' | 'optimal' | 'clock' | 'secondChance'

export const REPLACEMENT_LABELS: Record<ReplacementAlgorithmName, string> = {
  fifo: 'FIFO',
  lru: 'LRU',
  optimal: 'Óptimo',
  clock: 'Reloj (Clock)',
  secondChance: 'Segunda Oportunidad',
}

interface MemoryStore {
  totalMemory: number
  pageSize: number
  frames: number
  selectedAlgorithm: ReplacementAlgorithmName
  referenceString: number[]
  replacementSteps: ReplacementStep[]
  currentStep: number
  isPlaying: boolean
  speed: number

  setMemoryConfig: (config: { totalMemory?: number; pageSize?: number }) => void
  setFrames: (frames: number) => void
  setSelectedAlgorithm: (algo: ReplacementAlgorithmName) => void
  setReferenceString: (refs: number[]) => void
  setReplacementSteps: (steps: ReplacementStep[]) => void
  setCurrentStep: (step: number) => void
  setIsPlaying: (playing: boolean) => void
  setSpeed: (speed: number) => void
  reset: () => void
}

export const useMemoryStore = create<MemoryStore>((set) => ({
  totalMemory: 64,
  pageSize: 4,
  frames: 16,
  selectedAlgorithm: 'fifo',
  referenceString: [],
  replacementSteps: [],
  currentStep: 0,
  isPlaying: false,
  speed: 1,

  setMemoryConfig: (config) =>
    set((s) => {
      const tm = config.totalMemory ?? s.totalMemory
      const ps = config.pageSize ?? s.pageSize
      return { totalMemory: tm, pageSize: ps, frames: Math.floor(tm / ps) }
    }),
  setFrames: (frames) => set({ frames }),
  setSelectedAlgorithm: (algo) => set({ selectedAlgorithm: algo, replacementSteps: [], currentStep: 0 }),
  setReferenceString: (refs) => set({ referenceString: refs }),
  setReplacementSteps: (steps) => set({ replacementSteps: steps, currentStep: 0 }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (speed) => set({ speed }),
  reset: () => set({ replacementSteps: [], currentStep: 0, isPlaying: false, referenceString: [] }),
}))
