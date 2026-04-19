import { useEffect, useCallback } from 'react'
import { useMemoryStore } from '../../store/memoryStore'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
} from 'lucide-react'

interface Props {
  variant?: 'card' | 'bar'
}

export default function ReplacementControls({ variant = 'card' }: Props) {
  const {
    replacementSteps,
    currentStep,
    isPlaying,
    speed,
    setCurrentStep,
    setIsPlaying,
    setSpeed,
  } = useMemoryStore()

  const total = replacementSteps.length
  const faults = replacementSteps.filter((s) => s.isPageFault).length

  const stepForward = useCallback(() => {
    if (currentStep < total - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsPlaying(false)
    }
  }, [currentStep, total, setCurrentStep, setIsPlaying])

  const stepBackward = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }, [currentStep, setCurrentStep])

  useEffect(() => {
    if (!isPlaying || total === 0) return
    const ms = 800 / speed
    const timer = setInterval(() => {
      stepForward()
    }, ms)
    return () => clearInterval(timer)
  }, [isPlaying, speed, total, stepForward])

  if (total === 0) return null

  const containerClass =
    variant === 'card'
      ? 'rounded-xl border border-gray-700 bg-gray-800 p-4'
      : 'px-3 py-2'
  const innerClass =
    variant === 'card'
      ? 'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4'
      : 'flex items-center justify-between gap-3'

  return (
    <div className={containerClass}>
      <div className={innerClass}>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={stepBackward}
            disabled={currentStep === 0}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-600 text-gray-300 transition active:bg-gray-700 disabled:opacity-40 sm:h-11 sm:w-11"
            aria-label="Paso anterior"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white transition active:scale-95 sm:h-11 sm:w-11"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            onClick={stepForward}
            disabled={currentStep >= total - 1}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-600 text-gray-300 transition active:bg-gray-700 disabled:opacity-40 sm:h-11 sm:w-11"
            aria-label="Paso siguiente"
          >
            <SkipForward size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 sm:text-sm">
          <label className="hidden sm:inline">Velocidad</label>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.5}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="h-2 w-24 cursor-pointer accent-indigo-500 sm:w-28"
            aria-label="Velocidad"
          />
          <span className="w-9 text-gray-300">{speed}x</span>
        </div>

        <div className="flex items-center gap-2 text-xs sm:ml-auto sm:text-sm">
          <span className="text-red-400">Fallos: {faults}</span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-300">Total: {total}</span>
        </div>
      </div>
    </div>
  )
}
