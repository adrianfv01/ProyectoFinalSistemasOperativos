import { useSchedulingStore, ALGORITHM_LABELS, AlgorithmName } from '../../store/schedulingStore'
import { useProcessStore } from '../../store/processStore'
import { getScheduler } from '../../engine/scheduling/index'
import { Play, RotateCcw } from 'lucide-react'
import Stepper from '../ui/Stepper'

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
  const noProcesses = processes.length === 0

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <h2 className="mb-3 text-base font-semibold text-gray-100 sm:text-lg">
        Selector de algoritmo
      </h2>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-gray-400">Algoritmo</label>
          <select
            value={selectedAlgorithm}
            onChange={(e) => setAlgorithm(e.target.value as AlgorithmName)}
            className="h-12 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 text-base text-gray-100 outline-none focus:border-indigo-500 sm:h-11 sm:text-sm"
          >
            {ALGORITHMS.map((algo) => (
              <option key={algo} value={algo}>
                {ALGORITHM_LABELS[algo]}
              </option>
            ))}
          </select>
        </div>

        {showQuantum && !showMultilevelQuantum && (
          <Stepper
            label="Quantum"
            value={config.quantum ?? 2}
            onChange={(v) => setConfig({ quantum: v })}
            min={1}
            className="max-w-[180px]"
          />
        )}

        {showMultilevelQuantum && (
          <div className="grid grid-cols-3 gap-2">
            {(config.quantumPerLevel ?? [2, 4, 8]).map((q, i) => (
              <Stepper
                key={i}
                label={`Q nivel ${i + 1}`}
                value={q}
                min={1}
                onChange={(v) => {
                  const updated = [...(config.quantumPerLevel ?? [2, 4, 8])]
                  updated[i] = v
                  setConfig({ quantumPerLevel: updated })
                }}
              />
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleRun}
            disabled={noProcesses}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:rounded-lg"
          >
            <Play size={16} />
            Ejecutar
          </button>
          <button
            onClick={reset}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-600 px-4 text-sm font-medium text-gray-300 transition active:bg-gray-700 sm:h-11 sm:rounded-lg"
          >
            <RotateCcw size={16} />
            Reiniciar
          </button>
        </div>

        {noProcesses && (
          <p className="text-xs text-yellow-400">
            Agrega procesos en la sección de Procesos antes de ejecutar.
          </p>
        )}
      </div>
    </div>
  )
}
