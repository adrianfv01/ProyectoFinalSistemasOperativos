import { NavLink } from 'react-router-dom'
import {
  ListPlus,
  CalendarClock,
  HardDrive,
  RefreshCw,
  BarChart3,
  GitCompareArrows,
  Sun,
  Moon,
} from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

const links = [
  { to: '/', label: 'Procesos', icon: ListPlus },
  { to: '/scheduling', label: 'Planificación', icon: CalendarClock },
  { to: '/memory', label: 'Memoria', icon: HardDrive },
  { to: '/replacement', label: 'Reemplazo', icon: RefreshCw },
  { to: '/metrics', label: 'Métricas', icon: BarChart3 },
  { to: '/comparison', label: 'Comparación', icon: GitCompareArrows },
]

export default function Sidebar() {
  const dark = useThemeStore((s) => s.dark)
  const toggle = useThemeStore((s) => s.toggle)

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-gray-800 bg-gray-950">
      <div className="flex h-14 items-center gap-2 border-b border-gray-800 px-4">
        <HardDrive className="h-6 w-6 text-indigo-400" />
        <span className="text-sm font-bold tracking-tight text-gray-100">
          SimuladorSO
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
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
