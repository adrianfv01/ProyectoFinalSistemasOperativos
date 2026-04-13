import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSchedulingStore } from '../../store/schedulingStore'
import { useProcessStore } from '../../store/processStore'
import { getProcessColor } from '../../utils/colors'

export default function ReadyQueue() {
  const { result, currentStep } = useSchedulingStore()
  const processes = useProcessStore((s) => s.processes)
  const timeline = result?.timeline ?? []

  const readyPids = useMemo(() => {
    if (timeline.length === 0) return []

    const current = currentStep < timeline.length ? timeline[currentStep] : timeline[timeline.length - 1]
    const time = current.start

    const arrived = processes
      .filter((p) => p.arrivalTime <= time)
      .map((p) => p.pid)

    const runningPid = current.pid

    const completedBefore = new Set<number>()
    for (const s of timeline) {
      if (s.end <= time) {
        const appearsLater = timeline.some((t) => t.pid === s.pid && t.start >= time)
        if (!appearsLater) completedBefore.add(s.pid)
      }
    }

    return arrived.filter((pid) => pid !== runningPid && !completedBefore.has(pid))
  }, [timeline, currentStep, processes])

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-400">Cola de listos</h2>
      <div className="flex min-h-[40px] flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {readyPids.length === 0 ? (
            <span className="text-sm text-gray-500">Sin procesos en espera</span>
          ) : (
            readyPids.map((pid) => (
              <motion.span
                key={pid}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ backgroundColor: getProcessColor(pid) }}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white"
              >
                P{pid}
              </motion.span>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
