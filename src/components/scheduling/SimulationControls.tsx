import { useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipForward, SkipBack, Gauge } from 'lucide-react'
import { useSchedulingStore } from '../../store/schedulingStore'

interface Props {
  variant?: 'card' | 'bar'
}

export default function SimulationControls({ variant = 'card' }: Props) {
  const { result, currentStep, isPlaying, speed, setCurrentStep, setIsPlaying, setSpeed } =
    useSchedulingStore()

  const timeline = result?.timeline ?? []
  const maxStep = Math.max(0, timeline.length - 1)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    clearTimer()

    if (!isPlaying || timeline.length === 0) return

    intervalRef.current = setInterval(() => {
      useSchedulingStore.setState((state) => {
        const next = state.currentStep + 1
        if (next > maxStep) {
          return { isPlaying: false, currentStep: maxStep }
        }
        return { currentStep: next }
      })
    }, 1000 / speed)

    return clearTimer
  }, [isPlaying, speed, maxStep, timeline.length, clearTimer])

  useEffect(() => {
    if (currentStep >= maxStep && isPlaying) {
      setIsPlaying(false)
    }
  }, [currentStep, maxStep, isPlaying, setIsPlaying])

  const togglePlay = () => {
    if (currentStep >= maxStep) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const stepForward = () => {
    if (currentStep < maxStep) setCurrentStep(currentStep + 1)
  }

  const stepBackward = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const currentTime =
    timeline.length > 0 && currentStep < timeline.length ? timeline[currentStep].start : 0

  const containerClass =
    variant === 'card'
      ? 'flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4'
      : 'flex items-center justify-between gap-3 px-3 py-2'

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={stepBackward}
          disabled={currentStep <= 0}
          className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-300 transition active:bg-gray-700 disabled:opacity-30 sm:h-11 sm:w-11"
          title="Paso anterior"
          aria-label="Paso anterior"
        >
          <SkipBack size={20} />
        </button>
        <button
          onClick={togglePlay}
          className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white transition active:scale-95 sm:h-11 sm:w-11"
          title={isPlaying ? 'Pausar' : 'Reproducir'}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={stepForward}
          disabled={currentStep >= maxStep}
          className="flex h-12 w-12 items-center justify-center rounded-lg text-gray-300 transition active:bg-gray-700 disabled:opacity-30 sm:h-11 sm:w-11"
          title="Paso siguiente"
          aria-label="Paso siguiente"
        >
          <SkipForward size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400 sm:text-sm">
        <Gauge size={14} />
        <input
          type="range"
          min={0.5}
          max={4}
          step={0.5}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="h-2 w-24 cursor-pointer accent-indigo-500 sm:w-28"
          aria-label="Velocidad de reproducción"
        />
        <span className="w-9 text-gray-300">{speed}x</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400 sm:ml-auto sm:text-sm">
        <span>
          T: <span className="font-mono font-semibold text-gray-100">{currentTime}</span>
        </span>
        <span className="text-gray-600">|</span>
        <span>
          <span className="font-mono font-semibold text-gray-100">{currentStep + 1}</span>
          <span className="text-gray-500"> / {timeline.length}</span>
        </span>
      </div>
    </div>
  )
}
