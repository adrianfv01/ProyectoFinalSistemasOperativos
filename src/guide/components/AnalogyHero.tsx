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
  accent = 'from-indigo-500/30 to-fuchsia-500/20',
}: AnalogyHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl border border-gray-700/60 bg-gradient-to-br ${accent} p-5 sm:p-6`}
    >
      <div className="relative flex flex-col items-center gap-3 text-center">
        <motion.div
          initial={{ scale: 0.7, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="rounded-full bg-gray-950/50 p-4 ring-2 ring-white/10 backdrop-blur-sm"
        >
          <Icon className="h-9 w-9 text-white" strokeWidth={2} />
        </motion.div>
        <h2 className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl">
          {title}
        </h2>
        <p className="text-pretty text-sm leading-relaxed text-gray-100/90 sm:text-base">
          {body}
        </p>
      </div>
    </motion.div>
  )
}
