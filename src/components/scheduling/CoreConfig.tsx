import { Cpu, Layers, Info, AlertTriangle } from 'lucide-react'
import { useSchedulingStore } from '../../store/schedulingStore'
import { useProcessStore } from '../../store/processStore'
import type { ParallelismMode } from '../../engine/scheduling/types'

const MIN_CORES = 1
const MAX_CORES = 8

const NON_PREEMPTIVE_ALGOS = ['fcfs', 'sjf', 'hrrn'] as const

export default function CoreConfig() {
  const config = useSchedulingStore((s) => s.config)
  const setConfig = useSchedulingStore((s) => s.setConfig)
  const selectedAlgorithm = useSchedulingStore((s) => s.selectedAlgorithm)
  const processes = useProcessStore((s) => s.processes)

  const numCores = config.numCores ?? 1
  const parallelism: ParallelismMode = config.parallelism ?? 'real'
  const isSimulated = parallelism === 'simulated'
  const effectiveCores = isSimulated ? 1 : numCores

  const tasksCount = processes.reduce(
    (acc, p) => acc + (p.threads.length > 0 ? p.threads.length : 1),
    0,
  )

  const showSubutilWarning =
    !isSimulated && tasksCount > 0 && effectiveCores > tasksCount
  const showNonPreemptiveNote =
    !isSimulated &&
    effectiveCores > 1 &&
    (NON_PREEMPTIVE_ALGOS as readonly string[]).includes(selectedAlgorithm)

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

        <div className="mt-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-2.5 text-[11px] leading-snug text-[color:var(--text-muted)]">
          {isSimulated ? (
            <p>
              <strong className="text-[color:var(--text)]">Simulado:</strong>{' '}
              un único núcleo se reparte el tiempo entre los procesos. Útil para
              ver el detalle de los cambios de contexto en monoprocesador.
            </p>
          ) : (
            <p>
              <strong className="text-[color:var(--text)]">Real:</strong>{' '}
              hasta {numCores} {numCores === 1 ? 'proceso' : 'procesos'} pueden
              correr al mismo tiempo, uno en cada núcleo. La utilización por
              core se valida en el diagrama de Gantt.
            </p>
          )}
        </div>
      </div>

      {(showSubutilWarning || showNonPreemptiveNote) && (
        <div className="space-y-2">
          {showSubutilWarning && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300/30 bg-amber-300/5 p-2.5 text-[11px] leading-snug text-amber-200">
              <AlertTriangle
                size={14}
                className="mt-0.5 shrink-0 text-amber-300"
              />
              <p>
                Tienes <strong>{numCores}</strong> núcleos pero solo{' '}
                <strong>{tasksCount}</strong>{' '}
                {tasksCount === 1 ? 'tarea' : 'tareas'}: se subutilizarán{' '}
                <strong>{numCores - tasksCount}</strong>{' '}
                {numCores - tasksCount === 1 ? 'núcleo' : 'núcleos'}. Verás
                cores en estado "Inactivo" durante toda la simulación.
              </p>
            </div>
          )}
          {showNonPreemptiveNote && (
            <div className="flex items-start gap-2 rounded-lg border border-sky-300/30 bg-sky-300/5 p-2.5 text-[11px] leading-snug text-sky-200">
              <Info size={14} className="mt-0.5 shrink-0 text-sky-300" />
              <p>
                FCFS, SJF y HRRN <strong>no expropian</strong>: en multinúcleo,
                cada proceso ocupa un core hasta terminar su ráfaga. La
                aceleración depende de cuántas tareas haya disponibles a la
                vez.
              </p>
            </div>
          )}
        </div>
      )}
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
