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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-200">{title}</h3>
      <div className="h-72">{children}</div>
    </div>
  )
}

export default function ComparisonChart({
  schedulingResults,
  replacementResults,
}: ComparisonChartProps) {
  const hasScheduling = schedulingResults.length > 0
  const hasReplacement = replacementResults.length > 0

  if (!hasScheduling && !hasReplacement) return null

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {hasScheduling && (
        <>
          <ChartCard title="Tiempo de retorno promedio">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={schedulingResults}
                margin={{ top: 20, right: 20, bottom: 5, left: 10 }}
              >
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
          </ChartCard>

          <ChartCard title="Tiempo de espera promedio">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={schedulingResults}
                margin={{ top: 20, right: 20, bottom: 5, left: 10 }}
              >
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
          </ChartCard>

          <ChartCard title="Uso de CPU (%)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={schedulingResults}
                margin={{ top: 20, right: 20, bottom: 5, left: 10 }}
              >
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
          </ChartCard>
        </>
      )}

      {hasReplacement && (
        <ChartCard title="Fallos de página">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={replacementResults}
              margin={{ top: 20, right: 20, bottom: 5, left: 10 }}
            >
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
        </ChartCard>
      )}
    </div>
  )
}
