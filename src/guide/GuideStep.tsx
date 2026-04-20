import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface GuideStepProps {
  title: string
  hook?: string
  icon?: LucideIcon
  children: ReactNode
}

export default function GuideStep({
  title,
  hook,
  icon: Icon,
  children,
}: GuideStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-4 lg:space-y-6"
    >
      <header className="space-y-2 lg:space-y-3">
        <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--accent)] lg:text-[11px]">
          {Icon && <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
          <span>{hook ?? 'Aprende paso a paso'}</span>
        </div>
        <h1 className="text-balance text-[26px] font-bold leading-tight tracking-tight text-[color:var(--text)] sm:text-[30px] lg:text-[36px]">
          {title}
        </h1>
      </header>

      <div className="space-y-4 lg:space-y-5">{children}</div>
    </motion.div>
  )
}
