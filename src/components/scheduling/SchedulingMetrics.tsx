import { useSchedulingStore } from '../../store/schedulingStore'
import { getProcessColor } from '../../utils/colors'

export default function SchedulingMetrics() {
  const result = useSchedulingStore((s) => s.result)

  if (!result) return null

  const { metrics, averages, cpuUtilization, contextSwitches } = result

  return (
    <div className="surface-card p-4">
      <h2 className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        Métricas
      </h2>

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
                {m.tid != null ? `P${m.pid}-H${m.tid}` : `P${m.pid}`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[12px] tabular-nums text-[color:var(--text-muted)]">
              <span>
                CT: <span className="text-[color:var(--text)]">{m.completionTime}</span>
              </span>
              <span>
                TAT: <span className="text-[color:var(--text)]">{m.turnaroundTime}</span>
              </span>
              <span>
                WT: <span className="text-[color:var(--text)]">{m.waitingTime}</span>
              </span>
              <span>
                RT: <span className="text-[color:var(--text)]">{m.responseTime}</span>
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
              <span className="font-semibold text-[color:var(--accent)]">
                {averages.avgTurnaroundTime.toFixed(2)}
              </span>
            </span>
            <span>
              WT:{' '}
              <span className="font-semibold text-[color:var(--accent)]">
                {averages.avgWaitingTime.toFixed(2)}
              </span>
            </span>
            <span>
              RT:{' '}
              <span className="font-semibold text-[color:var(--accent)]">
                {averages.avgResponseTime.toFixed(2)}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="hidden overflow-x-auto lg:block">
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
                      {m.tid != null ? `P${m.pid}-H${m.tid}` : `P${m.pid}`}
                    </span>
                  </span>
                </td>
                <td className="px-2 py-1.5 font-mono tabular-nums text-[color:var(--text-muted)]">{m.completionTime}</td>
                <td className="px-2 py-1.5 font-mono tabular-nums text-[color:var(--text-muted)]">{m.turnaroundTime}</td>
                <td className="px-2 py-1.5 font-mono tabular-nums text-[color:var(--text-muted)]">{m.waitingTime}</td>
                <td className="px-2 py-1.5 font-mono tabular-nums text-[color:var(--text-muted)]">{m.responseTime}</td>
              </tr>
            ))}
            <tr className="bg-[color:var(--accent-soft)] font-semibold text-[color:var(--accent)]">
              <td className="px-2 py-2 font-mono uppercase tracking-[0.12em]">Promedio</td>
              <td className="px-2 py-2 font-mono tabular-nums">—</td>
              <td className="px-2 py-2 font-mono tabular-nums">{averages.avgTurnaroundTime.toFixed(2)}</td>
              <td className="px-2 py-2 font-mono tabular-nums">{averages.avgWaitingTime.toFixed(2)}</td>
              <td className="px-2 py-2 font-mono tabular-nums">{averages.avgResponseTime.toFixed(2)}</td>
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
            {cpuUtilization.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            Cambios de contexto
          </p>
          <p className="mt-1.5 font-mono text-[20px] font-bold tabular-nums text-[color:var(--accent)]">
            {contextSwitches}
          </p>
        </div>
      </div>
    </div>
  )
}
