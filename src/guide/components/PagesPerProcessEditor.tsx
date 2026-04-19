import { Minus, Plus } from 'lucide-react'
import { useTutorialStore } from '../../store/tutorialStore'
import { getProcessColor } from '../../utils/colors'

export default function PagesPerProcessEditor() {
  const { miniProcesses, pagesPerProcess, setPagesForProcess } = useTutorialStore()

  if (miniProcesses.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Páginas que pide cada proceso
      </p>
      <div className="space-y-2">
        {miniProcesses.map((p) => {
          const pages = pagesPerProcess[p.pid] ?? 2
          return (
            <div
              key={p.pid}
              className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-900/70 p-3"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: getProcessColor(p.pid) }}
              >
                P{p.pid}
              </span>
              <div className="flex-1 text-xs text-gray-400">
                Necesita
                <span className="ml-1 text-base font-bold tabular-nums text-indigo-300">
                  {pages}
                </span>
                <span className="ml-1">páginas</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPagesForProcess(p.pid, pages - 1)}
                  disabled={pages <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 text-gray-200 transition active:scale-95 hover:bg-gray-800 disabled:opacity-30"
                  aria-label="Disminuir páginas"
                >
                  <Minus size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPagesForProcess(p.pid, pages + 1)}
                  disabled={pages >= 6}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 text-gray-200 transition active:scale-95 hover:bg-gray-800 disabled:opacity-30"
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
