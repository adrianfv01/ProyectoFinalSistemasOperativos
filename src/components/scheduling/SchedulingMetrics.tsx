import { useSchedulingStore } from '../../store/schedulingStore'
import { getProcessColor } from '../../utils/colors'

export default function SchedulingMetrics() {
  const result = useSchedulingStore((s) => s.result)

  if (!result) return null

  const { metrics, averages, cpuUtilization, contextSwitches } = result

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-400">Métricas</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="px-2 py-2">PID</th>
              <th className="px-2 py-2">CT</th>
              <th className="px-2 py-2">TAT</th>
              <th className="px-2 py-2">WT</th>
              <th className="px-2 py-2">RT</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={`${m.pid}-${m.tid ?? ''}`} className="border-b border-gray-700/50">
                <td className="px-2 py-1.5">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getProcessColor(m.pid) }}
                    />
                    <span className="text-gray-100">
                      {m.tid != null ? `P${m.pid}-H${m.tid}` : `P${m.pid}`}
                    </span>
                  </span>
                </td>
                <td className="px-2 py-1.5 text-gray-300">{m.completionTime}</td>
                <td className="px-2 py-1.5 text-gray-300">{m.turnaroundTime}</td>
                <td className="px-2 py-1.5 text-gray-300">{m.waitingTime}</td>
                <td className="px-2 py-1.5 text-gray-300">{m.responseTime}</td>
              </tr>
            ))}
            <tr className="bg-gray-900/50 font-semibold text-indigo-400">
              <td className="px-2 py-2">Promedio</td>
              <td className="px-2 py-2">—</td>
              <td className="px-2 py-2">{averages.avgTurnaroundTime.toFixed(2)}</td>
              <td className="px-2 py-2">{averages.avgWaitingTime.toFixed(2)}</td>
              <td className="px-2 py-2">{averages.avgResponseTime.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
          <p className="text-xs text-gray-400">Uso de CPU</p>
          <p className="mt-1 text-xl font-bold text-indigo-400">{cpuUtilization.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
          <p className="text-xs text-gray-400">Cambios de contexto</p>
          <p className="mt-1 text-xl font-bold text-indigo-400">{contextSwitches}</p>
        </div>
      </div>
    </div>
  )
}
