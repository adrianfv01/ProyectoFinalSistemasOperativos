import { motion, AnimatePresence } from 'framer-motion'
import { Cpu } from 'lucide-react'
import { useSchedulingStore } from '../../store/schedulingStore'
import { getProcessColor } from '../../utils/colors'
import type { TimeSlice } from '../../engine/scheduling/types'

function sliceLabel(s: TimeSlice) {
  return s.tid != null ? `P${s.pid}-H${s.tid}` : `P${s.pid}`
}

export default function CpuDisplay() {
  const { result, currentStep } = useSchedulingStore()
  const timeline = result?.timeline ?? []

  const current = currentStep < timeline.length ? timeline[currentStep] : null

  return (
    <div className="surface-card p-4">
      <h2 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        CPU
      </h2>

      <div className="flex items-center justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] shadow-[inset_0_0_24px_rgba(0,0,0,0.25)]">
          <Cpu size={28} className="absolute text-[color:var(--text-faint)]" />
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div
                key={`${current.pid}-${current.start}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ backgroundColor: getProcessColor(current.pid) }}
                className="z-10 rounded-lg px-3 py-2 font-mono text-[13px] font-bold tabular-nums text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
              >
                {sliceLabel(current)}
              </motion.div>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="z-10 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]"
              >
                Inactivo
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
