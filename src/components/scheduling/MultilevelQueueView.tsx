import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers } from 'lucide-react'
import { useSchedulingStore } from '../../store/schedulingStore'
import { getProcessColor } from '../../utils/colors'
import type { QueueLevelSnapshot } from '../../engine/scheduling/types'

function pidLabel(p: { pid: number; tid?: number }) {
  return p.tid != null ? `P${p.pid}-H${p.tid}` : `P${p.pid}`
}

export default function MultilevelQueueView() {
  const { result, currentStep } = useSchedulingStore()

  const currentTime = useMemo(() => {
    const tl = result?.timeline ?? []
    if (tl.length === 0) return 0
    return currentStep < tl.length
      ? tl[currentStep].start
      : tl[tl.length - 1].end
  }, [result, currentStep])

  const snapshot = useMemo(() => {
    const snaps = result?.queueSnapshots ?? []
    if (snaps.length === 0) return null
    let chosen = snaps[0]
    for (const s of snaps) {
      if (s.time <= currentTime) chosen = s
      else break
    }
    return chosen
  }, [result, currentTime])

  if (!result?.queueSnapshots || result.queueSnapshots.length === 0) return null
  const queues: QueueLevelSnapshot[] = snapshot?.queues ?? []

  return (
    <div className="surface-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[color:var(--text)]">
          <Layers size={16} className="text-[color:var(--accent)]" />
          Colas multinivel
        </h2>
        <span className="font-mono text-[11px] tabular-nums text-[color:var(--text-faint)]">
          tiempo {currentTime}
        </span>
      </div>

      <p className="mb-3 text-[12px] leading-relaxed text-[color:var(--text-muted)]">
        Cada cola atiende a procesos con un nivel de prioridad distinto. Las
        colas superiores se atienden primero. Los chips muestran qué procesos
        están esperando en cada nivel en el tick actual.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {queues.map((queue) => (
          <div
            key={queue.level}
            className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                {queue.label}
              </span>
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-[color:var(--text-faint)]">
                {queue.pids.length}
              </span>
            </div>
            <div className="flex min-h-[36px] flex-wrap gap-1.5">
              <AnimatePresence mode="popLayout">
                {queue.pids.length === 0 ? (
                  <motion.span
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[12px] text-[color:var(--text-faint)]"
                  >
                    Vacía
                  </motion.span>
                ) : (
                  queue.pids.map((p) => (
                    <motion.span
                      key={pidLabel(p)}
                      layout
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 360,
                        damping: 22,
                      }}
                      style={{ backgroundColor: getProcessColor(p.pid) }}
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
                    >
                      {pidLabel(p)}
                    </motion.span>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
