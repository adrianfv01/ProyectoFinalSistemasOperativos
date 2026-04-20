import { useMemoryStore } from '../store/memoryStore'
import ReplacementAlgorithmSelector from '../components/pageReplacement/ReplacementAlgorithmSelector'
import ReplacementVisualization from '../components/pageReplacement/ReplacementVisualization'
import ReplacementTimeline from '../components/pageReplacement/ReplacementTimeline'
import ReplacementControls from '../components/pageReplacement/ReplacementControls'
import StickyActionBar from '../components/ui/StickyActionBar'

export default function ReplacementPage() {
  const replacementSteps = useMemoryStore((s) => s.replacementSteps)
  const hasSteps = replacementSteps.length > 0

  const faults = replacementSteps.filter((s) => s.isPageFault).length
  const total = replacementSteps.length
  const hitRatio = total > 0 ? ((total - faults) / total) * 100 : 0

  return (
    <div className="space-y-5">
      <div className="hidden items-end justify-between lg:flex">
        <div>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
            Módulo · Page Replacement
          </span>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-[color:var(--text)]">
            Reemplazo de páginas
          </h1>
        </div>
      </div>

      <ReplacementAlgorithmSelector />

      {!hasSteps && (
        <div className="surface-glass border-dashed p-8 text-center text-[13px] text-[color:var(--text-muted)]">
          Configura la memoria y ejecuta un algoritmo para ver la simulación.
        </div>
      )}

      {hasSteps && (
        <>
          <ReplacementVisualization />
          <ReplacementTimeline />

          <div className="hidden lg:block">
            <ReplacementControls />
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-4">
            <SummaryCard
              label="Referencias"
              value={total.toString()}
              accent="text-gray-100"
            />
            <SummaryCard
              label="Fallos"
              value={faults.toString()}
              accent="text-red-400"
            />
            <SummaryCard
              label="Aciertos"
              value={`${hitRatio.toFixed(1)}%`}
              accent="text-green-400"
            />
          </div>

          <StickyActionBar>
            <ReplacementControls variant="bar" />
          </StickyActionBar>
        </>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="surface-card p-3 text-center sm:p-4 sm:text-left">
      <p className="text-[11px] text-[color:var(--text-muted)] sm:text-[12px]">
        {label}
      </p>
      <p className={`mt-1 font-mono text-[18px] font-semibold tabular-nums sm:text-[24px] ${accent}`}>
        {value}
      </p>
    </div>
  )
}
