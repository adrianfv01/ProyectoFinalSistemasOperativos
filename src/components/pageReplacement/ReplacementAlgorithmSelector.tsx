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
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <h2 className="mb-3 text-base font-semibold text-gray-100 sm:text-lg">
        Configuración del algoritmo
      </h2>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-gray-400">Algoritmo</label>
          <select
            value={selectedAlgorithm}
            onChange={(e) =>
              setSelectedAlgorithm(e.target.value as ReplacementAlgorithmName)
            }
            className="h-12 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 text-base text-gray-100 outline-none focus:border-indigo-500 sm:h-11 sm:text-sm"
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
