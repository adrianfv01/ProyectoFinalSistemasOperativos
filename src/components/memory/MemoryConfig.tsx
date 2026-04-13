import { useState } from 'react'
import { Settings } from 'lucide-react'
import { useMemoryStore } from '../../store/memoryStore'

export default function MemoryConfig() {
  const { totalMemory, pageSize, frames, setMemoryConfig } = useMemoryStore()

  const [localTotal, setLocalTotal] = useState(totalMemory)
  const [localPage, setLocalPage] = useState(pageSize)

  const calculatedFrames = localPage > 0 ? Math.floor(localTotal / localPage) : 0

  function handleApply() {
    if (localTotal <= 0 || localPage <= 0) return
    setMemoryConfig({ totalMemory: localTotal, pageSize: localPage })
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Settings size={18} className="text-indigo-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
          Configuración de memoria
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs text-gray-400">
            Tamaño de memoria (KB)
          </label>
          <input
            type="number"
            min={1}
            value={localTotal}
            onChange={(e) => setLocalTotal(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none transition focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-400">
            Tamaño de página (KB)
          </label>
          <input
            type="number"
            min={1}
            value={localPage}
            onChange={(e) => setLocalPage(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none transition focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          Marcos calculados:{' '}
          <span className="font-semibold text-indigo-400">{calculatedFrames}</span>
        </span>

        <button
          onClick={handleApply}
          disabled={localTotal <= 0 || localPage <= 0}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Aplicar configuración
        </button>
      </div>
    </div>
  )
}
