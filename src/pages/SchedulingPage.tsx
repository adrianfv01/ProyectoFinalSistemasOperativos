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
    <div className="space-y-5">
      <div className="hidden items-end justify-between lg:flex">
        <div>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
            Módulo · Scheduler
          </span>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-[color:var(--text)]">
            Planificación de CPU
          </h1>
        </div>
      </div>

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
        <div className="surface-glass flex min-h-[220px] items-center justify-center border-dashed p-6">
          <p className="text-center text-[13px] text-[color:var(--text-muted)]">
            Agrega procesos y ejecuta un algoritmo para ver la simulación.
          </p>
        </div>
      )}
    </div>
  )
}
