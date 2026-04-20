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
    'border border-white/30 bg-gradient-to-b from-white to-[#E7E2FF] text-[#0A0A0A] shadow-[0_12px_36px_-8px_rgba(139,127,224,0.55),0_0_0_1px_rgba(200,188,255,0.35)] hover:brightness-105',
  secondary:
    'border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] text-[color:var(--text)] shadow-[0_8px_28px_-8px_rgba(0,0,0,0.45)] hover:bg-[color:var(--surface-3)]',
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
