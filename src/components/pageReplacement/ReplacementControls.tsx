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

  const containerClass = variant === 'card' ? 'surface-card p-4' : 'px-3 py-2'
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
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-3)] hover:text-[color:var(--text)] disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
            aria-label="Paso anterior"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white to-[#E7E2FF] text-[#0A0A0A] shadow-[0_4px_12px_rgba(199,189,255,0.35)] transition active:scale-95 sm:h-11 sm:w-11"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            onClick={stepForward}
            disabled={currentStep >= total - 1}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-3)] hover:text-[color:var(--text)] disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
            aria-label="Paso siguiente"
          >
            <SkipForward size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-[color:var(--text-muted)]">
          <label className="hidden font-mono uppercase tracking-[0.16em] text-[color:var(--text-faint)] sm:inline">
            Velocidad
          </label>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.5}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="h-2 w-24 cursor-pointer sm:w-28"
            aria-label="Velocidad"
          />
          <span className="w-10 font-mono tabular-nums text-[color:var(--text)]">{speed}x</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[12px] tabular-nums sm:ml-auto">
          <span className="rounded-md border border-rose-300/30 bg-rose-300/5 px-2 py-1 text-rose-300">
            Fallos {faults}
          </span>
          <span className="text-[color:var(--border-strong)]">/</span>
          <span className="text-[color:var(--text-muted)]">Total {total}</span>
        </div>
      </div>
    </div>
  )
}
