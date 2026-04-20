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
      <div className="flex flex-col items-center justify-center gap-3 py-32 text-[color:var(--text-muted)]">
        <AlertCircle size={36} className="text-amber-300/80" />
        <p className="text-[16px] font-semibold text-[color:var(--text)]">Sin procesos</p>
        <p className="text-[13px]">Primero agrega procesos en la pantalla de Captura.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="hidden items-end justify-between lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-2)]">
            <BarChart3 size={18} className="text-[color:var(--accent)]" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
              Módulo · Comparison
            </span>
            <h1 className="text-[26px] font-semibold tracking-tight text-[color:var(--text)]">
              Comparación de algoritmos
            </h1>
          </div>
        </div>
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
        <div className="surface-glass flex items-center gap-2 px-4 py-6 text-[color:var(--text-muted)]">
          <Info size={16} className="text-[color:var(--accent)]" />
          <span className="text-[13px]">
            Selecciona algoritmos y presiona Comparar.
          </span>
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
          <button onClick={handleCompare} className="btn-primary h-12 w-full">
            <Play size={18} />
            Comparar {totalSelected} algoritmo{totalSelected === 1 ? '' : 's'}
          </button>
        </StickyActionBar>
      )}
    </div>
  )
}
