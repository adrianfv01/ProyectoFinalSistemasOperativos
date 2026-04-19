import { motion } from 'framer-motion'
import type { Frame } from '../../engine/memory/types'
import { getProcessColor, getProcessColorWithAlpha } from '../../utils/colors'

interface Props {
  frames: Frame[]
}

export default function MemoryGrid({ frames }: Props) {
  if (frames.length === 0) {
    return (
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 text-center text-sm text-gray-500">
        Sin marcos para mostrar. Configura la memoria y asigna páginas.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">
        Mapa de memoria
      </h3>

      <div className="memory-grid grid gap-2">
        {frames.map((frame, idx) => {
          const occupied = frame.pid !== null
          const bg = occupied
            ? getProcessColorWithAlpha(frame.pid!, 0.18)
            : undefined
          const border = occupied
            ? getProcessColor(frame.pid!)
            : '#374151'

          return (
            <motion.div
              key={frame.frameNumber}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: idx * 0.012 }}
              className="flex flex-col items-center justify-center rounded-lg border px-2 py-3 text-center"
              style={{
                backgroundColor: occupied ? bg : '#1f2937',
                borderColor: border,
              }}
            >
              <span className="text-[10px] font-medium text-gray-500">
                M{frame.frameNumber}
              </span>
              {occupied ? (
                <span
                  className="mt-0.5 text-xs font-bold"
                  style={{ color: getProcessColor(frame.pid!) }}
                >
                  P{frame.pid}:Pg{frame.pageNumber}
                </span>
              ) : (
                <span className="mt-0.5 text-xs text-gray-600">Libre</span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
