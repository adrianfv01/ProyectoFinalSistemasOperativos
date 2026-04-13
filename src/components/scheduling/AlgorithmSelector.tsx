import { useSchedulingStore, ALGORITHM_LABELS, AlgorithmName } from '../../store/schedulingStore'
import { useProcessStore } from '../../store/processStore'
import { getScheduler } from '../../engine/scheduling/index'
import { Play, RotateCcw } from 'lucide-react'

const ALGORITHMS = Object.keys(ALGORITHM_LABELS) as AlgorithmName[]

const NEEDS_QUANTUM: AlgorithmName[] = ['roundRobin', 'multilevelQueue', 'multilevelFeedback']
const NEEDS_MULTILEVEL_QUANTUM: AlgorithmName[] = ['multilevelFeedback']

export default function AlgorithmSelector() {
  const { selectedAlgorithm, config, setAlgorithm, setConfig, setResult, reset } =
    useSchedulingStore()
  const processes = useProcessStore((s) => s.processes)

  const handleRun = () => {
    if (processes.length === 0) return
    const scheduler = getScheduler(selectedAlgorithm)
    const result = scheduler(processes, config)
    setResult(result)
  }

  const showQuantum = NEEDS_QUANTUM.includes(selectedAlgorithm)
  const showMultilevelQuantum = NEEDS_MULTILEVEL_QUANTUM.includes(selectedAlgorithm)

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">Selector de algoritmo</h2>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-sm text-gray-400">Algoritmo</label>
          <select
            value={selectedAlgorithm}
            onChange={(e) => setAlgorithm(e.target.value as AlgorithmName)}
            className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-gray-100 outline-none focus:border-indigo-500"
          >
            {ALGORITHMS.map((algo) => (
              <option key={algo} value={algo}>
                {ALGORITHM_LABELS[algo]}
              </option>
            ))}
          </select>
        </div>

        {showQuantum && !showMultilevelQuantum && (
          <div className="w-32">
            <label className="mb-1 block text-sm text-gray-400">Quantum</label>
            <input
              type="number"
              min={1}
              value={config.quantum ?? 2}
              onChange={(e) => setConfig({ quantum: Math.max(1, Number(e.target.value)) })}
              className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-gray-100 outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {showMultilevelQuantum && (
          <div className="flex gap-3">
            {(config.quantumPerLevel ?? [2, 4, 8]).map((q, i) => (
              <div key={i} className="w-24">
                <label className="mb-1 block text-sm text-gray-400">
                  Q nivel {i + 1}
                </label>
                <input
                  type="number"
                  min={1}
                  value={q}
                  onChange={(e) => {
                    const updated = [...(config.quantumPerLevel ?? [2, 4, 8])]
                    updated[i] = Math.max(1, Number(e.target.value))
                    setConfig({ quantumPerLevel: updated })
                  }}
                  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-gray-100 outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleRun}
            disabled={processes.length === 0}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play size={16} />
            Ejecutar
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 font-medium text-gray-300 transition hover:bg-gray-700"
          >
            <RotateCcw size={16} />
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  )
}
