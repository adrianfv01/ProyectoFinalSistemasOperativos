import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Pause, Play, RotateCcw } from 'lucide-react'
import type { TimeSlice } from '../../engine/scheduling/types'
import { getProcessColor, getProcessColorWithAlpha } from '../../utils/colors'

interface MiniGanttProps {
  timeline: TimeSlice[]
  autoPlay?: boolean
  onComplete?: () => void
}

const CELL = 32

export default function MiniGantt({
  timeline,
  autoPlay = true,
  onComplete,
}: MiniGanttProps) {
  const maxTime = timeline.length > 0 ? timeline[timeline.length - 1].end : 0
  const [tick, setTick] = useState(0)
  const [playing, setPlaying] = useState(autoPlay)
  const intervalRef = useRef<number | null>(null)

  const ticks = useMemo(() => {
    const t: number[] = []
    for (let i = 0; i <= maxTime; i++) t.push(i)
    return t
  }, [maxTime])

  useEffect(() => {
    setTick(0)
    setPlaying(autoPlay)
  }, [timeline, autoPlay])

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = window.setInterval(() => {
      setTick((t) => {
        if (t >= maxTime) {
          setPlaying(false)
          onComplete?.()
          return maxTime
        }
        return t + 1
      })
    }, 450)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [playing, maxTime, onComplete])

  if (timeline.length === 0) return null

  const reset = () => {
    setTick(0)
    setPlaying(true)
  }

  return (
    <div className="surface-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
          Línea de tiempo de la CPU
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#E7E2FF] text-[#0A0A0A] shadow-[0_4px_12px_rgba(199,189,255,0.35)] transition active:scale-95"
            aria-label={playing ? 'Pausar' : 'Reproducir'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-3)] hover:text-[color:var(--text)]"
            aria-label="Reiniciar"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div style={{ width: maxTime * CELL + 8, minWidth: '100%' }} className="relative">
          <div className="relative" style={{ height: 36 }}>
            {timeline.map((slice) => {
              const visible = slice.start < tick
              const partial =
                tick > slice.start && tick < slice.end
                  ? (tick - slice.start) / (slice.end - slice.start)
                  : visible
                  ? 1
                  : 0
              const fullW = (slice.end - slice.start) * CELL
              return (
                <motion.div
                  key={`${slice.pid}-${slice.start}`}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: visible ? 1 : 0.25,
                    width: fullW * Math.max(partial, visible ? 1 : 0.05),
                  }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{
                    height: 30,
                    left: slice.start * CELL,
                    backgroundColor: visible
                      ? getProcessColor(slice.pid)
                      : getProcessColorWithAlpha(slice.pid, 0.25),
                  }}
                  className="absolute top-1 flex items-center justify-center overflow-hidden rounded-md font-mono text-[11px] font-bold tabular-nums text-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
                >
                  {fullW >= 28 && `P${slice.pid}`}
                </motion.div>
              )
            })}
          </div>

          <div className="mt-1 flex border-t border-[color:var(--border)]">
            {ticks.map((t) => (
              <div
                key={t}
                style={{ width: CELL }}
                className={`flex-shrink-0 pt-1 text-center font-mono text-[10px] tabular-nums ${
                  t === tick
                    ? 'font-bold text-[color:var(--accent)]'
                    : 'text-[color:var(--text-faint)]'
                }`}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
