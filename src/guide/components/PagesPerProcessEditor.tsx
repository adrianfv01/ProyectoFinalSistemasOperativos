import { Minus, Plus } from 'lucide-react'
import { useTutorialStore } from '../../store/tutorialStore'
import { getProcessColor } from '../../utils/colors'

export default function PagesPerProcessEditor() {
  const { miniProcesses, pagesPerProcess, setPagesForProcess } = useTutorialStore()

  if (miniProcesses.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        Páginas que pide cada proceso
      </p>
      <div className="space-y-2">
        {miniProcesses.map((p) => {
          const pages = pagesPerProcess[p.pid] ?? 2
          return (
            <div
              key={p.pid}
              className="surface-card flex items-center gap-3 p-3"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-[12px] font-bold tabular-nums text-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
                style={{ backgroundColor: getProcessColor(p.pid) }}
              >
                P{p.pid}
              </span>
              <div className="flex-1 text-[12px] text-[color:var(--text-muted)]">
                Necesita
                <span className="ml-1 font-mono text-[16px] font-bold tabular-nums text-[color:var(--accent)]">
                  {pages}
                </span>
                <span className="ml-1">páginas</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPagesForProcess(p.pid, pages - 1)}
                  disabled={pages <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-3)] hover:text-[color:var(--text)] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Disminuir páginas"
                >
                  <Minus size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPagesForProcess(p.pid, pages + 1)}
                  disabled={pages >= 6}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-3)] hover:text-[color:var(--text)] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Aumentar páginas"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
