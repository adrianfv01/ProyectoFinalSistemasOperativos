import { useState } from 'react'
import { Settings } from 'lucide-react'
import { useMemoryStore } from '../../store/memoryStore'

interface Props {
  variant?: 'card' | 'plain'
  onApplied?: () => void
}

export default function MemoryConfig({ variant = 'card', onApplied }: Props) {
  const { totalMemory, pageSize, setMemoryConfig } = useMemoryStore()

  const [localTotal, setLocalTotal] = useState(totalMemory)
  const [localPage, setLocalPage] = useState(pageSize)

  const calculatedFrames = localPage > 0 ? Math.floor(localTotal / localPage) : 0

  function handleApply() {
    if (localTotal <= 0 || localPage <= 0) return
    setMemoryConfig({ totalMemory: localTotal, pageSize: localPage })
    onApplied?.()
  }

  const wrapperClass =
    variant === 'card'
      ? 'rounded-xl border border-gray-700 bg-gray-900 p-5'
      : ''

  return (
    <div className={wrapperClass}>
      {variant === 'card' && (
        <div className="mb-4 flex items-center gap-2">
          <Settings size={18} className="text-indigo-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
            Configuración de memoria
          </h3>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs text-gray-400">
            Tamaño de memoria (KB)
          </label>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            value={localTotal}
            onChange={(e) => setLocalTotal(Math.max(1, parseInt(e.target.value) || 1))}
            className="h-12 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 text-base text-gray-100 outline-none transition focus:border-indigo-500 sm:h-10 sm:text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-400">
            Tamaño de página (KB)
          </label>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            value={localPage}
            onChange={(e) => setLocalPage(Math.max(1, parseInt(e.target.value) || 1))}
            className="h-12 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 text-base text-gray-100 outline-none transition focus:border-indigo-500 sm:h-10 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-gray-400">
          Marcos calculados:{' '}
          <span className="font-semibold text-indigo-400">{calculatedFrames}</span>
        </span>

        <button
          onClick={handleApply}
          disabled={localTotal <= 0 || localPage <= 0}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-auto sm:rounded-lg"
        >
          Aplicar configuración
        </button>
      </div>
    </div>
  )
}
