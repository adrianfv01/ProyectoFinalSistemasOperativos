import { useState, useMemo } from 'react'
import type { PageTableEntry } from '../../engine/memory/types'
import { getProcessColor } from '../../utils/colors'

interface Props {
  pageTables: Map<number, PageTableEntry[]>
  pids: number[]
}

export default function PageTable({ pageTables, pids }: Props) {
  const [selectedPid, setSelectedPid] = useState<number | null>(
    pids.length > 0 ? pids[0] : null,
  )

  const entries = useMemo(() => {
    if (selectedPid === null) return []
    return pageTables.get(selectedPid) ?? []
  }, [pageTables, selectedPid])

  if (pids.length === 0) {
    return (
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 text-center text-sm text-gray-500">
        No hay tablas de páginas disponibles.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
      <div className="mb-4 flex items-center gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
          Tabla de páginas
        </h3>

        <select
          value={selectedPid ?? ''}
          onChange={(e) => setSelectedPid(Number(e.target.value))}
          className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-gray-100 outline-none transition focus:border-indigo-500"
        >
          {pids.map((pid) => (
            <option key={pid} value={pid}>
              Proceso {pid}
            </option>
          ))}
        </select>
      </div>

      {entries.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-700">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/60 text-xs font-medium uppercase tracking-wider text-gray-400">
                <th className="px-4 py-2.5">Página</th>
                <th className="px-4 py-2.5">Marco</th>
                <th className="px-4 py-2.5">Cargada</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const color = getProcessColor(entry.pid)
                return (
                  <tr
                    key={entry.pageNumber}
                    className={`border-b border-gray-800 transition-colors ${
                      entry.loaded ? 'bg-gray-800/30' : ''
                    }`}
                  >
                    <td className="px-4 py-2 text-gray-300">{entry.pageNumber}</td>
                    <td className="px-4 py-2 text-gray-300">
                      {entry.frameNumber !== null ? entry.frameNumber : '—'}
                    </td>
                    <td className="px-4 py-2">
                      {entry.loaded ? (
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                          style={{ backgroundColor: color }}
                        >
                          Sí
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-gray-700 px-2 py-0.5 text-xs font-semibold text-gray-400">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Selecciona un proceso para ver su tabla.</p>
      )}
    </div>
  )
}
