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
      className="rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/10 p-4"
    >
      <div className="mb-1.5 flex items-center gap-2 text-indigo-300">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          {title}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-gray-100">{body}</p>
    </motion.div>
  )
}
