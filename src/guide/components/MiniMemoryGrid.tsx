import { motion } from 'framer-motion'
import type { Frame } from '../../engine/memory/types'
import { getProcessColor } from '../../utils/colors'

interface MiniMemoryGridProps {
  frames: Frame[]
  highlightFrame?: number | null
  evictedFrame?: number | null
}

export default function MiniMemoryGrid({
  frames,
  highlightFrame = null,
  evictedFrame = null,
}: MiniMemoryGridProps) {
  const cols = frames.length <= 4 ? frames.length : 4

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Marcos de memoria
      </p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {frames.map((f) => {
          const isHighlight = f.frameNumber === highlightFrame
          const isEvicted = f.frameNumber === evictedFrame
          const occupied = f.pid !== null
          return (
            <motion.div
              key={f.frameNumber}
              layout
              initial={false}
              animate={{
                scale: isHighlight ? 1.05 : 1,
                boxShadow: isHighlight
                  ? '0 0 0 3px rgb(99 102 241)'
                  : isEvicted
                  ? '0 0 0 3px rgb(244 63 94)'
                  : '0 0 0 0 transparent',
              }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              className="relative aspect-square rounded-lg border border-gray-700 bg-gray-800/60"
            >
              <div className="absolute left-1 top-0.5 text-[9px] text-gray-500">
                F{f.frameNumber}
              </div>
              {occupied && (
                <motion.div
                  key={`${f.pid}-${f.pageNumber}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="absolute inset-1.5 flex flex-col items-center justify-center rounded-md text-[11px] font-bold text-white"
                  style={{ backgroundColor: getProcessColor(f.pid as number) }}
                >
                  <span>P{f.pid}</span>
                  <span className="text-[9px] opacity-80">pag {f.pageNumber}</span>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
