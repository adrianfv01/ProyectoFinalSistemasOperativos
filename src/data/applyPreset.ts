import { useProcessStore } from '../store/processStore'
import { useSchedulingStore } from '../store/schedulingStore'
import { useMemoryStore } from '../store/memoryStore'
import { getScheduler } from '../engine/scheduling'
import { generateReferenceString, getReplacementAlgorithm } from '../engine/memory'
import type { Preset } from './presets'

export function applyPreset(preset: Preset) {
  useProcessStore.getState().setProcesses(preset.processes)

  if (preset.memory) {
    useMemoryStore.setState({
      totalMemory: preset.memory.totalMemory,
      pageSize: preset.memory.pageSize,
      frames: preset.memory.frames,
    })
  }

  const schedulingStore = useSchedulingStore.getState()

  if (preset.scheduling) {
    const { algorithm, config: overrides, autoRun = true } = preset.scheduling
    const fullConfig = { ...schedulingStore.config, ...overrides }
    useSchedulingStore.setState({
      selectedAlgorithm: algorithm,
      config: fullConfig,
      result: null,
      currentStep: 0,
      isPlaying: false,
    })

    if (autoRun) {
      try {
        const scheduler = getScheduler(algorithm)
        const result = scheduler(preset.processes, fullConfig)
        useSchedulingStore.setState({ result, currentStep: 0 })
      } catch {
        // Si falla la ejecución automática, dejamos al usuario presionar Ejecutar.
      }
    }
  } else {
    useSchedulingStore.setState({ result: null, currentStep: 0, isPlaying: false })
  }

  if (preset.replacement) {
    const { algorithm, autoRun = true, customReferenceString } = preset.replacement
    const frames = preset.memory?.frames ?? useMemoryStore.getState().frames

    useMemoryStore.setState({
      selectedAlgorithm: algorithm,
      replacementSteps: [],
      currentStep: 0,
      isPlaying: false,
    })

    if (autoRun) {
      try {
        const refs =
          customReferenceString ?? generateReferenceString(preset.processes)
        if (refs.length > 0) {
          const fn = getReplacementAlgorithm(algorithm)
          const steps = fn(refs, frames)
          useMemoryStore.setState({
            replacementSteps: steps,
            currentStep: 0,
          })
        }
      } catch {
        // Silenciamos errores en la ejecución automática.
      }
    }
  } else {
    useMemoryStore.setState({
      replacementSteps: [],
      currentStep: 0,
      isPlaying: false,
    })
  }
}
