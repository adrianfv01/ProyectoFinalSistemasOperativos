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
      className="space-y-4"
    >
      <header className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span>{hook ?? 'Aprende paso a paso'}</span>
        </div>
        <h1 className="text-balance text-2xl font-bold leading-tight text-white sm:text-[28px]">
          {title}
        </h1>
      </header>

      <div className="space-y-4">{children}</div>
    </motion.div>
  )
}
