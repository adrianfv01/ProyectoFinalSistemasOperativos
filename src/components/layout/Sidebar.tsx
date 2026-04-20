import { NavLink } from 'react-router-dom'
import { HardDrive, GraduationCap, Sun, Moon, Sparkles } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { FREE_MODE_ROUTES } from './routesConfig'

export default function Sidebar() {
  const dark = useThemeStore((s) => s.dark)
  const toggle = useThemeStore((s) => s.toggle)

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-[color:var(--border)] bg-[color:var(--bg-soft)]/80 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center justify-between border-b border-[color:var(--border)] px-5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-2)]">
            <HardDrive className="h-4 w-4 text-[color:var(--accent)]" />
            <span className="absolute -inset-0.5 -z-10 rounded-lg bg-[color:var(--accent-soft)] blur-md" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-semibold tracking-tight text-[color:var(--text)]">
              SimuladorSO
            </span>
            <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
              v1.0
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <NavLink
          to="/guia"
          className={({ isActive }) =>
            `group relative mb-4 flex items-center gap-2.5 overflow-hidden rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-3 py-2.5 text-sm font-semibold text-[color:var(--text)] transition-all hover:border-[color:var(--accent)]/40 ${
              isActive ? 'border-[color:var(--accent)]/50' : ''
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br from-[color:var(--accent-soft)] via-transparent to-transparent opacity-80" />
              <Sparkles className="relative h-4 w-4 shrink-0 text-[color:var(--accent)]" />
              <span className="relative flex-1">Guía interactiva</span>
              {isActive && (
                <span className="relative h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] shadow-[0_0_12px_var(--accent)]" />
              )}
            </>
          )}
        </NavLink>

        <p className="px-3 pb-1.5 pt-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
          Modo libre
        </p>

        {FREE_MODE_ROUTES.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-[color:var(--surface-2)] text-[color:var(--text)]'
                  : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--text)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-[color:var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-[color:var(--accent)]' : 'group-hover:text-[color:var(--text)]'
                  }`}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[color:var(--border)] px-3 py-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          className="flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-[12px] text-[color:var(--text-muted)] transition hover:border-[color:var(--border)] hover:bg-[color:var(--surface)] hover:text-[color:var(--text)]"
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
          <span>{dark ? 'Tema claro' : 'Tema oscuro'}</span>
        </button>
      </div>
    </aside>
  )
}
