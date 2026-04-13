import { create } from 'zustand'
import { SchedulingResult, SchedulerConfig } from '../engine/scheduling/types'

export type AlgorithmName =
  | 'fcfs'
  | 'sjf'
  | 'hrrn'
  | 'roundRobin'
  | 'srtf'
  | 'priorityPreemptive'
  | 'multilevelQueue'
  | 'multilevelFeedback'

export const ALGORITHM_LABELS: Record<AlgorithmName, string> = {
  fcfs: 'FCFS',
  sjf: 'SJF',
  hrrn: 'HRRN',
  roundRobin: 'Round Robin',
  srtf: 'SRTF',
  priorityPreemptive: 'Prioridad (Expropiativo)',
  multilevelQueue: 'Cola Multinivel',
  multilevelFeedback: 'Cola Multinivel con Retroalimentación',
}

interface SchedulingStore {
  selectedAlgorithm: AlgorithmName
  config: SchedulerConfig
  result: SchedulingResult | null
  currentStep: number
  isPlaying: boolean
  speed: number
  setAlgorithm: (algo: AlgorithmName) => void
  setConfig: (config: Partial<SchedulerConfig>) => void
  setResult: (result: SchedulingResult | null) => void
  setCurrentStep: (step: number) => void
  setIsPlaying: (playing: boolean) => void
  setSpeed: (speed: number) => void
  reset: () => void
}

export const useSchedulingStore = create<SchedulingStore>((set) => ({
  selectedAlgorithm: 'fcfs',
  config: { quantum: 2, quantumPerLevel: [2, 4, 8] },
  result: null,
  currentStep: 0,
  isPlaying: false,
  speed: 1,

  setAlgorithm: (algo) => set({ selectedAlgorithm: algo, result: null, currentStep: 0 }),
  setConfig: (config) => set((s) => ({ config: { ...s.config, ...config } })),
  setResult: (result) => set({ result, currentStep: 0 }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (speed) => set({ speed }),
  reset: () => set({ result: null, currentStep: 0, isPlaying: false }),
}))
