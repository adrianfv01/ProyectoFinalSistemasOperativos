import { useState } from 'react'
import { BarChart3, AlertCircle, Info } from 'lucide-react'
import { useProcessStore } from '../store/processStore'
import { useMemoryStore } from '../store/memoryStore'
import { ALGORITHM_LABELS, type AlgorithmName } from '../store/schedulingStore'
import { REPLACEMENT_LABELS, type ReplacementAlgorithmName } from '../store/memoryStore'
import { getScheduler } from '../engine/scheduling/index'
import { getReplacementAlgorithm, generateReferenceString } from '../engine/memory/index'
import AlgorithmPicker from '../components/comparison/AlgorithmPicker'
import ComparisonChart, {
  type SchedulingComparisonEntry,
  type ReplacementComparisonEntry,
} from '../components/comparison/ComparisonChart'

export default function ComparisonPage() {
  const processes = useProcessStore((s) => s.processes)
  const frames = useMemoryStore((s) => s.frames)

  const [schedulingResults, setSchedulingResults] = useState<SchedulingComparisonEntry[]>([])
  const [replacementResults, setReplacementResults] = useState<ReplacementComparisonEntry[]>([])
  const [hasRun, setHasRun] = useState(false)

  const handleCompare = (
    selectedScheduling: AlgorithmName[],
    selectedReplacement: ReplacementAlgorithmName[],
    quantum: number,
  ) => {
    const schedResults: SchedulingComparisonEntry[] = selectedScheduling.map((algo) => {
      const scheduler = getScheduler(algo)
      const result = scheduler(
        processes.map((p) => ({ ...p })),
        { quantum, quantumPerLevel: [quantum, quantum * 2, quantum * 4] },
      )
      return {
        algorithm: algo,
        label: ALGORITHM_LABELS[algo],
        avgTurnaroundTime: parseFloat(result.averages.avgTurnaroundTime.toFixed(2)),
        avgWaitingTime: parseFloat(result.averages.avgWaitingTime.toFixed(2)),
        cpuUtilization: parseFloat(result.cpuUtilization.toFixed(1)),
      }
    })

    const refString = generateReferenceString(processes)
    const replResults: ReplacementComparisonEntry[] = selectedReplacement.map((algo) => {
      const replacer = getReplacementAlgorithm(algo)
      const steps = replacer(refString, frames)
      const pageFaults = steps.filter((s) => s.isPageFault).length
      return {
        algorithm: algo,
        label: REPLACEMENT_LABELS[algo],
        pageFaults,
      }
    })

    setSchedulingResults(schedResults)
    setReplacementResults(replResults)
    setHasRun(true)
  }

  if (processes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32 text-gray-400">
        <AlertCircle size={40} className="text-yellow-500/70" />
        <p className="text-lg font-medium">Sin procesos</p>
        <p className="text-sm">Primero agrega procesos en la pantalla de Captura.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 size={24} className="shrink-0 text-indigo-400" />
        <h1 className="text-xl font-bold text-gray-100 sm:text-2xl">Comparación de algoritmos</h1>
      </div>

      <AlgorithmPicker onCompare={handleCompare} />

      {!hasRun && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/40 px-4 py-6 text-gray-400">
          <Info size={18} />
          <span className="text-sm">Selecciona algoritmos y presiona Comparar.</span>
        </div>
      )}

      {hasRun && (
        <ComparisonChart
          schedulingResults={schedulingResults}
          replacementResults={replacementResults}
        />
      )}
    </div>
  )
}
