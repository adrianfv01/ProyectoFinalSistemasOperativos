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
      <div className="surface-glass rounded-2xl border-dashed p-6 text-center text-[13px] text-[color:var(--text-muted)]">
        No hay tablas de páginas disponibles.
      </div>
    )
  }

  return (
    <div className="surface-card p-5">
      <h3 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
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
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 font-mono text-[12px] font-medium tabular-nums transition ${
                isActive
                  ? 'text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)]'
                  : 'border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]'
              }`}
              style={
                isActive
                  ? { backgroundColor: color, borderColor: color }
                  : undefined
              }
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
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
                  className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                    entry.loaded
                      ? 'border-[color:var(--border)] bg-[color:var(--surface-2)]'
                      : 'border-[color:var(--border)] bg-[color:var(--surface)]'
                  }`}
                >
                  <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] font-mono text-[13px] font-semibold tabular-nums text-[color:var(--text)]">
                    Pg{entry.pageNumber}
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-[color:var(--text-faint)]" />
                  <div className="flex h-10 min-w-[3rem] shrink-0 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 font-mono text-[13px] font-semibold tabular-nums text-[color:var(--text)]">
                    {entry.frameNumber !== null ? `M${entry.frameNumber}` : '—'}
                  </div>
                  <div className="ml-auto">
                    {entry.loaded ? (
                      <span
                        className="inline-block rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
                        style={{ backgroundColor: color }}
                      >
                        Cargada
                      </span>
                    ) : (
                      <span className="chip uppercase">Sin cargar</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-[color:var(--border)] lg:block">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[color:var(--border)] bg-[color:var(--surface-2)] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
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
                      className={`border-b border-[color:var(--border)] transition-colors ${
                        entry.loaded ? 'bg-[color:var(--surface-2)]/50' : ''
                      }`}
                    >
                      <td className="px-4 py-2 font-mono tabular-nums text-[color:var(--text)]">{entry.pageNumber}</td>
                      <td className="px-4 py-2 font-mono tabular-nums text-[color:var(--text-muted)]">
                        {entry.frameNumber !== null ? entry.frameNumber : '—'}
                      </td>
                      <td className="px-4 py-2">
                        {entry.loaded ? (
                          <span
                            className="inline-block rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-white"
                            style={{ backgroundColor: color }}
                          >
                            Sí
                          </span>
                        ) : (
                          <span className="chip">No</span>
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
        <p className="text-[13px] text-[color:var(--text-muted)]">Selecciona un proceso para ver su tabla.</p>
      )}
    </div>
  )
}
