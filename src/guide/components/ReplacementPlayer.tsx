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
      <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Paso {Math.max(cursor + 1, 0)} / {totalSteps}
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white transition active:scale-95"
              aria-label={playing ? 'Pausar' : 'Reproducir'}
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              type="button"
              onClick={next}
              disabled={cursor >= totalSteps - 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-gray-300 transition active:scale-95 disabled:opacity-30"
              aria-label="Siguiente paso"
            >
              <SkipForward size={14} />
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-gray-300 transition active:scale-95"
              aria-label="Reiniciar"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <div className="relative h-16 overflow-hidden rounded-lg border border-gray-800 bg-gray-950/60 p-3">
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
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                  style={{ backgroundColor: getProcessColor(currentStep.pid) }}
                >
                  P{currentStep.pid}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-100">
                    Pide la página {currentStep.requestedPage}
                  </p>
                  <p
                    className={`flex items-center gap-1 text-xs ${
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
                className="text-sm text-gray-400"
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
        <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Total
          </p>
          <p className="text-lg font-bold text-gray-100">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-rose-300">
            Fallos
          </p>
          <p className="text-lg font-bold text-rose-300">{stats.faults}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-emerald-300">
            Aciertos
          </p>
          <p className="text-lg font-bold text-emerald-300">{stats.hits}</p>
        </div>
      </div>
    </div>
  )
}
