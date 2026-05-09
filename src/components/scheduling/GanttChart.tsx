import { useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSchedulingStore } from '../../store/schedulingStore'
import { getProcessColor, getProcessColorWithAlpha } from '../../utils/colors'
import { useIsMobile } from '../../utils/useIsMobile'
import type { TimeSlice } from '../../engine/scheduling/types'

const CELL_W_DESKTOP = 48
const CELL_W_MOBILE = 36
const BAR_H = 36
const ROW_GAP = 6
const LABEL_W = 56

function sliceLabel(s: TimeSlice) {
  return s.tid != null ? `P${s.pid}-H${s.tid}` : `P${s.pid}`
}

export default function GanttChart() {
  const { result, currentStep, setCurrentStep } = useSchedulingStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const CELL_W = isMobile ? CELL_W_MOBILE : CELL_W_DESKTOP

  const timeline = result?.timeline ?? []
  const numCores = result?.numCores ?? 1
  const perCore =
    result?.timelinePerCore && result.timelinePerCore.length > 0
      ? result.timelinePerCore
      : [timeline]

  const maxTime = useMemo(() => {
    let m = 0
    for (const row of perCore) {
      for (const s of row) {
        if (s.end > m) m = s.end
      }
    }
    return m
  }, [perCore])

  const maxStep = timeline.length
  const isFinished = timeline.length > 0 && currentStep >= timeline.length

  const ticks = useMemo(() => {
    const t: number[] = []
    for (let i = 0; i <= maxTime; i++) t.push(i)
    return t
  }, [maxTime])

  const currentTime =
    timeline.length === 0
      ? 0
      : currentStep < timeline.length
      ? timeline[currentStep].start
      : timeline[timeline.length - 1].end

  useEffect(() => {
    if (!scrollRef.current || timeline.length === 0) return
    const x = currentTime * CELL_W
    scrollRef.current.scrollTo({ left: Math.max(0, x - 200), behavior: 'smooth' })
  }, [currentTime, timeline.length, CELL_W])

  if (timeline.length === 0) return null

  const totalHeight = numCores * BAR_H + (numCores - 1) * ROW_GAP + 8
  const showLabels = numCores > 1
  const utilPerCore = result?.cpuUtilizationPerCore ?? []

  return (
    <div className="surface-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold tracking-tight text-[color:var(--text)] sm:text-[16px]">
          Diagrama de Gantt
          {numCores > 1 && (
            <span className="ml-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
              · {numCores} núcleos
            </span>
          )}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-faint)] lg:hidden">
          Desliza →
        </span>
      </div>

      <div ref={scrollRef} className="overflow-x-auto px-2 pb-2 pt-2" data-no-swipe>
        <div
          style={{
            width: maxTime * CELL_W + (showLabels ? LABEL_W : 0) + 40,
            minWidth: '100%',
          }}
          className="relative"
        >
          <div className="relative" style={{ height: totalHeight }}>
            {perCore.map((row, coreIdx) => {
              const rowTop = coreIdx * (BAR_H + ROW_GAP) + 4
              return (
                <div key={coreIdx}>
                  {showLabels && (
                    <div
                      className="absolute left-0 flex items-center font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]"
                      style={{
                        top: rowTop,
                        height: BAR_H,
                        width: LABEL_W,
                      }}
                    >
                      Core {coreIdx}
                    </div>
                  )}
                  <div
                    className="absolute rounded-md border border-dashed border-[color:var(--border)]/60"
                    style={{
                      top: rowTop,
                      left: showLabels ? LABEL_W : 0,
                      width: maxTime * CELL_W,
                      height: BAR_H,
                    }}
                  />
                  {row.map((slice) => {
                    const width = (slice.end - slice.start) * CELL_W
                    const isActive = slice.start <= currentTime
                    const isCurrent =
                      slice.start <= currentTime && currentTime < slice.end
                    return (
                      <motion.div
                        key={`${coreIdx}-${slice.pid}-${slice.tid ?? 'p'}-${slice.start}`}
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{
                          scaleX: isActive ? 1 : 0.3,
                          opacity: isActive ? 1 : 0.25,
                        }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{
                          width,
                          height: BAR_H,
                          left: (showLabels ? LABEL_W : 0) + slice.start * CELL_W,
                          top: rowTop,
                          backgroundColor: isActive
                            ? getProcessColor(slice.pid)
                            : getProcessColorWithAlpha(slice.pid, 0.2),
                          transformOrigin: 'left',
                        }}
                        className={`absolute flex items-center justify-center rounded-md font-mono text-[11px] font-bold tabular-nums text-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] ${
                          isCurrent ? 'ring-2 ring-white/90 ring-offset-2 ring-offset-[color:var(--surface)]' : ''
                        }`}
                      >
                        {width >= 32 && sliceLabel(slice)}
                      </motion.div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          <div
            className="mt-2 flex border-t border-[color:var(--border)]"
            style={{ marginLeft: showLabels ? LABEL_W : 0 }}
          >
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

      {numCores > 1 && utilPerCore.length > 0 && (
        <div className="mt-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3">
          <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            Utilización por núcleo
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {utilPerCore.map((u, i) => (
              <div
                key={i}
                className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-2"
                title={`Core ${i}: ocupado ${u.toFixed(1)}% del tiempo total`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
                  <span>Core {i}</span>
                  <span className="tabular-nums text-[color:var(--text)]">
                    {u.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--surface-2)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--accent)]"
                    style={{ width: `${Math.min(100, Math.max(0, u))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isMobile && maxStep > 0 && (
        <div className="mt-3 flex items-center gap-3" data-no-swipe>
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-[color:var(--text-muted)]">
            {isFinished ? 'Fin' : `${currentStep + 1}/${timeline.length}`}
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
