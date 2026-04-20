import { useRef, useEffect } from 'react'
import { useMemoryStore } from '../../store/memoryStore'

export default function ReplacementTimeline() {
  const { replacementSteps, currentStep, setCurrentStep } = useMemoryStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [currentStep])

  if (replacementSteps.length === 0) return null

  return (
    <div className="surface-card p-4">
      <h3 className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        Línea de tiempo
      </h3>
      <div
        ref={containerRef}
        className="flex gap-1 overflow-x-auto pb-2"
        data-no-swipe
      >
        {replacementSteps.map((step, i) => {
          const isCurrent = i === currentStep
          const isFault = step.isPageFault

          return (
            <button
              key={i}
              ref={isCurrent ? activeRef : undefined}
              onClick={() => setCurrentStep(i)}
              className={`flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-md font-mono text-[10px] font-medium tabular-nums transition sm:h-10 sm:w-10 ${
                isCurrent
                  ? 'ring-2 ring-[color:var(--accent)] ring-offset-1 ring-offset-[color:var(--surface)]'
                  : ''
              } ${
                isFault
                  ? 'border border-rose-300/30 bg-rose-300/10 text-rose-300'
                  : 'border border-emerald-300/30 bg-emerald-300/10 text-emerald-300'
              }`}
            >
              <span>{i + 1}</span>
              <span className="text-[8px] uppercase tracking-[0.12em]">
                {isFault ? 'F' : 'OK'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
