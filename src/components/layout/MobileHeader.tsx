import { Link, useLocation } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { getRouteByPath } from './routesConfig'

export default function MobileHeader() {
  const location = useLocation()
  const route = getRouteByPath(location.pathname)
  const title = route?.label ?? 'SimuladorSO'

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-800 bg-gray-950/90 px-4 backdrop-blur-md lg:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <h1 className="truncate text-base font-bold tracking-tight text-gray-100">
          {title}
        </h1>
      </div>

      <Link
        to="/guia"
        className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition active:scale-95"
        aria-label="Ir a la guía interactiva"
      >
        <GraduationCap className="h-4 w-4" />
        Guía
      </Link>
    </header>
  )
}
