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
    <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Referencias en orden
      </p>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
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
              className={`relative flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-md border text-[11px] font-bold ${
                s.isPageFault
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                  : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
              }`}
              style={{
                borderColor: visible
                  ? s.isPageFault
                    ? 'rgb(244 63 94 / 0.6)'
                    : 'rgb(16 185 129 / 0.6)'
                  : undefined,
              }}
            >
              <span
                className="block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: getProcessColor(s.pid) }}
              />
              <span className="mt-0.5 text-gray-100">{s.requestedPage}</span>
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
