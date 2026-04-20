import { useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSchedulingStore } from '../../store/schedulingStore'
import { getProcessColor, getProcessColorWithAlpha } from '../../utils/colors'
import { useIsMobile } from '../../utils/useIsMobile'
import type { TimeSlice } from '../../engine/scheduling/types'

const CELL_W_DESKTOP = 48
const CELL_W_MOBILE = 36
const BAR_H = 36

function sliceLabel(s: TimeSlice) {
  return s.tid != null ? `P${s.pid}-H${s.tid}` : `P${s.pid}`
}

export default function GanttChart() {
  const { result, currentStep, setCurrentStep } = useSchedulingStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const CELL_W = isMobile ? CELL_W_MOBILE : CELL_W_DESKTOP

  const timeline = result?.timeline ?? []
  const maxTime = timeline.length > 0 ? timeline[timeline.length - 1].end : 0
  const maxStep = Math.max(0, timeline.length - 1)

  const ticks = useMemo(() => {
    const t: number[] = []
    for (let i = 0; i <= maxTime; i++) t.push(i)
    return t
  }, [maxTime])

  useEffect(() => {
    if (!scrollRef.current || timeline.length === 0) return
    const target = currentStep < timeline.length ? currentStep : timeline.length - 1
    const x = timeline[target].start * CELL_W
    scrollRef.current.scrollTo({ left: Math.max(0, x - 200), behavior: 'smooth' })
  }, [currentStep, timeline, CELL_W])

  if (timeline.length === 0) return null

  return (
    <div className="surface-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold tracking-tight text-[color:var(--text)] sm:text-[16px]">
          Diagrama de Gantt
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-faint)] lg:hidden">
          Desliza →
        </span>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto pb-2"
        data-no-swipe
      >
        <div style={{ width: maxTime * CELL_W + 40, minWidth: '100%' }} className="relative">
          <div className="flex items-end" style={{ height: BAR_H + 8 }}>
            {timeline.map((slice, i) => {
              const width = (slice.end - slice.start) * CELL_W
              const isActive = i <= currentStep
              const isCurrent = i === currentStep

              return (
                <motion.div
                  key={`${slice.pid}-${slice.start}`}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{
                    scaleX: isActive ? 1 : 0.3,
                    opacity: isActive ? 1 : 0.25,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{
                    width,
                    height: BAR_H,
                    left: slice.start * CELL_W,
                    backgroundColor: isActive
                      ? getProcessColor(slice.pid)
                      : getProcessColorWithAlpha(slice.pid, 0.2),
                    transformOrigin: 'left',
                  }}
                  className={`absolute top-1 flex items-center justify-center rounded-md font-mono text-[11px] font-bold tabular-nums text-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] ${
                    isCurrent ? 'ring-2 ring-white/90 ring-offset-2 ring-offset-[color:var(--surface)]' : ''
                  }`}
                >
                  {width >= 32 && sliceLabel(slice)}
                </motion.div>
              )
            })}
          </div>

          <div className="mt-2 flex border-t border-[color:var(--border)]">
            {ticks.map((t) => (
              <div
                key={t}
                style={{ width: CELL_W }}
                className="flex-shrink-0 pt-1 text-center font-mono text-[11px] tabular-nums text-[color:var(--text-muted)]"
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isMobile && maxStep > 0 && (
        <div className="mt-3 flex items-center gap-3" data-no-swipe>
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-[color:var(--text-muted)]">
            {currentStep + 1}/{timeline.length}
          </span>
          <input
            type="range"
            min={0}
            max={maxStep}
            value={currentStep}
            onChange={(e) => setCurrentStep(parseInt(e.target.value, 10))}
            className="h-2 w-full cursor-pointer"
            aria-label="Avance del diagrama de Gantt"
          />
        </div>
      )}
    </div>
  )
}
