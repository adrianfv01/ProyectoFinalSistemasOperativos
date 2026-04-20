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
      ? 'surface-card flex flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4'
      : 'flex items-center justify-between gap-3 px-3 py-2'

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={stepBackward}
          disabled={currentStep <= 0}
          className="flex h-12 w-12 items-center justify-center rounded-xl text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)] active:bg-[color:var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-30 sm:h-11 sm:w-11"
          title="Paso anterior"
          aria-label="Paso anterior"
        >
          <SkipBack size={20} />
        </button>
        <button
          onClick={togglePlay}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white to-[#E7E2FF] text-[#0A0A0A] shadow-[0_4px_12px_rgba(199,189,255,0.35)] transition active:scale-95 sm:h-11 sm:w-11"
          title={isPlaying ? 'Pausar' : 'Reproducir'}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={stepForward}
          disabled={currentStep >= maxStep}
          className="flex h-12 w-12 items-center justify-center rounded-xl text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)] active:bg-[color:var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-30 sm:h-11 sm:w-11"
          title="Paso siguiente"
          aria-label="Paso siguiente"
        >
          <SkipForward size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-[12px] text-[color:var(--text-muted)]">
        <Gauge size={14} className="text-[color:var(--accent)]" />
        <input
          type="range"
          min={0.5}
          max={4}
          step={0.5}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="h-2 w-24 cursor-pointer sm:w-28"
          aria-label="Velocidad de reproducción"
        />
        <span className="w-10 font-mono tabular-nums text-[color:var(--text)]">{speed}x</span>
      </div>

      <div className="flex items-center gap-3 text-[12px] text-[color:var(--text-muted)] sm:ml-auto">
        <span className="font-mono uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
          T <span className="ml-1 font-mono font-semibold tabular-nums text-[color:var(--text)]">{currentTime}</span>
        </span>
        <span className="text-[color:var(--border-strong)]">/</span>
        <span className="font-mono tabular-nums">
          <span className="font-semibold text-[color:var(--text)]">{currentStep + 1}</span>
          <span className="text-[color:var(--text-faint)]"> / {timeline.length}</span>
        </span>
      </div>
    </div>
  )
}
