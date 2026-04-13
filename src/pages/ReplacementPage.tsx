import { useMemoryStore } from '../store/memoryStore'
import ReplacementAlgorithmSelector from '../components/pageReplacement/ReplacementAlgorithmSelector'
import ReplacementVisualization from '../components/pageReplacement/ReplacementVisualization'
import ReplacementTimeline from '../components/pageReplacement/ReplacementTimeline'
import ReplacementControls from '../components/pageReplacement/ReplacementControls'

export default function ReplacementPage() {
  const replacementSteps = useMemoryStore((s) => s.replacementSteps)
  const hasSteps = replacementSteps.length > 0

  const faults = replacementSteps.filter((s) => s.isPageFault).length
  const total = replacementSteps.length
  const hitRatio = total > 0 ? ((total - faults) / total) * 100 : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">
        Reemplazo de Páginas
      </h1>

      <ReplacementAlgorithmSelector />

      {!hasSteps && (
        <div className="rounded-xl border border-dashed border-gray-600 bg-gray-800/50 p-8 text-center text-gray-400">
          Configura la memoria y ejecuta un algoritmo para ver la simulación.
        </div>
      )}

      {hasSteps && (
        <>
          <ReplacementVisualization />
          <ReplacementTimeline />
          <ReplacementControls />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total de referencias"
              value={total.toString()}
              accent="text-gray-100"
            />
            <SummaryCard
              label="Fallos de página"
              value={faults.toString()}
              accent="text-red-400"
            />
            <SummaryCard
              label="Tasa de aciertos"
              value={`${hitRatio.toFixed(1)}%`}
              accent="text-green-400"
            />
          </div>
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
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}
