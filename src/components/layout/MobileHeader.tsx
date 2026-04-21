import { Link, useLocation } from 'react-router-dom'
import { GraduationCap, HardDrive } from 'lucide-react'
import { getRouteByPath } from './routesConfig'
import ThemeToggle from '../ui/ThemeToggle'
import AboutButton from '../ui/AboutButton'

export default function MobileHeader() {
  const location = useLocation()
  const route = getRouteByPath(location.pathname)
  const title = route?.label ?? 'SimuladorSO'

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--bg-soft)]/85 px-4 backdrop-blur-xl lg:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[color:var(--border-strong)] bg-[color:var(--surface-2)]">
          <HardDrive className="h-3.5 w-3.5 text-[color:var(--accent)]" />
        </div>
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-[color:var(--text)]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <AboutButton />
        <ThemeToggle />
        <Link
          to="/guia"
          className="flex items-center gap-1.5 rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-3 py-1.5 text-[11px] font-semibold text-[color:var(--text)] transition active:scale-95 hover:border-[color:var(--accent)]/40"
          aria-label="Ir a la guía interactiva"
        >
          <GraduationCap className="h-3.5 w-3.5 text-[color:var(--accent)]" />
          Guía
        </Link>
      </div>
    </header>
  )
}
