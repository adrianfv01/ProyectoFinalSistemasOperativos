import { useMemo, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import {
  PRESETS,
  PRESET_CATEGORY_LABELS,
  type PresetCategory,
} from '../data/presets'
import PresetCard from '../components/demos/PresetCard'

type Filter = 'todos' | PresetCategory

const CATEGORY_ORDER: PresetCategory[] = [
  'planificacion',
  'multinucleo',
  'procesos',
  'memoria',
  'reemplazo',
]

export default function DemosPage() {
  const [filter, setFilter] = useState<Filter>('todos')

  const counts = useMemo(() => {
    const map: Record<string, number> = { todos: PRESETS.length }
    for (const cat of CATEGORY_ORDER) {
      map[cat] = PRESETS.filter((p) => p.category === cat).length
    }
    return map
  }, [])

  const visible = useMemo(() => {
    if (filter === 'todos') return PRESETS
    return PRESETS.filter((p) => p.category === filter)
  }, [filter])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
          Módulo · Demos
        </span>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] text-[color:var(--accent)]">
              <FlaskConical size={18} />
            </span>
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-[color:var(--text)] sm:text-[26px]">
                Datos precargados
              </h1>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[color:var(--text-muted)]">
                Escenarios listos para ejecutarse, pensados para mostrar el
                comportamiento de cada algoritmo y módulo del simulador.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <FilterChip
          active={filter === 'todos'}
          onClick={() => setFilter('todos')}
          label="Todos"
          count={counts.todos}
        />
        {CATEGORY_ORDER.map((cat) => (
          <FilterChip
            key={cat}
            active={filter === cat}
            onClick={() => setFilter(cat)}
            label={PRESET_CATEGORY_LABELS[cat]}
            count={counts[cat] ?? 0}
          />
        ))}
      </div>

      <p className="rounded-xl border border-amber-300/30 bg-amber-300/5 px-4 py-3 text-[12.5px] leading-relaxed text-amber-200">
        Cargar un demo reemplaza tus procesos actuales y reinicia la simulación
        en curso. Si tienes datos importantes, considéralo antes de continuar.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((preset, i) => (
          <PresetCard key={preset.id} preset={preset} index={i} />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="surface-glass flex min-h-[180px] items-center justify-center border-dashed p-6">
          <p className="text-center text-[13px] text-[color:var(--text-muted)]">
            No hay demos en esta categoría todavía.
          </p>
        </div>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[12px] font-medium transition ${
        active
          ? 'border-[color:var(--accent)]/60 bg-[color:var(--accent-soft)] text-[color:var(--text)]'
          : 'border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:border-[color:var(--accent)]/30 hover:text-[color:var(--text)]'
      }`}
    >
      {label}
      <span className="rounded-full bg-[color:var(--surface-2)] px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-[color:var(--text-faint)]">
        {count}
      </span>
    </button>
  )
}
