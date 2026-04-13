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
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-400">CPU</h2>

      <div className="flex items-center justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-gray-600 bg-gray-900">
          <Cpu size={28} className="absolute text-gray-600" />
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div
                key={`${current.pid}-${current.start}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ backgroundColor: getProcessColor(current.pid) }}
                className="z-10 rounded-lg px-3 py-2 text-sm font-bold text-white"
              >
                {sliceLabel(current)}
              </motion.div>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="z-10 text-sm text-gray-500"
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
