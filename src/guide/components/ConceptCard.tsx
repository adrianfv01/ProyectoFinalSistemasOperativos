import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface ConceptCardProps {
  title: string
  icon?: LucideIcon
  children: ReactNode
  tone?: 'neutral' | 'info' | 'success' | 'warning'
}

const TONES: Record<NonNullable<ConceptCardProps['tone']>, { card: string; icon: string }> = {
  neutral: {
    card: 'border-[color:var(--border)] bg-[color:var(--surface)]',
    icon: 'text-[color:var(--accent)]',
  },
  info: {
    card: 'border-sky-300/30 bg-sky-300/5',
    icon: 'text-sky-300',
  },
  success: {
    card: 'border-emerald-300/30 bg-emerald-300/5',
    icon: 'text-emerald-300',
  },
  warning: {
    card: 'border-amber-300/30 bg-amber-300/5',
    icon: 'text-amber-300',
  },
}

export default function ConceptCard({
  title,
  icon: Icon,
  children,
  tone = 'neutral',
}: ConceptCardProps) {
  const styles = TONES[tone]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${styles.card}`}
    >
      <div className="mb-2 flex items-center gap-2">
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-2)]">
            <Icon className={`h-3.5 w-3.5 ${styles.icon}`} strokeWidth={2} />
          </span>
        )}
        <h3 className="text-[13px] font-semibold tracking-tight text-[color:var(--text)]">
          {title}
        </h3>
      </div>
      <div className="space-y-1.5 text-[13px] leading-relaxed text-[color:var(--text-muted)]">
        {children}
      </div>
    </motion.div>
  )
}
