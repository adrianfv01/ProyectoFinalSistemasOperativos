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
    <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Línea de tiempo de la CPU
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white transition active:scale-95"
            aria-label={playing ? 'Pausar' : 'Reproducir'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 text-gray-300 transition active:scale-95"
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
                  className="absolute top-1 flex items-center justify-center overflow-hidden rounded-md text-[11px] font-bold text-white"
                >
                  {fullW >= 28 && `P${slice.pid}`}
                </motion.div>
              )
            })}
          </div>

          <div className="mt-1 flex border-t border-gray-700">
            {ticks.map((t) => (
              <div
                key={t}
                style={{ width: CELL }}
                className={`flex-shrink-0 pt-1 text-center text-[10px] tabular-nums ${
                  t === tick ? 'font-bold text-indigo-300' : 'text-gray-500'
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
