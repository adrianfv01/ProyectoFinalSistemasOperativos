import { useMemoryStore, REPLACEMENT_LABELS, type ReplacementAlgorithmName } from '../../store/memoryStore'
import { useProcessStore } from '../../store/processStore'
import { getReplacementAlgorithm, generateReferenceString } from '../../engine/memory/index'
import { Play, RotateCcw } from 'lucide-react'
import Stepper from '../ui/Stepper'

const algorithmKeys = Object.keys(REPLACEMENT_LABELS) as ReplacementAlgorithmName[]

export default function ReplacementAlgorithmSelector() {
  const {
    selectedAlgorithm,
    frames,
    setSelectedAlgorithm,
    setReplacementSteps,
    setFrames,
    reset,
  } = useMemoryStore()
  const processes = useProcessStore((s) => s.processes)

  const handleRun = () => {
    if (processes.length === 0) return
    const refs = generateReferenceString(processes)
    if (refs.length === 0) return
    const fn = getReplacementAlgorithm(selectedAlgorithm)
    const steps = fn(refs, frames)
    setReplacementSteps(steps)
  }

  const noProcesses = processes.length === 0

  return (
    <div className="surface-card p-4">
      <h2 className="mb-3 text-[15px] font-semibold tracking-tight text-[color:var(--text)] sm:text-[16px]">
        Configuración del algoritmo
      </h2>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[color:var(--text-muted)]">
            Algoritmo
          </label>
          <select
            value={selectedAlgorithm}
            onChange={(e) =>
              setSelectedAlgorithm(e.target.value as ReplacementAlgorithmName)
            }
            className="h-12 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 text-[15px] text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)]/50 focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:h-11 sm:text-[13px]"
          >
            {algorithmKeys.map((key) => (
              <option key={key} value={key}>
                {REPLACEMENT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <Stepper
          label="Marcos de página"
          value={frames}
          min={1}
          max={64}
          onChange={setFrames}
          className="max-w-[200px]"
        />

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
