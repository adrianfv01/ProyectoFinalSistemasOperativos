import { useMemoryStore } from '../../store/memoryStore'
import { getProcessColor } from '../../utils/colors'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReplacementVisualization() {
  const { replacementSteps, currentStep } = useMemoryStore()

  if (replacementSteps.length === 0) return null

  const step = replacementSteps[currentStep]
  if (!step) return null

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-300">
          Paso {currentStep + 1} / {replacementSteps.length}
        </span>
        <span className="rounded bg-gray-700 px-2 py-1 text-sm text-gray-100">
          Solicitud: P{step.pid} Página {step.requestedPage}
        </span>
        {step.isPageFault && (
          <span className="rounded bg-red-600/20 px-2 py-1 text-sm font-semibold text-red-400">
            Fallo de página
          </span>
        )}
        {!step.isPageFault && (
          <span className="rounded bg-green-600/20 px-2 py-1 text-sm font-semibold text-green-400">
            Acierto
          </span>
        )}
        {step.evictedPage !== undefined && step.evictedPid !== undefined && (
          <span className="rounded bg-yellow-600/20 px-2 py-1 text-sm font-semibold text-yellow-400">
            Sale: P{step.evictedPid} Pg{step.evictedPage}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="memory-grid grid gap-2"
        >
          {step.frameState.map((frame, i) => {
            const isLoaded = step.loadedIntoFrame === frame.frameNumber
            const isEmpty = frame.pid === null
            const bgColor = isEmpty
              ? undefined
              : getProcessColor(frame.pid!)

            return (
              <motion.div
                key={frame.frameNumber}
                initial={isLoaded ? { scale: 0.85 } : undefined}
                animate={isLoaded ? { scale: 1 } : undefined}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`relative flex flex-col items-center justify-center rounded-lg border p-2 text-xs ${
                  isLoaded
                    ? 'border-green-400 ring-2 ring-green-400/50'
                    : 'border-gray-600'
                }`}
                style={{
                  backgroundColor: isEmpty
                    ? 'rgb(31 41 55)'
                    : `${bgColor}22`,
                }}
              >
                <span className="text-[10px] text-gray-500">
                  M{frame.frameNumber}
                </span>
                {isEmpty ? (
                  <span className="text-gray-600">—</span>
                ) : (
                  <span
                    className="font-semibold"
                    style={{ color: bgColor }}
                  >
                    P{frame.pid} Pg{frame.pageNumber}
                  </span>
                )}
                {step.referenceBits && step.referenceBits[i] !== undefined && (
                  <span
                    className={`mt-0.5 text-[10px] ${
                      step.referenceBits[i]
                        ? 'text-green-400'
                        : 'text-gray-500'
                    }`}
                  >
                    R={step.referenceBits[i] ? '1' : '0'}
                  </span>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
