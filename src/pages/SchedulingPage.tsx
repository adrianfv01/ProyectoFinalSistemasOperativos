import { useSchedulingStore } from '../store/schedulingStore'
import AlgorithmSelector from '../components/scheduling/AlgorithmSelector'
import GanttChart from '../components/scheduling/GanttChart'
import SimulationControls from '../components/scheduling/SimulationControls'
import ReadyQueue from '../components/scheduling/ReadyQueue'
import CpuDisplay from '../components/scheduling/CpuDisplay'
import SchedulingMetrics from '../components/scheduling/SchedulingMetrics'
import StickyActionBar from '../components/ui/StickyActionBar'

export default function SchedulingPage() {
  const result = useSchedulingStore((s) => s.result)

  return (
    <div className="space-y-4">
      <h1 className="hidden text-xl font-bold text-gray-100 sm:text-2xl lg:block">
        Planificación de CPU
      </h1>

      <AlgorithmSelector />

      {result ? (
        <>
          <GanttChart />

          <div className="hidden lg:block">
            <SimulationControls />
          </div>

          <div className="lg:hidden">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CpuDisplay />
              <ReadyQueue />
            </div>
          </div>

          <div className="hidden gap-4 lg:grid lg:grid-cols-[1fr_auto_2fr]">
            <ReadyQueue />
            <CpuDisplay />
            <SchedulingMetrics />
          </div>

          <div className="lg:hidden">
            <SchedulingMetrics />
          </div>

          <StickyActionBar>
            <SimulationControls variant="bar" />
          </StickyActionBar>
        </>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-800/50 p-6">
          <p className="text-center text-sm text-gray-500">
            Agrega procesos y ejecuta un algoritmo para ver la simulación
          </p>
        </div>
      )}
    </div>
  )
}
