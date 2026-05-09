import { useState } from 'react'
import { AlertCircle, FlaskConical, Info, Play } from 'lucide-react'
import { useProcessStore } from '../store/processStore'
import { useMemoryStore } from '../store/memoryStore'
import {
  ALGORITHM_LABELS,
  ALGORITHM_SHORT_LABELS,
  type AlgorithmName,
} from '../store/schedulingStore'
import {
  REPLACEMENT_LABELS,
  REPLACEMENT_SHORT_LABELS,
  type ReplacementAlgorithmName,
} from '../store/memoryStore'
import { getScheduler } from '../engine/scheduling/index'
import { getReplacementAlgorithm, generateReferenceString } from '../engine/memory/index'
import AlgorithmPicker from '../components/comparison/AlgorithmPicker'
import ComparisonChart, {
  type SchedulingComparisonEntry,
  type ReplacementComparisonEntry,
} from '../components/comparison/ComparisonChart'
import StickyActionBar from '../components/ui/StickyActionBar'
import { applyPreset } from '../data/applyPreset'
import { getPresetById } from '../data/presets'

const SCHEDULING_KEYS = Object.keys(ALGORITHM_LABELS) as AlgorithmName[]
const REPLACEMENT_KEYS = Object.keys(REPLACEMENT_LABELS) as ReplacementAlgorithmName[]
const COMPARISON_PRESET_ID = 'comparison-mixed'

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

  const toggleAllScheduling = () => {
    setSelectedScheduling((prev) =>
      prev.size === SCHEDULING_KEYS.length ? new Set() : new Set(SCHEDULING_KEYS),
    )
  }

  const toggleAllReplacement = () => {
    setSelectedReplacement((prev) =>
      prev.size === REPLACEMENT_KEYS.length ? new Set() : new Set(REPLACEMENT_KEYS),
    )
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
        label: ALGORITHM_SHORT_LABELS[algo],
        fullLabel: ALGORITHM_LABELS[algo],
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
        label: REPLACEMENT_SHORT_LABELS[algo],
        fullLabel: REPLACEMENT_LABELS[algo],
        pageFaults,
      }
    })

    setSchedulingResults(schedResults)
    setReplacementResults(replResults)
    setHasRun(true)
  }

  const loadComparisonPreset = () => {
    const preset = getPresetById(COMPARISON_PRESET_ID)
    if (!preset) return
    applyPreset(preset)
    setSchedulingResults([])
    setReplacementResults([])
    setHasRun(false)
  }

  if (processes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-[color:var(--text-muted)]">
        <AlertCircle size={36} className="text-amber-300/80" />
        <p className="text-[16px] font-semibold text-[color:var(--text)]">Sin procesos</p>
        <p className="max-w-md text-center text-[13px]">
          Agrega procesos en la pantalla de Captura, o carga un caso de prueba
          diseñado para que cada algoritmo dé un resultado distinto.
        </p>
        <button onClick={loadComparisonPreset} className="btn-primary mt-2 h-11">
          <FlaskConical size={16} />
          Cargar caso de prueba
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-2.5 text-[12.5px] text-[color:var(--text-muted)]">
        <span>
          ¿Las gráficas se ven planas? Carga un caso diseñado para diferenciar a
          todos los algoritmos.
        </span>
        <button
          onClick={loadComparisonPreset}
          className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--text)] transition hover:border-[color:var(--accent)]/40"
        >
          <FlaskConical size={14} className="text-[color:var(--accent)]" />
          Cargar caso de prueba
        </button>
      </div>

      <AlgorithmPicker
        selectedScheduling={selectedScheduling}
        selectedReplacement={selectedReplacement}
        quantum={quantum}
        onToggleScheduling={toggleScheduling}
        onToggleReplacement={toggleReplacement}
        onToggleAllScheduling={toggleAllScheduling}
        onToggleAllReplacement={toggleAllReplacement}
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
