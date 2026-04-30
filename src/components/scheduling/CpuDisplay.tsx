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
  const numCores = result?.numCores ?? 1
  const perCore =
    result?.timelinePerCore && result.timelinePerCore.length > 0
      ? result.timelinePerCore
      : [timeline]

  const currentTime =
    timeline.length === 0
      ? 0
      : currentStep < timeline.length
      ? timeline[currentStep].start
      : timeline[timeline.length - 1].end

  const runningPerCore: (TimeSlice | null)[] = perCore.map((row) => {
    const found = row.find((s) => s.start <= currentTime && currentTime < s.end)
    return found ?? null
  })

  return (
    <div className="surface-card p-4">
      <h2 className="mb-3 flex items-center justify-between font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        <span>CPU</span>
        <span className="text-[color:var(--text-faint)]">
          {numCores} {numCores === 1 ? 'núcleo' : 'núcleos'}
        </span>
      </h2>

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(numCores, 4)}, minmax(0, 1fr))`,
        }}
      >
        {runningPerCore.map((current, i) => (
          <CoreBox key={i} index={i} slice={current} />
        ))}
      </div>
    </div>
  )
}

function CoreBox({ index, slice }: { index: number; slice: TimeSlice | null }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
        Core {index}
      </span>
      <div className="relative flex h-20 w-full min-w-0 items-center justify-center rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] shadow-[inset_0_0_24px_rgba(0,0,0,0.25)]">
        <Cpu size={22} className="absolute text-[color:var(--text-faint)]" />
        <AnimatePresence mode="wait">
          {slice ? (
            <motion.div
              key={`${slice.pid}-${slice.tid ?? 'p'}-${slice.start}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ backgroundColor: getProcessColor(slice.pid) }}
              className="z-10 rounded-lg px-2.5 py-1.5 font-mono text-[12px] font-bold tabular-nums text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
            >
              {sliceLabel(slice)}
            </motion.div>
          ) : (
            <motion.span
              key={`idle-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]"
            >
              Inactivo
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
