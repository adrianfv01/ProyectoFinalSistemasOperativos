import { Cpu, Layers } from 'lucide-react'
import { useSchedulingStore } from '../../store/schedulingStore'
import type { ParallelismMode } from '../../engine/scheduling/types'

const MIN_CORES = 1
const MAX_CORES = 8

export default function CoreConfig() {
  const config = useSchedulingStore((s) => s.config)
  const setConfig = useSchedulingStore((s) => s.setConfig)

  const numCores = config.numCores ?? 1
  const parallelism: ParallelismMode = config.parallelism ?? 'real'
  const isSimulated = parallelism === 'simulated'

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-[color:var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <Cpu size={13} />
            Núcleos de CPU
          </span>
          <span className="font-mono tabular-nums text-[color:var(--text)]">
            {isSimulated ? 1 : numCores}
            {isSimulated && (
              <span className="ml-1 text-[10px] font-normal text-[color:var(--text-faint)]">
                (forzado por modo simulado)
              </span>
            )}
          </span>
        </label>
        <input
          type="range"
          min={MIN_CORES}
          max={MAX_CORES}
          value={numCores}
          disabled={isSimulated}
          onChange={(e) => setConfig({ numCores: parseInt(e.target.value, 10) })}
          className="h-2 w-full cursor-pointer accent-[color:var(--accent)] disabled:opacity-40"
          aria-label="Número de núcleos de CPU"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-[color:var(--text-faint)]">
          <span>{MIN_CORES}</span>
          <span>{MAX_CORES}</span>
        </div>
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-[color:var(--text-muted)]">
          <Layers size={13} />
          Modo de paralelismo
        </label>
        <div
          className="grid grid-cols-2 gap-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-1"
          role="tablist"
          aria-label="Modo de paralelismo"
        >
          <ModeButton
            active={parallelism === 'real'}
            onClick={() => setConfig({ parallelism: 'real' })}
            title="Paralelismo real"
            subtitle={`${numCores} ${numCores === 1 ? 'núcleo' : 'núcleos'} en paralelo`}
          />
          <ModeButton
            active={parallelism === 'simulated'}
            onClick={() => setConfig({ parallelism: 'simulated' })}
            title="Simulado"
            subtitle="1 núcleo con time-slicing fino"
          />
        </div>
      </div>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean
  onClick: () => void
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition ${
        active
          ? 'bg-[color:var(--surface)] text-[color:var(--text)] shadow-[0_2px_8px_rgba(0,0,0,0.18)]'
          : 'text-[color:var(--text-muted)] hover:text-[color:var(--text)]'
      }`}
    >
      <span className="text-[12px] font-semibold">{title}</span>
      <span className="text-[10px] leading-tight text-[color:var(--text-faint)]">
        {subtitle}
      </span>
    </button>
  )
}
