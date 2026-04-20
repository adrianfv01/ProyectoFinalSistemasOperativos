import { Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../../store/themeStore'

interface ThemeToggleProps {
  /** Tamaño visual del botón. `compact` para barras superiores (h-8). */
  size?: 'compact' | 'regular'
  /** Clases extra para ajustar el contenedor desde el sitio donde se monta. */
  className?: string
}

/**
 * Botón inline para alternar entre tema claro y oscuro.
 * Pensado para ir embebido en barras superiores (header móvil del modo libre,
 * header de la guía en móvil y escritorio). El sidebar de escritorio del
 * modo libre ya tiene su propio control y no necesita este componente.
 */
export default function ThemeToggle({
  size = 'compact',
  className = '',
}: ThemeToggleProps) {
  const dark = useThemeStore((s) => s.dark)
  const toggle = useThemeStore((s) => s.toggle)

  const label = dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'

  const sizeClasses =
    size === 'compact'
      ? 'h-8 w-8 [&_svg]:h-[15px] [&_svg]:w-[15px]'
      : 'h-9 w-9 [&_svg]:h-[17px] [&_svg]:w-[17px]'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`group relative flex items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] transition-colors active:scale-95 hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)] ${sizeClasses} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {dark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="flex"
          >
            <Sun />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="flex"
          >
            <Moon />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
