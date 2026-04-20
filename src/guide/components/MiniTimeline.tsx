import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { getProcessColor } from '../../utils/colors'
import type { ReplacementStep } from '../../engine/memory/types'

interface MiniTimelineProps {
  steps: ReplacementStep[]
  cursor: number
}

export default function MiniTimeline({ steps, cursor }: MiniTimelineProps) {
  if (steps.length === 0) return null

  return (
    <div className="surface-card p-3">
      <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        Referencias en orden
      </p>
      <div className="flex gap-2 overflow-x-auto px-2 pt-3 pb-2 sm:gap-1.5">
        {steps.map((s, i) => {
          const visible = i <= cursor
          return (
            <motion.div
              key={i}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: visible ? 1 : 0.85,
                opacity: visible ? 1 : 0.25,
              }}
              transition={{ delay: visible ? 0 : 0, duration: 0.2 }}
              className={`relative flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-lg border font-mono text-[11px] font-bold tabular-nums ${
                s.isPageFault
                  ? 'border-rose-300/40 bg-rose-300/5 text-rose-300'
                  : 'border-emerald-300/40 bg-emerald-300/5 text-emerald-300'
              }`}
            >
              <span
                className="block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: getProcessColor(s.pid) }}
              />
              <span className="mt-0.5 text-[color:var(--text)]">{s.requestedPage}</span>
              {visible && (
                <span className="absolute -top-1.5 -right-1.5">
                  {s.isPageFault ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white">
                      <X size={10} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
