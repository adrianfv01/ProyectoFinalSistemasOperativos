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
  new: 'bg-sky-300/20 text-sky-200 border border-sky-300/40',
  ready: 'bg-amber-300/20 text-amber-200 border border-amber-300/40',
  running: 'bg-emerald-300/20 text-emerald-200 border border-emerald-300/40',
  waiting: 'bg-violet-300/20 text-violet-200 border border-violet-300/40',
  terminated: 'bg-rose-300/20 text-rose-200 border border-rose-300/40',
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
    <div className="surface-card space-y-3 p-4">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        Ciclo de vida de un proceso
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {STATES.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <motion.div
              animate={{
                scale: currentState === s.id ? 1.12 : 1,
                opacity: currentState === s.id ? 1 : 0.5,
              }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition ${
                currentState === s.id ? 'shadow-[0_0_0_2px_var(--accent-soft)]' : ''
              } ${STATE_COLORS[s.id]}`}
            >
              <span className="font-mono text-[11px] font-semibold tracking-wide">
                {s.label}
              </span>
            </motion.div>
            {i < STATES.length - 1 && (
              <ArrowRight className="mx-0.5 h-3 w-3 text-[color:var(--border-strong)]" />
            )}
          </div>
        ))}
      </div>

      <div className="relative h-16 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${currentState}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-[color:var(--accent)]" />
            <p className="text-[13px] text-[color:var(--text)]">
              <span className="font-semibold">{currentInfo.label}:</span>{' '}
              <span className="text-[color:var(--text-muted)]">{currentInfo.desc}</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
