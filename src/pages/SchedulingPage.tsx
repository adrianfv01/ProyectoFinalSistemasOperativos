import { useSchedulingStore } from '../store/schedulingStore'
import AlgorithmSelector from '../components/scheduling/AlgorithmSelector'
import GanttChart from '../components/scheduling/GanttChart'
import SimulationControls from '../components/scheduling/SimulationControls'
import ReadyQueue from '../components/scheduling/ReadyQueue'
import CpuDisplay from '../components/scheduling/CpuDisplay'
import SchedulingMetrics from '../components/scheduling/SchedulingMetrics'

export default function SchedulingPage() {
  const result = useSchedulingStore((s) => s.result)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-100 sm:text-2xl">Planificación de CPU</h1>

      <AlgorithmSelector />

      {result ? (
        <>
          <GanttChart />
          <SimulationControls />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_2fr]">
            <ReadyQueue />
            <CpuDisplay />
            <div className="sm:col-span-2 lg:col-span-1">
              <SchedulingMetrics />
            </div>
          </div>
        </>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-800/50">
          <p className="text-center text-gray-500">
            Agrega procesos y ejecuta un algoritmo para ver la simulación
          </p>
        </div>
      )}
    </div>
  )
}
