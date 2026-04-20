import { motion } from 'framer-motion'
import type { Frame } from '../../engine/memory/types'
import { getProcessColor, getProcessColorWithAlpha } from '../../utils/colors'

interface Props {
  frames: Frame[]
}

export default function MemoryGrid({ frames }: Props) {
  if (frames.length === 0) {
    return (
      <div className="surface-glass rounded-2xl border-dashed p-6 text-center text-[13px] text-[color:var(--text-muted)]">
        Sin marcos para mostrar. Configura la memoria y asigna páginas.
      </div>
    )
  }

  return (
    <div className="surface-card p-5">
      <h3 className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        Mapa de memoria
      </h3>

      <div className="memory-grid grid gap-2">
        {frames.map((frame, idx) => {
          const occupied = frame.pid !== null
          const bg = occupied
            ? getProcessColorWithAlpha(frame.pid!, 0.18)
            : 'var(--surface-2)'
          const border = occupied
            ? getProcessColor(frame.pid!)
            : 'var(--border-strong)'

          return (
            <motion.div
              key={frame.frameNumber}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: idx * 0.012 }}
              className="flex flex-col items-center justify-center rounded-lg border px-2 py-3 text-center transition"
              style={{
                backgroundColor: bg,
                borderColor: border,
              }}
            >
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
                M{frame.frameNumber}
              </span>
              {occupied ? (
                <span
                  className="mt-0.5 font-mono text-[12px] font-bold tabular-nums"
                  style={{ color: getProcessColor(frame.pid!) }}
                >
                  P{frame.pid}:Pg{frame.pageNumber}
                </span>
              ) : (
                <span className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
                  Libre
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
