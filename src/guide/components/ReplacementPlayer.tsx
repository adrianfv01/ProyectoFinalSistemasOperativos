import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, RotateCcw, SkipForward, X, Check } from 'lucide-react'
import type { ReplacementStep } from '../../engine/memory/types'
import { initializeFrames } from '../../engine/memory'
import { getProcessColor } from '../../utils/colors'
import MiniMemoryGrid from './MiniMemoryGrid'
import MiniTimeline from './MiniTimeline'

interface ReplacementPlayerProps {
  steps: ReplacementStep[]
  numFrames: number
}

export default function ReplacementPlayer({ steps, numFrames }: ReplacementPlayerProps) {
  const [cursor, setCursor] = useState(-1)
  const [playing, setPlaying] = useState(true)
  const intervalRef = useRef<number | null>(null)

  const totalSteps = steps.length

  useEffect(() => {
    setCursor(-1)
    setPlaying(true)
  }, [steps])

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = window.setInterval(() => {
      setCursor((c) => {
        if (c >= totalSteps - 1) {
          setPlaying(false)
          return totalSteps - 1
        }
        return c + 1
      })
    }, 700)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [playing, totalSteps])

  const currentStep = cursor >= 0 ? steps[cursor] : null
  const frames = currentStep?.frameState ?? initializeFrames(numFrames)

  const stats = useMemo(() => {
    const visible = steps.slice(0, Math.max(cursor + 1, 0))
    const faults = visible.filter((s) => s.isPageFault).length
    const hits = visible.length - faults
    return { faults, hits, total: visible.length }
  }, [steps, cursor])

  const reset = () => {
    setCursor(-1)
    setPlaying(true)
  }

  const next = () =>
    setCursor((c) => Math.min(totalSteps - 1, c + 1))

  return (
    <div className="space-y-3">
      <div className="surface-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            Paso{' '}
            <span className="text-[color:var(--text)]">
              {Math.max(cursor + 1, 0)}
            </span>
            <span className="text-[color:var(--text-faint)]"> / {totalSteps}</span>
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#E7E2FF] text-[#0A0A0A] shadow-[0_4px_12px_rgba(199,189,255,0.35)] transition active:scale-95"
              aria-label={playing ? 'Pausar' : 'Reproducir'}
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              type="button"
              onClick={next}
              disabled={cursor >= totalSteps - 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-3)] hover:text-[color:var(--text)] disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Siguiente paso"
            >
              <SkipForward size={14} />
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-3)] hover:text-[color:var(--text)]"
              aria-label="Reiniciar"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <div className="relative h-16 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3">
          <AnimatePresence mode="wait">
            {currentStep ? (
              <motion.div
                key={cursor}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold tabular-nums text-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
                  style={{ backgroundColor: getProcessColor(currentStep.pid) }}
                >
                  P{currentStep.pid}
                </span>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[color:var(--text)]">
                    Pide la página {currentStep.requestedPage}
                  </p>
                  <p
                    className={`flex items-center gap-1 text-[12px] ${
                      currentStep.isPageFault
                        ? 'text-rose-300'
                        : 'text-emerald-300'
                    }`}
                  >
                    {currentStep.isPageFault ? (
                      <>
                        <X size={12} strokeWidth={3} /> Fallo: hay que cargarla
                        {currentStep.evictedPage !== undefined &&
                          ` y sacar la página ${currentStep.evictedPage} de P${currentStep.evictedPid}`}
                      </>
                    ) : (
                      <>
                        <Check size={12} strokeWidth={3} /> Acierto: ya estaba en
                        memoria
                      </>
                    )}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[13px] text-[color:var(--text-muted)]"
              >
                Toca play o el botón siguiente para arrancar.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <MiniMemoryGrid
        frames={frames}
        highlightFrame={
          currentStep?.isPageFault && currentStep.loadedIntoFrame !== undefined
            ? currentStep.loadedIntoFrame
            : null
        }
      />

      <MiniTimeline steps={steps} cursor={cursor} />

      <div className="grid grid-cols-3 gap-2">
        <div className="surface-card p-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            Total
          </p>
          <p className="mt-1 font-mono text-[18px] font-bold tabular-nums text-[color:var(--text)]">
            {stats.total}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-300/30 bg-rose-300/5 p-3 text-center shadow-[var(--shadow-sm)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose-300">
            Fallos
          </p>
          <p className="mt-1 font-mono text-[18px] font-bold tabular-nums text-rose-300">
            {stats.faults}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/5 p-3 text-center shadow-[var(--shadow-sm)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300">
            Aciertos
          </p>
          <p className="mt-1 font-mono text-[18px] font-bold tabular-nums text-emerald-300">
            {stats.hits}
          </p>
        </div>
      </div>
    </div>
  )
}
