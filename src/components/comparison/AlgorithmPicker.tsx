import { useState } from 'react'
import { Settings2, Play } from 'lucide-react'
import { ALGORITHM_LABELS, type AlgorithmName } from '../../store/schedulingStore'
import { REPLACEMENT_LABELS, type ReplacementAlgorithmName } from '../../store/memoryStore'

const SCHEDULING_KEYS = Object.keys(ALGORITHM_LABELS) as AlgorithmName[]
const REPLACEMENT_KEYS = Object.keys(REPLACEMENT_LABELS) as ReplacementAlgorithmName[]
const NEEDS_QUANTUM: AlgorithmName[] = ['roundRobin', 'multilevelQueue', 'multilevelFeedback']

interface AlgorithmPickerProps {
  onCompare: (
    scheduling: AlgorithmName[],
    replacement: ReplacementAlgorithmName[],
    quantum: number,
  ) => void
  disabled?: boolean
}

export default function AlgorithmPicker({ onCompare, disabled }: AlgorithmPickerProps) {
  const [selectedScheduling, setSelectedScheduling] = useState<Set<AlgorithmName>>(new Set())
  const [selectedReplacement, setSelectedReplacement] = useState<Set<ReplacementAlgorithmName>>(new Set())
  const [quantum, setQuantum] = useState(2)

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

  const needsQuantum = NEEDS_QUANTUM.some((k) => selectedScheduling.has(k))
  const hasSelection = selectedScheduling.size > 0 || selectedReplacement.size > 0

  const handleCompare = () => {
    onCompare(
      Array.from(selectedScheduling),
      Array.from(selectedReplacement),
      quantum,
    )
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-4 sm:p-5">
      <div className="grid gap-6 md:grid-cols-2">
        <fieldset>
          <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-200">
            <Settings2 size={16} className="text-indigo-400" />
            Algoritmos de planificación
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SCHEDULING_KEYS.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2.5 text-sm transition hover:border-indigo-500/50"
              >
                <input
                  type="checkbox"
                  checked={selectedScheduling.has(key)}
                  onChange={() => toggleScheduling(key)}
                  className="accent-indigo-500"
                />
                <span className="text-gray-300">{ALGORITHM_LABELS[key]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-200">
            <Settings2 size={16} className="text-emerald-400" />
            Algoritmos de reemplazo de página
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {REPLACEMENT_KEYS.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2.5 text-sm transition hover:border-emerald-500/50"
              >
                <input
                  type="checkbox"
                  checked={selectedReplacement.has(key)}
                  onChange={() => toggleReplacement(key)}
                  className="accent-emerald-500"
                />
                <span className="text-gray-300">{REPLACEMENT_LABELS[key]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        {needsQuantum && (
          <div className="w-full sm:w-auto">
            <label className="mb-1 block text-xs text-gray-400">
              Quantum (RR / MLQ / MLFQ)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={quantum}
              onChange={(e) => setQuantum(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:outline-none sm:w-24"
            />
          </div>
        )}

        <button
          onClick={handleCompare}
          disabled={!hasSelection || disabled}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          <Play size={16} />
          Comparar
        </button>
      </div>
    </div>
  )
}
