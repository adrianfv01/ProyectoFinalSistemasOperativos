import { useState, useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
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
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-300">
        Tabla de páginas
      </h3>

      <div
        className="hide-scrollbar -mx-5 mb-4 flex gap-2 overflow-x-auto px-5"
        data-no-swipe
      >
        {pids.map((pid) => {
          const isActive = selectedPid === pid
          const color = getProcessColor(pid)
          return (
            <button
              key={pid}
              onClick={() => setSelectedPid(pid)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
                isActive
                  ? 'text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300'
              }`}
              style={
                isActive
                  ? { backgroundColor: color, borderColor: color }
                  : undefined
              }
            >
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  isActive ? 'bg-white/80' : ''
                }`}
                style={isActive ? undefined : { backgroundColor: color }}
              />
              Proceso {pid}
            </button>
          )
        })}
      </div>

      {entries.length > 0 ? (
        <>
          <div className="space-y-2 lg:hidden">
            {entries.map((entry) => {
              const color = getProcessColor(entry.pid)
              return (
                <div
                  key={entry.pageNumber}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${
                    entry.loaded
                      ? 'border-gray-700 bg-gray-800/60'
                      : 'border-gray-800 bg-gray-900/60'
                  }`}
                >
                  <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-800 font-mono text-sm font-semibold text-gray-200">
                    Pg{entry.pageNumber}
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-gray-500" />
                  <div className="flex h-10 min-w-[3rem] shrink-0 items-center justify-center rounded-lg bg-gray-800 px-3 font-mono text-sm font-semibold text-gray-200">
                    {entry.frameNumber !== null ? `M${entry.frameNumber}` : '—'}
                  </div>
                  <div className="ml-auto">
                    {entry.loaded ? (
                      <span
                        className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: color }}
                      >
                        Cargada
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-gray-700 px-2.5 py-1 text-xs font-semibold text-gray-400">
                        Sin cargar
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border border-gray-700 lg:block">
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
        </>
      ) : (
        <p className="text-sm text-gray-500">Selecciona un proceso para ver su tabla.</p>
      )}
    </div>
  )
}
