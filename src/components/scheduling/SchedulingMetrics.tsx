import { useMemo } from 'react'
import { useSchedulingStore } from '../../store/schedulingStore'
import { useProcessStore } from '../../store/processStore'
import { taskKey } from '../../engine/scheduling/metrics'
import { getProcessColor } from '../../utils/colors'

interface MetricTooltipProps {
  value: React.ReactNode
  className?: string
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
}

function MetricTooltip({ value, className, children, align = 'center' }: MetricTooltipProps) {
  const alignClass =
    align === 'left'
      ? 'left-0'
      : align === 'right'
        ? 'right-0'
        : 'left-1/2 -translate-x-1/2'

  return (
    <span className="group/tip relative inline-flex">
      <span
        tabIndex={0}
        className={`cursor-help underline decoration-dotted decoration-[color:var(--text-faint)] underline-offset-[3px] outline-none transition-colors hover:text-[color:var(--accent)] hover:decoration-[color:var(--accent)] focus-visible:text-[color:var(--accent)] focus-visible:decoration-[color:var(--accent)] ${className ?? ''}`}
      >
        {value}
      </span>
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full z-50 mb-2 hidden min-w-max rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-3 py-2 text-left text-[11.5px] leading-relaxed text-[color:var(--text)] shadow-[var(--shadow-lg)] group-hover/tip:block group-focus-within/tip:block ${alignClass}`}
      >
        {children}
      </span>
    </span>
  )
}

function TooltipTitle({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block font-mono text-[9.5px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
      {children}
    </span>
  )
}

function TooltipFormula({ children }: { children: React.ReactNode }) {
  return (
    <span className="block font-mono text-[11.5px] tabular-nums text-[color:var(--text)]">
      {children}
    </span>
  )
}

function TooltipNote({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-1 block font-sans text-[10.5px] leading-snug text-[color:var(--text-muted)]">
      {children}
    </span>
  )
}

function formatPid(pid: number, tid?: number) {
  return tid != null ? `P${pid}-H${tid}` : `P${pid}`
}

export default function SchedulingMetrics() {
  const result = useSchedulingStore((s) => s.result)
  const processes = useProcessStore((s) => s.processes)

  const taskBurst = useMemo(() => {
    const map = new Map<string, { arrival: number; burst: number }>()
    for (const p of processes) {
      if (p.threads.length > 0) {
        for (const t of p.threads) {
          map.set(`${p.pid}-${t.tid}`, { arrival: p.arrivalTime, burst: t.burstTime })
        }
      } else {
        map.set(`${p.pid}`, { arrival: p.arrivalTime, burst: p.burstTime })
      }
    }
    return map
  }, [processes])

  if (!result) return null

  const {
    metrics,
    averages,
    cpuUtilization,
    cpuUtilizationPerCore,
    contextSwitches,
    timelinePerCore,
    numCores,
    makespan,
    totalBusy,
  } = result

  const switchEvents: { core: number; time: number; from: string; to: string }[] = []
  for (let c = 0; c < timelinePerCore.length; c++) {
    const row = timelinePerCore[c]
    for (let i = 1; i < row.length; i++) {
      const prev = row[i - 1]
      const curr = row[i]
      if (taskKey(prev) !== taskKey(curr)) {
        switchEvents.push({
          core: c,
          time: curr.start,
          from: formatPid(prev.pid, prev.tid),
          to: formatPid(curr.pid, curr.tid),
        })
      }
    }
  }

  const ctTooltip = (m: (typeof metrics)[number]) => (
    <>
      <TooltipTitle>Tiempo de finalización</TooltipTitle>
      <TooltipFormula>CT = instante en que terminó el proceso</TooltipFormula>
      <TooltipFormula>
        CT({formatPid(m.pid, m.tid)}) = <strong>{m.completionTime}</strong>
      </TooltipFormula>
    </>
  )

  const tatTooltip = (m: (typeof metrics)[number]) => {
    const arrival = taskBurst.get(taskKey(m))?.arrival ?? 0
    return (
      <>
        <TooltipTitle>Tiempo de retorno (TAT)</TooltipTitle>
        <TooltipFormula>TAT = CT − Arrival</TooltipFormula>
        <TooltipFormula>
          TAT = {m.completionTime} − {arrival} = <strong>{m.turnaroundTime}</strong>
        </TooltipFormula>
      </>
    )
  }

  const wtTooltip = (m: (typeof metrics)[number]) => {
    const burst = taskBurst.get(taskKey(m))?.burst ?? 0
    return (
      <>
        <TooltipTitle>Tiempo de espera (WT)</TooltipTitle>
        <TooltipFormula>WT = TAT − Burst</TooltipFormula>
        <TooltipFormula>
          WT = {m.turnaroundTime} − {burst} = <strong>{m.waitingTime}</strong>
        </TooltipFormula>
      </>
    )
  }

  const rtTooltip = (m: (typeof metrics)[number]) => {
    const arrival = taskBurst.get(taskKey(m))?.arrival ?? 0
    const firstStart = m.responseTime + arrival
    return (
      <>
        <TooltipTitle>Tiempo de respuesta (RT)</TooltipTitle>
        <TooltipFormula>RT = First Start − Arrival</TooltipFormula>
        <TooltipFormula>
          RT = {firstStart} − {arrival} = <strong>{m.responseTime}</strong>
        </TooltipFormula>
      </>
    )
  }

  const avgTooltip = (
    label: string,
    values: number[],
    avg: number,
    decimals = 2,
  ) => (
    <>
      <TooltipTitle>Promedio {label}</TooltipTitle>
      <TooltipFormula>
        ({values.join(' + ')}) / {values.length} ={' '}
        <strong>{avg.toFixed(decimals)}</strong>
      </TooltipFormula>
    </>
  )

  return (
    <div className="surface-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
          Métricas
        </h2>
        <span className="hidden text-[10.5px] text-[color:var(--text-faint)] sm:inline">
          Pasa el cursor sobre cada valor para ver el cálculo
        </span>
      </div>

      <div className="space-y-2 lg:hidden">
        {metrics.map((m) => (
          <div
            key={`${m.pid}-${m.tid ?? ''}`}
            className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getProcessColor(m.pid) }}
              />
              <span className="font-mono text-[13px] font-semibold tabular-nums text-[color:var(--text)]">
                {formatPid(m.pid, m.tid)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[12px] tabular-nums text-[color:var(--text-muted)]">
              <span>
                CT:{' '}
                <MetricTooltip
                  value={m.completionTime}
                  className="text-[color:var(--text)]"
                  align="left"
                >
                  {ctTooltip(m)}
                </MetricTooltip>
              </span>
              <span>
                TAT:{' '}
                <MetricTooltip
                  value={m.turnaroundTime}
                  className="text-[color:var(--text)]"
                  align="left"
                >
                  {tatTooltip(m)}
                </MetricTooltip>
              </span>
              <span>
                WT:{' '}
                <MetricTooltip
                  value={m.waitingTime}
                  className="text-[color:var(--text)]"
                  align="left"
                >
                  {wtTooltip(m)}
                </MetricTooltip>
              </span>
              <span>
                RT:{' '}
                <MetricTooltip
                  value={m.responseTime}
                  className="text-[color:var(--text)]"
                  align="left"
                >
                  {rtTooltip(m)}
                </MetricTooltip>
              </span>
            </div>
          </div>
        ))}
        <div className="rounded-xl border border-[color:var(--accent)]/30 bg-[color:var(--accent-soft)] p-3">
          <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
            Promedio
          </p>
          <div className="grid grid-cols-3 gap-2 font-mono text-[12px] tabular-nums text-[color:var(--text-muted)]">
            <span>
              TAT:{' '}
              <MetricTooltip
                value={averages.avgTurnaroundTime.toFixed(2)}
                className="font-semibold text-[color:var(--accent)]"
                align="left"
              >
                {avgTooltip(
                  'TAT',
                  metrics.map((m) => m.turnaroundTime),
                  averages.avgTurnaroundTime,
                )}
              </MetricTooltip>
            </span>
            <span>
              WT:{' '}
              <MetricTooltip
                value={averages.avgWaitingTime.toFixed(2)}
                className="font-semibold text-[color:var(--accent)]"
                align="left"
              >
                {avgTooltip(
                  'WT',
                  metrics.map((m) => m.waitingTime),
                  averages.avgWaitingTime,
                )}
              </MetricTooltip>
            </span>
            <span>
              RT:{' '}
              <MetricTooltip
                value={averages.avgResponseTime.toFixed(2)}
                className="font-semibold text-[color:var(--accent)]"
                align="left"
              >
                {avgTooltip(
                  'RT',
                  metrics.map((m) => m.responseTime),
                  averages.avgResponseTime,
                )}
              </MetricTooltip>
            </span>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[color:var(--border)] font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
              <th className="px-2 py-2 font-medium">PID</th>
              <th className="px-2 py-2 font-medium">CT</th>
              <th className="px-2 py-2 font-medium">TAT</th>
              <th className="px-2 py-2 font-medium">WT</th>
              <th className="px-2 py-2 font-medium">RT</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={`${m.pid}-${m.tid ?? ''}`} className="border-b border-[color:var(--border)]">
                <td className="px-2 py-1.5">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getProcessColor(m.pid) }}
                    />
                    <span className="font-mono tabular-nums text-[color:var(--text)]">
                      {formatPid(m.pid, m.tid)}
                    </span>
                  </span>
                </td>
                <td className="px-2 py-1.5 font-mono tabular-nums text-[color:var(--text-muted)]">
                  <MetricTooltip value={m.completionTime}>{ctTooltip(m)}</MetricTooltip>
                </td>
                <td className="px-2 py-1.5 font-mono tabular-nums text-[color:var(--text-muted)]">
                  <MetricTooltip value={m.turnaroundTime}>{tatTooltip(m)}</MetricTooltip>
                </td>
                <td className="px-2 py-1.5 font-mono tabular-nums text-[color:var(--text-muted)]">
                  <MetricTooltip value={m.waitingTime}>{wtTooltip(m)}</MetricTooltip>
                </td>
                <td className="px-2 py-1.5 font-mono tabular-nums text-[color:var(--text-muted)]">
                  <MetricTooltip value={m.responseTime}>{rtTooltip(m)}</MetricTooltip>
                </td>
              </tr>
            ))}
            <tr className="bg-[color:var(--accent-soft)] font-semibold text-[color:var(--accent)]">
              <td className="px-2 py-2 font-mono uppercase tracking-[0.12em]">Promedio</td>
              <td className="px-2 py-2 font-mono tabular-nums">—</td>
              <td className="px-2 py-2 font-mono tabular-nums">
                <MetricTooltip
                  value={averages.avgTurnaroundTime.toFixed(2)}
                  className="text-[color:var(--accent)]"
                >
                  {avgTooltip(
                    'TAT',
                    metrics.map((m) => m.turnaroundTime),
                    averages.avgTurnaroundTime,
                  )}
                </MetricTooltip>
              </td>
              <td className="px-2 py-2 font-mono tabular-nums">
                <MetricTooltip
                  value={averages.avgWaitingTime.toFixed(2)}
                  className="text-[color:var(--accent)]"
                >
                  {avgTooltip(
                    'WT',
                    metrics.map((m) => m.waitingTime),
                    averages.avgWaitingTime,
                  )}
                </MetricTooltip>
              </td>
              <td className="px-2 py-2 font-mono tabular-nums">
                <MetricTooltip
                  value={averages.avgResponseTime.toFixed(2)}
                  className="text-[color:var(--accent)]"
                >
                  {avgTooltip(
                    'RT',
                    metrics.map((m) => m.responseTime),
                    averages.avgResponseTime,
                  )}
                </MetricTooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            Uso de CPU
          </p>
          <p className="mt-1.5 font-mono text-[20px] font-bold tabular-nums text-[color:var(--accent)]">
            <MetricTooltip
              value={`${cpuUtilization.toFixed(1)}%`}
              className="text-[color:var(--accent)]"
            >
              <TooltipTitle>Uso de CPU</TooltipTitle>
              <TooltipFormula>
                Uso = (Tiempo ocupado) / (Makespan × Núcleos) × 100%
              </TooltipFormula>
              <TooltipFormula>
                = ({totalBusy}) / ({makespan} × {numCores}) × 100% ={' '}
                <strong>{cpuUtilization.toFixed(1)}%</strong>
              </TooltipFormula>
              {cpuUtilizationPerCore.length > 1 && (
                <span className="mt-1.5 block border-t border-[color:var(--border)] pt-1.5">
                  {cpuUtilizationPerCore.map((u, i) => (
                    <TooltipFormula key={`util-${i}`}>
                      Core {i}: {u.toFixed(1)}%
                    </TooltipFormula>
                  ))}
                </span>
              )}
            </MetricTooltip>
          </p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            Cambios de contexto
          </p>
          <p className="mt-1.5 font-mono text-[20px] font-bold tabular-nums text-[color:var(--accent)]">
            <MetricTooltip
              value={contextSwitches}
              className="text-[color:var(--accent)]"
              align="right"
            >
              <TooltipTitle>Cambios de contexto</TooltipTitle>
              <TooltipFormula>
                Transiciones de un proceso a otro en cada núcleo
              </TooltipFormula>
              {switchEvents.length === 0 ? (
                <TooltipNote>Sin cambios de contexto en esta simulación.</TooltipNote>
              ) : (
                <span className="mt-1.5 block max-h-40 overflow-y-auto border-t border-[color:var(--border)] pt-1.5">
                  {switchEvents.map((ev, i) => (
                    <TooltipFormula key={i}>
                      Tick {ev.time} · Core {ev.core}: {ev.from} → {ev.to}
                    </TooltipFormula>
                  ))}
                </span>
              )}
              <TooltipNote>
                Total: <strong>{contextSwitches}</strong> cambios.
              </TooltipNote>
            </MetricTooltip>
          </p>
        </div>
      </div>
    </div>
  )
}
