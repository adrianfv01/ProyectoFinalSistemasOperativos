import { useRef, useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useIsMobile } from '../../utils/useIsMobile'
import { useChartTheme } from '../../utils/chartTheme'

export interface SchedulingComparisonEntry {
  algorithm: string
  label: string
  avgTurnaroundTime: number
  avgWaitingTime: number
  cpuUtilization: number
}

export interface ReplacementComparisonEntry {
  algorithm: string
  label: string
  pageFaults: number
}

interface ComparisonChartProps {
  schedulingResults: SchedulingComparisonEntry[]
  replacementResults: ReplacementComparisonEntry[]
}

function ChartCard({
  title,
  children,
  carousel,
}: {
  title: string
  children: React.ReactNode
  carousel?: boolean
}) {
  const baseClass = carousel
    ? 'surface-card min-w-[88%] shrink-0 snap-start p-4 sm:min-w-[60%]'
    : 'surface-card p-4'
  return (
    <div className={baseClass}>
      <h3 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        {title}
      </h3>
      <div className="h-64 sm:h-72">{children}</div>
    </div>
  )
}

export default function ComparisonChart({
  schedulingResults,
  replacementResults,
}: ComparisonChartProps) {
  const hasScheduling = schedulingResults.length > 0
  const hasReplacement = replacementResults.length > 0
  const isMobile = useIsMobile()
  const theme = useChartTheme()
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    let n = 0
    if (hasScheduling) n += 3
    if (hasReplacement) n += 1
    setCount(n)
    setActiveIdx(0)
  }, [hasScheduling, hasReplacement])

  useEffect(() => {
    const el = carouselRef.current
    if (!el || !isMobile) return
    function onScroll() {
      if (!el) return
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setActiveIdx(idx)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [isMobile, count])

  if (!hasScheduling && !hasReplacement) return null

  const charts: React.ReactNode[] = []

  const labelStyle = { fill: theme.textFaint, fontSize: 11, fontFamily: theme.axis.fontFamily }

  if (hasScheduling) {
    charts.push(
      <ChartCard key="tat" title="Tiempo de retorno promedio" carousel={isMobile}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={schedulingResults} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
            <XAxis dataKey="label" tick={theme.axis} tickLine={false} axisLine={{ stroke: theme.border }} />
            <YAxis tick={theme.axis} tickLine={false} axisLine={{ stroke: theme.border }} unit=" ut" />
            <Tooltip {...theme.tooltip} />
            <Bar
              dataKey="avgTurnaroundTime"
              name="Retorno promedio"
              radius={[6, 6, 0, 0]}
              label={{ position: 'top', ...labelStyle }}
            >
              {schedulingResults.map((_, i) => (
                <Cell key={i} fill={theme.palette[i % theme.palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>,
    )

    charts.push(
      <ChartCard key="wt" title="Tiempo de espera promedio" carousel={isMobile}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={schedulingResults} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
            <XAxis dataKey="label" tick={theme.axis} tickLine={false} axisLine={{ stroke: theme.border }} />
            <YAxis tick={theme.axis} tickLine={false} axisLine={{ stroke: theme.border }} unit=" ut" />
            <Tooltip {...theme.tooltip} />
            <Bar
              dataKey="avgWaitingTime"
              name="Espera promedio"
              radius={[6, 6, 0, 0]}
              label={{ position: 'top', ...labelStyle }}
            >
              {schedulingResults.map((_, i) => (
                <Cell key={i} fill={theme.palette[i % theme.palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>,
    )

    charts.push(
      <ChartCard key="cpu" title="Uso de CPU (%)" carousel={isMobile}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={schedulingResults} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
            <XAxis dataKey="label" tick={theme.axis} tickLine={false} axisLine={{ stroke: theme.border }} />
            <YAxis tick={theme.axis} tickLine={false} axisLine={{ stroke: theme.border }} unit="%" domain={[0, 100]} />
            <Tooltip {...theme.tooltip} />
            <Bar
              dataKey="cpuUtilization"
              name="Uso de CPU"
              radius={[6, 6, 0, 0]}
              label={{ position: 'top', ...labelStyle }}
            >
              {schedulingResults.map((_, i) => (
                <Cell key={i} fill={theme.palette[i % theme.palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>,
    )
  }

  if (hasReplacement) {
    charts.push(
      <ChartCard key="pf" title="Fallos de página" carousel={isMobile}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={replacementResults} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
            <XAxis dataKey="label" tick={theme.axis} tickLine={false} axisLine={{ stroke: theme.border }} />
            <YAxis tick={theme.axis} tickLine={false} axisLine={{ stroke: theme.border }} allowDecimals={false} />
            <Tooltip {...theme.tooltip} />
            <Bar
              dataKey="pageFaults"
              name="Fallos de página"
              radius={[6, 6, 0, 0]}
              label={{ position: 'top', ...labelStyle }}
            >
              {replacementResults.map((_, i) => (
                <Cell key={i} fill={theme.palette[i % theme.palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>,
    )
  }

  if (isMobile) {
    return (
      <div>
        <div
          ref={carouselRef}
          className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
          data-no-swipe
        >
          {charts}
        </div>
        {count > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {Array.from({ length: count }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIdx
                    ? 'w-5 bg-[color:var(--accent)]'
                    : 'w-1.5 bg-[color:var(--border-strong)]'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return <div className="grid gap-6 lg:grid-cols-2">{charts}</div>
}
