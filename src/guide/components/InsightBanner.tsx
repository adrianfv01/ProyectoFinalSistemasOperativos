import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface InsightBannerProps {
  title?: string
  body: string
}

export default function InsightBanner({
  title = 'Lo que acabas de ver',
  body,
}: InsightBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="surface-glass relative overflow-hidden rounded-2xl p-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[color:var(--accent-soft)] opacity-70 blur-[60px]"
      />
      <div className="relative">
        <div className="mb-2 flex items-center gap-2 text-[color:var(--accent)]">
          <Sparkles className="h-4 w-4" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
            {title}
          </span>
        </div>
        <p className="text-pretty text-[14px] leading-relaxed text-[color:var(--text)]">{body}</p>
      </div>
    </motion.div>
  )
}
