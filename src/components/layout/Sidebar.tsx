import { NavLink } from 'react-router-dom'
import { HardDrive, GraduationCap, Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { FREE_MODE_ROUTES } from './routesConfig'

export default function Sidebar() {
  const dark = useThemeStore((s) => s.dark)
  const toggle = useThemeStore((s) => s.toggle)

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-56 flex-col border-r border-gray-800 bg-gray-950 lg:flex">
      <div className="flex h-14 items-center justify-between border-b border-gray-800 px-4">
        <div className="flex items-center gap-2">
          <HardDrive className="h-6 w-6 text-indigo-400" />
          <span className="text-sm font-bold tracking-tight text-gray-100">
            SimuladorSO
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        <NavLink
          to="/guia"
          className={({ isActive }) =>
            `mb-3 flex items-center gap-3 rounded-lg border border-indigo-500/40 bg-gradient-to-r from-indigo-600/30 to-fuchsia-600/20 px-3 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? 'text-indigo-200 ring-1 ring-indigo-400/60'
                : 'text-indigo-200 hover:from-indigo-600/40 hover:to-fuchsia-600/30'
            }`
          }
        >
          <GraduationCap className="h-4 w-4 shrink-0" />
          Guía interactiva
        </NavLink>

        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
          Modo libre
        </p>

        {FREE_MODE_ROUTES.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-800 px-3 py-3">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 transition hover:bg-gray-800/60 hover:text-gray-200"
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
          {dark ? 'Tema claro' : 'Tema oscuro'}
        </button>
        <p className="mt-2 px-3 text-[10px] text-gray-600">
          Simulador de SO v1.0
        </p>
      </div>
    </aside>
  )
}
