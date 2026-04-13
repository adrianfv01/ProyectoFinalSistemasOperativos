import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Cpu,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  HardDrive,
  Layers,
  MemoryStick,
  Server,
} from 'lucide-react'
import { useSchedulingStore, ALGORITHM_LABELS } from '../store/schedulingStore'
import { useMemoryStore, REPLACEMENT_LABELS } from '../store/memoryStore'
import { useProcessStore } from '../store/processStore'
import { getProcessColor } from '../utils/colors'

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  accent: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-700 bg-gray-800/60 p-5"
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-100">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-800/30 py-12">
      <p className="text-gray-500">{message}</p>
    </div>
  )
}

export default function MetricsPage() {
  const { result, selectedAlgorithm } = useSchedulingStore()
  const {
    totalMemory,
    pageSize,
    frames,
    replacementSteps,
    selectedAlgorithm: replacementAlgo,
  } = useMemoryStore()
  const { processes } = useProcessStore()

  const pageFaults = useMemo(
    () => replacementSteps.filter((s) => s.isPageFault).length,
    [replacementSteps],
  )

  const hitRatio = useMemo(() => {
    if (replacementSteps.length === 0) return 0
    const hits = replacementSteps.length - pageFaults
    return (hits / replacementSteps.length) * 100
  }, [replacementSteps, pageFaults])

  const barData = useMemo(() => {
    if (replacementSteps.length === 0) return []
    return [
      { name: 'Fallos', value: pageFaults, color: '#f43f5e' },
      { name: 'Aciertos', value: replacementSteps.length - pageFaults, color: '#10b981' },
    ]
  }, [replacementSteps, pageFaults])

  const processMetricsMap = useMemo(() => {
    if (!result) return new Map<number, { turnaround: number; waiting: number }>()
    const map = new Map<number, { turnaround: number; waiting: number }>()
    for (const m of result.metrics) {
      if (!map.has(m.pid)) {
        map.set(m.pid, { turnaround: m.turnaroundTime, waiting: m.waitingTime })
      }
    }
    return map
  }, [result])

  return (
    <div className="space-y-6 sm:space-y-8">
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-gray-100"
      >
        Métricas
      </motion.h1>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Cpu}
          label="Uso de CPU"
          value={result ? `${result.cpuUtilization.toFixed(1)}%` : '—'}
          accent="bg-indigo-500/20 text-indigo-400"
        />
        <SummaryCard
          icon={RefreshCw}
          label="Cambios de contexto"
          value={result ? result.contextSwitches : '—'}
          accent="bg-sky-500/20 text-sky-400"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Total fallos de página"
          value={replacementSteps.length > 0 ? pageFaults : '—'}
          accent="bg-rose-500/20 text-rose-400"
        />
        <SummaryCard
          icon={CheckCircle}
          label="Tasa de aciertos"
          value={replacementSteps.length > 0 ? `${hitRatio.toFixed(1)}%` : '—'}
          accent="bg-emerald-500/20 text-emerald-400"
        />
      </div>

      {/* ── Scheduling metrics ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">
          Métricas de Planificación ({ALGORITHM_LABELS[selectedAlgorithm]})
        </h2>

        {!result ? (
          <EmptyState message="Ejecuta un algoritmo de planificación primero" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-800/60">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="px-4 py-3 font-medium">PID</th>
                  <th className="px-4 py-3 font-medium">Tiempo de Finalización</th>
                  <th className="px-4 py-3 font-medium">Tiempo de Retorno</th>
                  <th className="px-4 py-3 font-medium">Tiempo de Espera</th>
                  <th className="px-4 py-3 font-medium">Tiempo de Respuesta</th>
                </tr>
              </thead>
              <tbody>
                {result.metrics.map((m, i) => (
                  <tr
                    key={`${m.pid}-${m.tid ?? ''}-${i}`}
                    className="border-b border-gray-700/50 text-gray-300 transition-colors hover:bg-gray-700/30"
                  >
                    <td className="px-4 py-2.5 font-mono">
                      <span
                        className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: getProcessColor(m.pid) }}
                      />
                      {m.pid}
                      {m.tid !== undefined && (
                        <span className="ml-1 text-gray-500">T{m.tid}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono">{m.completionTime}</td>
                    <td className="px-4 py-2.5 font-mono">{m.turnaroundTime}</td>
                    <td className="px-4 py-2.5 font-mono">{m.waitingTime}</td>
                    <td className="px-4 py-2.5 font-mono">{m.responseTime}</td>
                  </tr>
                ))}
                <tr className="bg-indigo-500/10 font-semibold text-indigo-300">
                  <td className="px-4 py-2.5">Promedio</td>
                  <td className="px-4 py-2.5 font-mono">—</td>
                  <td className="px-4 py-2.5 font-mono">
                    {result.averages.avgTurnaroundTime.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {result.averages.avgWaitingTime.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {result.averages.avgResponseTime.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Memory metrics ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">
          Métricas de Memoria ({REPLACEMENT_LABELS[replacementAlgo]})
        </h2>

        {replacementSteps.length === 0 ? (
          <EmptyState message="Ejecuta un algoritmo de reemplazo primero" />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { icon: HardDrive, label: 'Memoria total', val: `${totalMemory} KB` },
                { icon: Layers, label: 'Tamaño de página', val: `${pageSize} KB` },
                { icon: Server, label: 'Marcos totales', val: frames },
                { icon: AlertTriangle, label: 'Fallos de página', val: pageFaults },
                { icon: CheckCircle, label: 'Tasa de aciertos', val: `${hitRatio.toFixed(1)}%` },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-gray-400">
                    <c.icon className="h-4 w-4" />
                    <span className="text-xs">{c.label}</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-gray-100">{c.val}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-4">
              <p className="mb-3 text-sm font-medium text-gray-400">
                Fallos vs. Aciertos
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: 8,
                      color: '#e5e7eb',
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {/* ── Per-process breakdown ── */}
      {processes.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">
            Desglose por Proceso
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {processes.map((proc) => {
              const sched = processMetricsMap.get(proc.pid)
              return (
                <motion.div
                  key={proc.pid}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-gray-700 bg-gray-800/60 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: getProcessColor(proc.pid) }}
                    />
                    <span className="font-mono font-bold text-gray-100">
                      PID {proc.pid}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Ráfaga</span>
                      <span className="font-mono text-gray-200">{proc.burstTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Páginas</span>
                      <span className="font-mono text-gray-200">{proc.numPages}</span>
                    </div>
                    {sched && (
                      <>
                        <div className="flex justify-between">
                          <span>T. Retorno</span>
                          <span className="font-mono text-gray-200">{sched.turnaround}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>T. Espera</span>
                          <span className="font-mono text-gray-200">{sched.waiting}</span>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
