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
    <div className="surface-card p-4">
      <h2 className="mb-3 text-[15px] font-semibold tracking-tight text-[color:var(--text)] sm:text-[16px]">
        Selector de algoritmo
      </h2>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[color:var(--text-muted)]">
            Algoritmo
          </label>
          <select
            value={selectedAlgorithm}
            onChange={(e) => setAlgorithm(e.target.value as AlgorithmName)}
            className="h-12 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 text-[15px] text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)]/50 focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:h-11 sm:text-[13px]"
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
          <button onClick={handleRun} disabled={noProcesses} className="btn-primary h-12 flex-1 sm:h-11">
            <Play size={16} />
            Ejecutar
          </button>
          <button onClick={reset} className="btn-ghost h-12 sm:h-11">
            <RotateCcw size={16} />
            Reiniciar
          </button>
        </div>

        {noProcesses && (
          <p className="rounded-lg border border-amber-300/30 bg-amber-300/5 px-3 py-2 text-[12px] text-amber-300">
            Agrega procesos en la sección de Procesos antes de ejecutar.
          </p>
        )}
      </div>
    </div>
  )
}
