import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface ConceptCardProps {
  title: string
  icon?: LucideIcon
  children: ReactNode
  tone?: 'neutral' | 'info' | 'success' | 'warning'
}

const TONES: Record<NonNullable<ConceptCardProps['tone']>, string> = {
  neutral: 'border-gray-700 bg-gray-900/70',
  info: 'border-sky-500/40 bg-sky-500/10',
  success: 'border-emerald-500/40 bg-emerald-500/10',
  warning: 'border-amber-500/40 bg-amber-500/10',
}

export default function ConceptCard({
  title,
  icon: Icon,
  children,
  tone = 'neutral',
}: ConceptCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-xl border p-4 ${TONES[tone]}`}
    >
      <div className="mb-2 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-gray-300" />}
        <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
      </div>
      <div className="space-y-1.5 text-sm leading-relaxed text-gray-300">
        {children}
      </div>
    </motion.div>
  )
}
