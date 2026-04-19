import { useState } from 'react'
import { BarChart3, AlertCircle, Info, Play } from 'lucide-react'
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
import StickyActionBar from '../components/ui/StickyActionBar'

export default function ComparisonPage() {
  const processes = useProcessStore((s) => s.processes)
  const frames = useMemoryStore((s) => s.frames)

  const [selectedScheduling, setSelectedScheduling] = useState<Set<AlgorithmName>>(new Set())
  const [selectedReplacement, setSelectedReplacement] = useState<Set<ReplacementAlgorithmName>>(new Set())
  const [quantum, setQuantum] = useState(2)
  const [schedulingResults, setSchedulingResults] = useState<SchedulingComparisonEntry[]>([])
  const [replacementResults, setReplacementResults] = useState<ReplacementComparisonEntry[]>([])
  const [hasRun, setHasRun] = useState(false)

  const toggleScheduling = (key: AlgorithmName) => {
    setSelectedScheduling((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleReplacement = (key: ReplacementAlgorithmName) => {
    setSelectedReplacement((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const hasSelection = selectedScheduling.size > 0 || selectedReplacement.size > 0
  const totalSelected = selectedScheduling.size + selectedReplacement.size

  const handleCompare = () => {
    const schedResults: SchedulingComparisonEntry[] = Array.from(selectedScheduling).map((algo) => {
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
    const replResults: ReplacementComparisonEntry[] = Array.from(selectedReplacement).map((algo) => {
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
    <div className="space-y-4">
      <div className="hidden items-center gap-3 lg:flex">
        <BarChart3 size={24} className="shrink-0 text-indigo-400" />
        <h1 className="text-xl font-bold text-gray-100 sm:text-2xl">
          Comparación de algoritmos
        </h1>
      </div>

      <AlgorithmPicker
        selectedScheduling={selectedScheduling}
        selectedReplacement={selectedReplacement}
        quantum={quantum}
        onToggleScheduling={toggleScheduling}
        onToggleReplacement={toggleReplacement}
        onQuantumChange={setQuantum}
        onCompare={handleCompare}
      />

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

      {hasSelection && (
        <StickyActionBar>
          <button
            onClick={handleCompare}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            <Play size={18} />
            Comparar {totalSelected} algoritmo{totalSelected === 1 ? '' : 's'}
          </button>
        </StickyActionBar>
      )}
    </div>
  )
}
