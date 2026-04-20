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
      className="surface-card p-3.5 sm:p-5"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <div
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[color:var(--border-strong)] sm:h-auto sm:w-auto sm:p-2 ${accent}`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] leading-tight text-[color:var(--text-muted)] sm:truncate sm:text-[12px]">
            {label}
          </p>
          <p className="mt-0.5 font-mono text-[20px] font-semibold tabular-nums leading-none text-[color:var(--text)] sm:text-[22px]">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function MetricKV({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
        {label}
      </span>
      <span className="font-mono text-[13px] font-semibold tabular-nums text-[color:var(--text)]">
        {value}
      </span>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="surface-glass flex items-center justify-center border-dashed px-4 py-10 text-center sm:py-12">
      <p className="text-[13px] text-[color:var(--text-muted)]">{message}</p>
    </div>
  )
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
        {eyebrow}
      </span>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h2 className="text-[16px] font-semibold tracking-tight text-[color:var(--text)] sm:text-[17px]">
          {title}
        </h2>
        {subtitle && (
          <span className="font-mono text-[11px] text-[color:var(--text-muted)] sm:text-[12px]">
            {subtitle}
          </span>
        )}
      </div>
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
      { name: 'Fallos', value: pageFaults, color: '#F08080' },
      { name: 'Aciertos', value: replacementSteps.length - pageFaults, color: '#86EFAC' },
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
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block"
      >
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
          Módulo · Analytics
        </span>
        <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-[color:var(--text)]">
          Métricas
        </h1>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <SummaryCard
          icon={Cpu}
          label="Uso de CPU"
          value={result ? `${result.cpuUtilization.toFixed(1)}%` : '—'}
          accent="bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
        />
        <SummaryCard
          icon={RefreshCw}
          label="Cambios de contexto"
          value={result ? result.contextSwitches : '—'}
          accent="bg-[color:var(--surface-2)] text-sky-300"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Total fallos de página"
          value={replacementSteps.length > 0 ? pageFaults : '—'}
          accent="bg-[color:var(--surface-2)] text-rose-300"
        />
        <SummaryCard
          icon={CheckCircle}
          label="Tasa de aciertos"
          value={replacementSteps.length > 0 ? `${hitRatio.toFixed(1)}%` : '—'}
          accent="bg-[color:var(--surface-2)] text-emerald-300"
        />
      </div>

      {/* ── Scheduling metrics ── */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Planificación"
          title="Métricas por proceso"
          subtitle={`(${ALGORITHM_LABELS[selectedAlgorithm]})`}
        />

        {!result ? (
          <EmptyState message="Ejecuta un algoritmo de planificación primero" />
        ) : (
          <>
            <div className="space-y-2 lg:hidden">
              {result.metrics.map((m, i) => (
                <div
                  key={`m-${m.pid}-${m.tid ?? ''}-${i}`}
                  className="surface-card p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getProcessColor(m.pid) }}
                    />
                    <span className="font-mono text-[13px] font-semibold text-[color:var(--text)]">
                      P{m.pid}
                      {m.tid !== undefined && (
                        <span className="ml-1 text-[color:var(--text-faint)]">·H{m.tid}</span>
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <MetricKV label="T. Finalización" value={m.completionTime} />
                    <MetricKV label="T. Retorno" value={m.turnaroundTime} />
                    <MetricKV label="T. Espera" value={m.waitingTime} />
                    <MetricKV label="T. Respuesta" value={m.responseTime} />
                  </div>
                </div>
              ))}
              <div className="surface-card p-3" style={{ borderColor: 'color-mix(in srgb, var(--accent) 35%, transparent)' }}>
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
                  Promedio
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <MetricKV label="T. Retorno" value={result.averages.avgTurnaroundTime.toFixed(2)} />
                  <MetricKV label="T. Espera" value={result.averages.avgWaitingTime.toFixed(2)} />
                  <MetricKV label="T. Respuesta" value={result.averages.avgResponseTime.toFixed(2)} />
                </div>
              </div>
            </div>

          <div className="surface-card hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--border)] text-[color:var(--text-muted)]">
                  <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em]">PID</th>
                  <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em]">Finalización</th>
                  <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em]">Retorno</th>
                  <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em]">Espera</th>
                  <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em]">Respuesta</th>
                </tr>
              </thead>
              <tbody>
                {result.metrics.map((m, i) => (
                  <tr
                    key={`${m.pid}-${m.tid ?? ''}-${i}`}
                    className="border-b border-[color:var(--border)] text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-2)]"
                  >
                    <td className="px-4 py-2.5 font-mono tabular-nums text-[color:var(--text)]">
                      <span
                        className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                        style={{ backgroundColor: getProcessColor(m.pid) }}
                      />
                      {m.pid}
                      {m.tid !== undefined && (
                        <span className="ml-1 text-[color:var(--text-faint)]">T{m.tid}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono tabular-nums">{m.completionTime}</td>
                    <td className="px-4 py-2.5 font-mono tabular-nums">{m.turnaroundTime}</td>
                    <td className="px-4 py-2.5 font-mono tabular-nums">{m.waitingTime}</td>
                    <td className="px-4 py-2.5 font-mono tabular-nums">{m.responseTime}</td>
                  </tr>
                ))}
                <tr className="bg-[color:var(--accent-soft)] font-semibold text-[color:var(--accent)]">
                  <td className="px-4 py-2.5">Promedio</td>
                  <td className="px-4 py-2.5 font-mono">—</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums">
                    {result.averages.avgTurnaroundTime.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 font-mono tabular-nums">
                    {result.averages.avgWaitingTime.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 font-mono tabular-nums">
                    {result.averages.avgResponseTime.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      {/* ── Memory metrics ── */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Memoria"
          title="Reemplazo de páginas"
          subtitle={`(${REPLACEMENT_LABELS[replacementAlgo]})`}
        />

        {replacementSteps.length === 0 ? (
          <EmptyState message="Ejecuta un algoritmo de reemplazo primero" />
        ) : (
          <div className="space-y-4">
            <div
              className="scroll-snap-x hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:hidden"
              data-no-swipe
            >
              {[
                { icon: HardDrive, label: 'Memoria total', val: `${totalMemory} KB` },
                { icon: Layers, label: 'Tamaño de página', val: `${pageSize} KB` },
                { icon: Server, label: 'Marcos totales', val: frames },
                { icon: AlertTriangle, label: 'Fallos de página', val: pageFaults },
                { icon: CheckCircle, label: 'Tasa de aciertos', val: `${hitRatio.toFixed(1)}%` },
              ].map((c) => (
                <div key={c.label} className="surface-card min-w-[160px] shrink-0 px-4 py-3">
                  <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
                    <c.icon className="h-3.5 w-3.5" />
                    <span className="text-[11px]">{c.label}</span>
                  </div>
                  <p className="mt-1 font-mono text-[18px] font-semibold tabular-nums text-[color:var(--text)]">
                    {c.val}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-5">
              {[
                { icon: HardDrive, label: 'Memoria total', val: `${totalMemory} KB` },
                { icon: Layers, label: 'Tamaño de página', val: `${pageSize} KB` },
                { icon: Server, label: 'Marcos totales', val: frames },
                { icon: AlertTriangle, label: 'Fallos de página', val: pageFaults },
                { icon: CheckCircle, label: 'Tasa de aciertos', val: `${hitRatio.toFixed(1)}%` },
              ].map((c) => (
                <div key={c.label} className="surface-card px-4 py-3">
                  <div className="flex items-center gap-2 text-[color:var(--text-muted)]">
                    <c.icon className="h-3.5 w-3.5" />
                    <span className="text-[11px]">{c.label}</span>
                  </div>
                  <p className="mt-1 font-mono text-[18px] font-semibold tabular-nums text-[color:var(--text)]">
                    {c.val}
                  </p>
                </div>
              ))}
            </div>

            <div className="surface-card p-4">
              <p className="mb-3 text-[13px] font-medium text-[color:var(--text-muted)]">
                Fallos vs. Aciertos
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--accent-soft)' }}
                    contentStyle={{
                      backgroundColor: 'var(--surface-2)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 12,
                      color: 'var(--text)',
                      boxShadow: '0 12px 32px -12px rgba(0,0,0,0.45)',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
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
          <SectionHeader eyebrow="Procesos" title="Desglose individual" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {processes.map((proc) => {
              const sched = processMetricsMap.get(proc.pid)
              return (
                <motion.div
                  key={proc.pid}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="surface-card p-3 sm:p-4"
                >
                  <div className="mb-2.5 flex items-center gap-2 sm:mb-3">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: getProcessColor(proc.pid) }}
                    />
                    <span className="font-mono text-[12px] font-semibold text-[color:var(--text)] sm:text-[13px]">
                      PID {proc.pid}
                    </span>
                  </div>
                  <div className="space-y-1 text-[12px] text-[color:var(--text-muted)] sm:text-[13px]">
                    <div className="flex justify-between gap-2">
                      <span>Ráfaga</span>
                      <span className="font-mono tabular-nums text-[color:var(--text)]">
                        {proc.burstTime}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span>Páginas</span>
                      <span className="font-mono tabular-nums text-[color:var(--text)]">
                        {proc.numPages}
                      </span>
                    </div>
                    {sched && (
                      <>
                        <div className="flex justify-between gap-2">
                          <span>T. Retorno</span>
                          <span className="font-mono tabular-nums text-[color:var(--text)]">
                            {sched.turnaround}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span>T. Espera</span>
                          <span className="font-mono tabular-nums text-[color:var(--text)]">
                            {sched.waiting}
                          </span>
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
