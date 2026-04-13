import { useEffect, useCallback } from 'react'
import { useMemoryStore } from '../../store/memoryStore'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
} from 'lucide-react'

export default function ReplacementControls() {
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

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={stepBackward}
            disabled={currentStep === 0}
            className="rounded-lg border border-gray-600 p-2.5 text-gray-300 transition hover:bg-gray-700 disabled:opacity-40"
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-lg bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-500"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            onClick={stepForward}
            disabled={currentStep >= total - 1}
            className="rounded-lg border border-gray-600 p-2.5 text-gray-300 transition hover:bg-gray-700 disabled:opacity-40"
          >
            <SkipForward size={16} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2">
          <label className="text-sm text-gray-400">Velocidad</label>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.5}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="h-2 w-28 cursor-pointer accent-indigo-500"
          />
          <span className="w-10 text-sm text-gray-300">{speed}x</span>
        </div>

        <div className="flex items-center justify-center gap-3 text-sm sm:ml-auto">
          <span className="text-red-400">
            Fallos: {faults}
          </span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-300">
            Total: {total}
          </span>
        </div>
      </div>
    </div>
  )
}
