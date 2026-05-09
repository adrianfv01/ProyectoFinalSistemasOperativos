import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react'
import { FREE_MODE_ROUTES, getRouteIndex } from './routesConfig'
import { describePrerequisite, usePrerequisitesStatus } from './usePrerequisites'

export default function ModuleHeader() {
  const location = useLocation()
  const idx = getRouteIndex(location.pathname)
  const prereqStatus = usePrerequisitesStatus()

  if (idx < 0) return null

  const route = FREE_MODE_ROUTES[idx]
  const Icon = route.icon
  const prev = idx > 0 ? FREE_MODE_ROUTES[idx - 1] : null
  const next = idx < FREE_MODE_ROUTES.length - 1 ? FREE_MODE_ROUTES[idx + 1] : null

  const prereqMet = prereqStatus[route.prerequisite]
  const prereqMsg = describePrerequisite(route.prerequisite)

  return (
    <div className="space-y-3">
      <nav
        aria-label="Ruta"
        className="flex flex-wrap items-center gap-1 text-[11px] text-[color:var(--text-muted)]"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)]"
        >
          <Home size={11} />
          Inicio
        </Link>
        <ChevronRight size={11} className="text-[color:var(--text-faint)]" />
        <span className="px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
          Modo libre
        </span>
        <ChevronRight size={11} className="text-[color:var(--text-faint)]" />
        <span className="rounded-md bg-[color:var(--surface-2)] px-1.5 py-0.5 font-medium text-[color:var(--text)]">
          {route.label}
        </span>
        <span className="ml-auto font-mono text-[10px] tabular-nums text-[color:var(--text-faint)]">
          Paso {idx + 1} de {FREE_MODE_ROUTES.length}
        </span>
      </nav>

      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] text-[color:var(--accent)]">
            <Icon size={18} />
          </span>
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
              Módulo · {route.label}
            </span>
            <h1 className="text-[20px] font-semibold tracking-tight text-[color:var(--text)] sm:text-[24px]">
              {route.label}
            </h1>
            <p className="mt-0.5 max-w-xl text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
              {route.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          <div className="flex w-full items-center gap-1.5 sm:w-auto">
            {prev ? (
              <Link
                to={prev.to}
                className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--text-muted)] transition hover:border-[color:var(--accent)]/30 hover:text-[color:var(--text)] sm:flex-none"
                title={`Ir a ${prev.label}`}
              >
                <ArrowLeft size={12} />
                <span className="hidden sm:inline">{prev.shortLabel}</span>
                <span className="sm:hidden">Anterior</span>
              </Link>
            ) : (
              <span className="h-9 flex-1 sm:flex-none" />
            )}
            {next ? (
              <Link
                to={next.to}
                className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] px-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text)] transition hover:border-[color:var(--accent)]/60 sm:flex-none"
                title={`Ir a ${next.label}`}
              >
                <span className="hidden sm:inline">{next.shortLabel}</span>
                <span className="sm:hidden">Siguiente</span>
                <ArrowRight size={12} />
              </Link>
            ) : (
              <span className="h-9 flex-1 sm:flex-none" />
            )}
          </div>
        </div>
      </div>

      {!prereqMet && prereqMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-300/30 bg-amber-300/5 p-3 text-[12px] leading-snug text-amber-200">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-300" />
          <p>
            <strong>Falta un paso previo:</strong> {prereqMsg} Cuando se cumpla,
            esta página mostrará la simulación.
          </p>
        </div>
      )}
    </div>
  )
}
