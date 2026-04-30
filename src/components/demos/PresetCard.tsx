import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Cpu,
  Database,
  GitFork,
  HardDrive,
  Layers,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { applyPreset } from '../../data/applyPreset'
import {
  PRESET_CATEGORY_LABELS,
  type Preset,
  type PresetCategory,
} from '../../data/presets'

const CATEGORY_ICON: Record<PresetCategory, typeof Cpu> = {
  planificacion: Cpu,
  multinucleo: Layers,
  procesos: GitFork,
  memoria: HardDrive,
  reemplazo: RefreshCw,
}

const ROUTE_LABEL: Record<string, string> = {
  '/procesos': 'Procesos',
  '/planificacion': 'Planificación',
  '/memoria': 'Memoria',
  '/reemplazo': 'Reemplazo',
  '/metricas': 'Métricas',
  '/comparacion': 'Comparación',
}

interface Props {
  preset: Preset
  index?: number
}

export default function PresetCard({ preset, index = 0 }: Props) {
  const navigate = useNavigate()
  const Icon = CATEGORY_ICON[preset.category]

  const handleLoad = () => {
    applyPreset(preset)
    navigate(preset.recommendedRoute)
  }

  const procCount = preset.processes.length
  const threadCount = preset.processes.reduce(
    (acc, p) => acc + p.threads.length,
    0,
  )

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
      className="surface-card flex flex-col gap-4 p-5"
    >
      <header className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] text-[color:var(--accent)]">
          <Icon size={18} />
        </span>
        <div className="flex-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
            {PRESET_CATEGORY_LABELS[preset.category]}
          </span>
          <h3 className="mt-0.5 text-[15px] font-semibold leading-snug tracking-tight text-[color:var(--text)] sm:text-[16px]">
            {preset.title}
          </h3>
        </div>
      </header>

      <p className="text-[13px] leading-relaxed text-[color:var(--text-muted)]">
        {preset.shortDescription}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <span className="chip">
          <Database className="h-3 w-3 text-[color:var(--accent)]" />
          {procCount} {procCount === 1 ? 'proceso' : 'procesos'}
        </span>
        {threadCount > 0 && (
          <span className="chip">
            <Cpu className="h-3 w-3 text-[color:var(--accent)]" />
            {threadCount} {threadCount === 1 ? 'hilo' : 'hilos'}
          </span>
        )}
        {preset.scheduling && (
          <span className="chip">
            <Sparkles className="h-3 w-3 text-[color:var(--accent)]" />
            {preset.scheduling.algorithm.toUpperCase()}
          </span>
        )}
        {preset.memory && (
          <span className="chip">
            <HardDrive className="h-3 w-3 text-[color:var(--accent)]" />
            {preset.memory.frames} marcos
          </span>
        )}
        {preset.replacement && (
          <span className="chip">
            <RefreshCw className="h-3 w-3 text-[color:var(--accent)]" />
            {preset.replacement.algorithm}
          </span>
        )}
      </div>

      {preset.observations.length > 0 && (
        <ul className="space-y-1.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3">
          {preset.observations.map((obs, i) => (
            <li
              key={i}
              className="flex gap-2 text-[12px] leading-relaxed text-[color:var(--text-muted)]"
            >
              <span
                aria-hidden
                className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-[color:var(--accent)]"
              />
              <span>{obs}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
          Abre en {ROUTE_LABEL[preset.recommendedRoute] ?? preset.recommendedRoute}
        </span>
        <button
          type="button"
          onClick={handleLoad}
          className="btn-primary group h-11 px-4 text-[13px]"
        >
          Cargar demo
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.article>
  )
}
