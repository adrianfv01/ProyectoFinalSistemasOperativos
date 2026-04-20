import { useMemoryStore } from '../../store/memoryStore'
import { getProcessColor } from '../../utils/colors'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReplacementVisualization() {
  const { replacementSteps, currentStep } = useMemoryStore()

  if (replacementSteps.length === 0) return null

  const step = replacementSteps[currentStep]
  if (!step) return null

  return (
    <div className="surface-card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] tabular-nums text-[color:var(--text-muted)]">
          Paso{' '}
          <span className="font-semibold text-[color:var(--text)]">
            {currentStep + 1}
          </span>
          <span className="text-[color:var(--text-faint)]"> / {replacementSteps.length}</span>
        </span>
        <span className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-2 py-1 font-mono text-[12px] tabular-nums text-[color:var(--text)]">
          P{step.pid} → Pg{step.requestedPage}
        </span>
        {step.isPageFault ? (
          <span className="rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-rose-300">
            Fallo
          </span>
        ) : (
          <span className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
            Acierto
          </span>
        )}
        {step.evictedPage !== undefined && step.evictedPid !== undefined && (
          <span className="rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 font-mono text-[12px] font-semibold tabular-nums text-amber-300">
            Sale P{step.evictedPid} Pg{step.evictedPage}
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
                className={`relative flex flex-col items-center justify-center rounded-lg border p-2 text-xs transition ${
                  isLoaded
                    ? 'border-emerald-300/60 ring-2 ring-emerald-300/30'
                    : 'border-[color:var(--border-strong)]'
                }`}
                style={{
                  backgroundColor: isEmpty
                    ? 'var(--surface-2)'
                    : `${bgColor}22`,
                }}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
                  M{frame.frameNumber}
                </span>
                {isEmpty ? (
                  <span className="font-mono text-[12px] text-[color:var(--text-faint)]">—</span>
                ) : (
                  <span
                    className="font-mono text-[12px] font-semibold tabular-nums"
                    style={{ color: bgColor }}
                  >
                    P{frame.pid} Pg{frame.pageNumber}
                  </span>
                )}
                {step.referenceBits && step.referenceBits[i] !== undefined && (
                  <span
                    className={`mt-0.5 font-mono text-[10px] tabular-nums ${
                      step.referenceBits[i]
                        ? 'text-emerald-300'
                        : 'text-[color:var(--text-faint)]'
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
