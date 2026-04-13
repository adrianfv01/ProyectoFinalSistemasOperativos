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
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <h3 className="mb-2 text-sm font-medium text-gray-400">
        Línea de tiempo
      </h3>
      <div
        ref={containerRef}
        className="flex gap-1 overflow-x-auto pb-2"
      >
        {replacementSteps.map((step, i) => {
          const isCurrent = i === currentStep
          const isFault = step.isPageFault

          return (
            <button
              key={i}
              ref={isCurrent ? activeRef : undefined}
              onClick={() => setCurrentStep(i)}
              className={`flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-md text-[10px] font-medium transition sm:h-10 sm:w-10 ${
                isCurrent
                  ? 'ring-2 ring-indigo-400'
                  : ''
              } ${
                isFault
                  ? 'bg-red-600/30 text-red-300'
                  : 'bg-green-600/30 text-green-300'
              }`}
            >
              <span>{i + 1}</span>
              <span className="text-[8px]">
                {isFault ? 'F' : 'OK'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
