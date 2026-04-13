import { useMemoryStore, REPLACEMENT_LABELS, type ReplacementAlgorithmName } from '../../store/memoryStore'
import { useProcessStore } from '../../store/processStore'
import { getReplacementAlgorithm, generateReferenceString } from '../../engine/memory/index'
import { Play, RotateCcw } from 'lucide-react'

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

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">
        Configuración del algoritmo
      </h2>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">Algoritmo</label>
          <select
            value={selectedAlgorithm}
            onChange={(e) =>
              setSelectedAlgorithm(e.target.value as ReplacementAlgorithmName)
            }
            className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-500"
          >
            {algorithmKeys.map((key) => (
              <option key={key} value={key}>
                {REPLACEMENT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">Marcos de página</label>
          <input
            type="number"
            min={1}
            max={64}
            value={frames}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (!isNaN(v) && v > 0) setFrames(v)
            }}
            className="w-24 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-100 outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleRun}
          disabled={processes.length === 0}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play size={16} />
          Ejecutar
        </button>

        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700"
        >
          <RotateCcw size={16} />
          Reiniciar
        </button>
      </div>

      {processes.length === 0 && (
        <p className="mt-3 text-sm text-yellow-400">
          Agrega procesos en la sección de procesos antes de ejecutar.
        </p>
      )}
    </div>
  )
}
