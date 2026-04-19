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

const PALETTE = [
  '#6366f1', '#f43f5e', '#10b981', '#f59e0b',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

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

const axisStyle = { fill: '#d1d5db', fontSize: 12 }
const gridStroke = '#374151'
const tooltipStyle = {
  contentStyle: { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 },
  labelStyle: { color: '#e5e7eb' },
  itemStyle: { color: '#e5e7eb' },
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
    ? 'min-w-[88%] shrink-0 snap-start rounded-xl border border-gray-700 bg-gray-800/60 p-4 sm:min-w-[60%]'
    : 'rounded-xl border border-gray-700 bg-gray-800/60 p-4'
  return (
    <div className={baseClass}>
      <h3 className="mb-3 text-sm font-semibold text-gray-200">{title}</h3>
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

  if (hasScheduling) {
    charts.push(
      <ChartCard key="tat" title="Tiempo de retorno promedio" carousel={isMobile}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={schedulingResults} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="label" tick={axisStyle} />
            <YAxis tick={axisStyle} unit=" ut" />
            <Tooltip {...tooltipStyle} />
            <Bar
              dataKey="avgTurnaroundTime"
              name="Retorno promedio"
              radius={[4, 4, 0, 0]}
              label={{ position: 'top', fill: '#9ca3af', fontSize: 11 }}
            >
              {schedulingResults.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
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
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="label" tick={axisStyle} />
            <YAxis tick={axisStyle} unit=" ut" />
            <Tooltip {...tooltipStyle} />
            <Bar
              dataKey="avgWaitingTime"
              name="Espera promedio"
              radius={[4, 4, 0, 0]}
              label={{ position: 'top', fill: '#9ca3af', fontSize: 11 }}
            >
              {schedulingResults.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
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
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="label" tick={axisStyle} />
            <YAxis tick={axisStyle} unit="%" domain={[0, 100]} />
            <Tooltip {...tooltipStyle} />
            <Bar
              dataKey="cpuUtilization"
              name="Uso de CPU"
              radius={[4, 4, 0, 0]}
              label={{ position: 'top', fill: '#9ca3af', fontSize: 11 }}
            >
              {schedulingResults.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
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
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="label" tick={axisStyle} />
            <YAxis tick={axisStyle} allowDecimals={false} />
            <Tooltip {...tooltipStyle} />
            <Bar
              dataKey="pageFaults"
              name="Fallos de página"
              radius={[4, 4, 0, 0]}
              label={{ position: 'top', fill: '#9ca3af', fontSize: 11 }}
            >
              {replacementResults.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
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
                  i === activeIdx ? 'w-5 bg-indigo-400' : 'w-1.5 bg-gray-600'
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
