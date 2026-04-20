import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FREE_MODE_ROUTES } from './routesConfig'

export default function MobileTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-[color:var(--bg-soft)]/90 backdrop-blur-xl lg:hidden"
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
                    ? 'text-[color:var(--text)]'
                    : 'text-[color:var(--text-faint)] hover:text-[color:var(--text-muted)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="mobile-tab-active"
                      className="absolute inset-x-2 inset-y-1.5 -z-10 rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon
                    className={`h-[18px] w-[18px] transition-transform ${
                      isActive ? 'text-[color:var(--accent)]' : ''
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
