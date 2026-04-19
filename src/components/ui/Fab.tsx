import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onClick: () => void
  icon: ReactNode
  label: string
  extended?: boolean
  variant?: 'primary' | 'secondary'
  position?: 'right' | 'center'
}

const VARIANT_STYLES = {
  primary:
    'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500',
  secondary:
    'bg-gray-800 text-gray-100 shadow-lg shadow-black/30 hover:bg-gray-700',
} as const

export default function Fab({
  onClick,
  icon,
  label,
  extended,
  variant = 'primary',
  position = 'right',
}: Props) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', damping: 18, stiffness: 360 }}
      aria-label={label}
      className={`fixed z-30 flex items-center gap-2 rounded-full font-semibold transition-colors lg:hidden ${
        extended ? 'h-14 px-5 text-sm' : 'h-14 w-14 justify-center'
      } ${VARIANT_STYLES[variant]} ${
        position === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-4'
      }`}
      style={{
        bottom: 'calc(4.5rem + env(safe-area-inset-bottom) + 0.75rem)',
      }}
    >
      <span className="flex h-6 w-6 items-center justify-center">{icon}</span>
      {extended && <span>{label}</span>}
    </motion.button>
  )
}
