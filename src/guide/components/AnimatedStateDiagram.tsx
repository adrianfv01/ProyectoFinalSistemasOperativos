import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

const STATES = [
  { id: 'new', label: 'Nuevo', desc: 'Recién creado.' },
  { id: 'ready', label: 'Listo', desc: 'Espera su turno de CPU.' },
  { id: 'running', label: 'Ejecución', desc: 'Está usando la CPU.' },
  { id: 'waiting', label: 'En espera', desc: 'Espera algo (E/S, recurso).' },
  { id: 'terminated', label: 'Terminado', desc: 'Ya acabó su trabajo.' },
] as const

const STATE_COLORS: Record<string, string> = {
  new: 'bg-sky-500',
  ready: 'bg-amber-500',
  running: 'bg-emerald-500',
  waiting: 'bg-violet-500',
  terminated: 'bg-rose-500',
}

const SEQUENCE = ['new', 'ready', 'running', 'waiting', 'ready', 'running', 'terminated'] as const

export default function AnimatedStateDiagram() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % SEQUENCE.length)
    }, 1500)
    return () => clearInterval(id)
  }, [])

  const currentState = SEQUENCE[step]
  const currentInfo = STATES.find((s) => s.id === currentState)!

  return (
    <div className="space-y-3 rounded-xl border border-gray-700 bg-gray-900/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Ciclo de vida de un proceso
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {STATES.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <motion.div
              animate={{
                scale: currentState === s.id ? 1.15 : 1,
                opacity: currentState === s.id ? 1 : 0.55,
              }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              className={`flex flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 ${
                currentState === s.id
                  ? 'ring-2 ring-white/30'
                  : ''
              } ${STATE_COLORS[s.id]}`}
            >
              <span className="text-[11px] font-bold text-white">{s.label}</span>
            </motion.div>
            {i < STATES.length - 1 && (
              <ArrowRight className="mx-0.5 h-3 w-3 text-gray-600" />
            )}
          </div>
        ))}
      </div>

      <div className="relative h-16 overflow-hidden rounded-lg border border-gray-800 bg-gray-950/60 p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${currentState}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
            <p className="text-sm text-gray-200">
              <span className="font-semibold">{currentInfo.label}:</span>{' '}
              <span className="text-gray-400">{currentInfo.desc}</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
