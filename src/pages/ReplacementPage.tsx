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
    <div className="space-y-4">
      <h1 className="hidden text-xl font-bold text-gray-100 sm:text-2xl lg:block">
        Reemplazo de páginas
      </h1>

      <ReplacementAlgorithmSelector />

      {!hasSteps && (
        <div className="rounded-xl border border-dashed border-gray-600 bg-gray-800/50 p-8 text-center text-sm text-gray-400">
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
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-3 text-center sm:p-4 sm:text-left">
      <p className="text-xs text-gray-400 sm:text-sm">{label}</p>
      <p className={`mt-1 text-lg font-bold sm:text-2xl ${accent}`}>{value}</p>
    </div>
  )
}
