import { useSchedulingStore } from '../store/schedulingStore'
import AlgorithmSelector from '../components/scheduling/AlgorithmSelector'
import GanttChart from '../components/scheduling/GanttChart'
import SimulationControls from '../components/scheduling/SimulationControls'
import CpuDisplay from '../components/scheduling/CpuDisplay'
import SchedulingMetrics from '../components/scheduling/SchedulingMetrics'
import SystemQueues from '../components/scheduling/SystemQueues'
import MultilevelQueueView from '../components/scheduling/MultilevelQueueView'
import StickyActionBar from '../components/ui/StickyActionBar'

export default function SchedulingPage() {
  const result = useSchedulingStore((s) => s.result)
  const hasMultilevel =
    !!result?.queueSnapshots && result.queueSnapshots.length > 0

  return (
    <div className={`space-y-5 ${result ? 'pb-28 lg:pb-0' : ''}`}>
      <AlgorithmSelector />

      {result ? (
        <>
          <GanttChart />

          <div className="hidden lg:block">
            <SimulationControls />
          </div>

          <CpuDisplay />

          <SystemQueues />

          {hasMultilevel && <MultilevelQueueView />}

          <SchedulingMetrics />

          <StickyActionBar>
            <SimulationControls variant="bar" />
          </StickyActionBar>
        </>
      ) : (
        <div className="surface-glass flex min-h-[220px] items-center justify-center border-dashed p-6">
          <p className="text-center text-[13px] text-[color:var(--text-muted)]">
            Agrega procesos y ejecuta un algoritmo para ver la simulación.
          </p>
        </div>
      )}
    </div>
  )
}
