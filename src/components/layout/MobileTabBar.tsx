import { NavLink } from 'react-router-dom'
import { FREE_MODE_ROUTES } from './routesConfig'

export default function MobileTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-800 bg-gray-950/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Secciones del modo libre"
    >
      <ul className="grid grid-cols-6">
        {FREE_MODE_ROUTES.map(({ to, shortLabel, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `relative flex h-16 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-indigo-300'
                    : 'text-gray-500 hover:text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-indigo-400" />
                  )}
                  <Icon
                    className={`h-5 w-5 transition-transform ${
                      isActive ? 'scale-110' : ''
                    }`}
                    aria-hidden
                  />
                  <span className="leading-none">{shortLabel}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
