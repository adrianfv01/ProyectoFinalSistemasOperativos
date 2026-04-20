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

  const wrapperClass = variant === 'card' ? 'surface-card p-5' : ''

  const inputClass =
    'h-12 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 font-mono text-[15px] tabular-nums text-[color:var(--text)] outline-none transition focus:border-[color:var(--accent)]/50 focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:h-11 sm:text-[13px]'

  return (
    <div className={wrapperClass}>
      {variant === 'card' && (
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] text-[color:var(--accent)]">
            <Settings size={16} />
          </span>
          <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            Configuración de memoria
          </h3>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[color:var(--text-muted)]">
            Tamaño de memoria (KB)
          </label>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            value={localTotal}
            onChange={(e) => setLocalTotal(Math.max(1, parseInt(e.target.value) || 1))}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[color:var(--text-muted)]">
            Tamaño de página (KB)
          </label>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            value={localPage}
            onChange={(e) => setLocalPage(Math.max(1, parseInt(e.target.value) || 1))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[13px] text-[color:var(--text-muted)]">
          Marcos calculados:{' '}
          <span className="font-mono font-semibold tabular-nums text-[color:var(--accent)]">
            {calculatedFrames}
          </span>
        </span>

        <button
          onClick={handleApply}
          disabled={localTotal <= 0 || localPage <= 0}
          className="btn-primary h-12 w-full sm:h-11 sm:w-auto"
        >
          Aplicar configuración
        </button>
      </div>
    </div>
  )
}
