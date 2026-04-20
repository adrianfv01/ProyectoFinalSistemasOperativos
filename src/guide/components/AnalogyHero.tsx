import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface AnalogyHeroProps {
  icon: LucideIcon
  title: string
  body: string
  accent?: string
}

export default function AnalogyHero({
  icon: Icon,
  title,
  body,
  accent,
}: AnalogyHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="surface-card relative overflow-hidden p-6 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[color:var(--accent-soft)] opacity-80 blur-[80px]"
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-[0.18] ${
          accent ?? 'from-[color:var(--accent)] via-transparent to-transparent'
        }`}
      />
      <div className="relative flex flex-col items-center gap-4 text-center">
        <motion.div
          initial={{ scale: 0.7, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)] backdrop-blur-sm"
        >
          <Icon className="h-8 w-8 text-[color:var(--accent)]" strokeWidth={1.8} />
        </motion.div>
        <h2 className="text-balance text-[22px] font-bold leading-tight tracking-tight text-[color:var(--text)] sm:text-[26px]">
          {title}
        </h2>
        <p className="max-w-2xl text-pretty text-[14px] leading-relaxed text-[color:var(--text-muted)] sm:text-[15px]">
          {body}
        </p>
      </div>
    </motion.div>
  )
}
