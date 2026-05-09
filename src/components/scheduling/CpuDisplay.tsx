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
  const utilPerCore = result?.cpuUtilizationPerCore ?? []

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

  const activeNow = runningPerCore.filter((s) => s !== null).length

  return (
    <div className="surface-card p-4">
      <h2 className="mb-3 flex items-center justify-between gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        <span>CPU</span>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] tabular-nums ${
              activeNow === numCores
                ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-300'
                : activeNow === 0
                ? 'border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-faint)]'
                : 'border-amber-300/40 bg-amber-300/10 text-amber-300'
            }`}
            title="Cantidad de núcleos ocupados en este tick"
          >
            {activeNow}/{numCores} activos
          </span>
          <span className="text-[color:var(--text-faint)]">
            {numCores} {numCores === 1 ? 'núcleo' : 'núcleos'}
          </span>
        </div>
      </h2>

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(numCores, 4)}, minmax(0, 1fr))`,
        }}
      >
        {runningPerCore.map((current, i) => (
          <CoreBox
            key={i}
            index={i}
            slice={current}
            utilization={utilPerCore[i] ?? 0}
          />
        ))}
      </div>
    </div>
  )
}

function CoreBox({
  index,
  slice,
  utilization,
}: {
  index: number
  slice: TimeSlice | null
  utilization: number
}) {
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
      <div
        className="w-full"
        title={`Utilización total del Core ${index} en toda la simulación`}
      >
        <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
          <span>Uso</span>
          <span className="tabular-nums text-[color:var(--text-muted)]">
            {utilization.toFixed(0)}%
          </span>
        </div>
        <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-[color:var(--surface-2)]">
          <div
            className="h-full rounded-full bg-[color:var(--accent)]"
            style={{ width: `${Math.min(100, Math.max(0, utilization))}%` }}
          />
        </div>
      </div>
    </div>
  )
}
