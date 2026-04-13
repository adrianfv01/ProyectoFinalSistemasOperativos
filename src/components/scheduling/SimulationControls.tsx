import { useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipForward, SkipBack, Gauge } from 'lucide-react'
import { useSchedulingStore } from '../../store/schedulingStore'

export default function SimulationControls() {
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

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={stepBackward}
          disabled={currentStep <= 0}
          className="rounded-lg p-2.5 text-gray-300 transition hover:bg-gray-700 disabled:opacity-30"
          title="Paso anterior"
        >
          <SkipBack size={18} />
        </button>
        <button
          onClick={togglePlay}
          className="rounded-lg bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-500"
          title={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          onClick={stepForward}
          disabled={currentStep >= maxStep}
          className="rounded-lg p-2.5 text-gray-300 transition hover:bg-gray-700 disabled:opacity-30"
          title="Paso siguiente"
        >
          <SkipForward size={18} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <Gauge size={14} />
        <input
          type="range"
          min={0.5}
          max={4}
          step={0.5}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="h-2 w-28 cursor-pointer accent-indigo-500 sm:w-24"
        />
        <span className="w-10 text-gray-300">{speed}x</span>
      </div>

      <div className="flex items-center justify-center gap-1 text-sm text-gray-400 sm:ml-auto">
        <span>
          T: <span className="font-mono font-semibold text-gray-100">{currentTime}</span>
        </span>
        <span className="text-gray-600">|</span>
        <span>
          Paso: <span className="font-mono font-semibold text-gray-100">{currentStep + 1}</span>
          <span className="text-gray-500"> / {timeline.length}</span>
        </span>
      </div>
    </div>
  )
}
