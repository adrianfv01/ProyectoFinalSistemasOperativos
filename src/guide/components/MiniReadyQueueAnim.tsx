import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, ArrowRight } from 'lucide-react'
import { getProcessColor } from '../../utils/colors'
import ComponentLegend from './ComponentLegend'

interface QueueEvent {
  arriving: number[]
  ready: number[]
  running: number | null
  done: number[]
  caption: string
}

const SEQUENCE: QueueEvent[] = [
  {
    arriving: [1, 2, 3],
    ready: [],
    running: null,
    done: [],
    caption: 'Llegan tres procesos al sistema (P1, P2, P3).',
  },
  {
    arriving: [],
    ready: [1, 2, 3],
    running: null,
    done: [],
    caption: 'Pasan a la cola de listos en el orden en que llegaron.',
  },
  {
    arriving: [],
    ready: [2, 3],
    running: 1,
    done: [],
    caption: 'El planificador toma a P1 de la cola y lo manda a la CPU.',
  },
  {
    arriving: [],
    ready: [3],
    running: 2,
    done: [1],
    caption: 'P1 termina su ráfaga. Le toca a P2 ocupar la CPU.',
  },
  {
    arriving: [],
    ready: [],
    running: 3,
    done: [1, 2],
    caption: 'P2 también termina. P3 entra a la CPU.',
  },
  {
    arriving: [],
    ready: [],
    running: null,
    done: [1, 2, 3],
    caption: 'Todos los procesos terminaron. La cola y la CPU quedan libres.',
  },
]

function Chip({ pid }: { pid: number }) {
  return (
    <motion.span
      key={pid}
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 22 }}
      style={{ backgroundColor: getProcessColor(pid) }}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
    >
      P{pid}
    </motion.span>
  )
}

export default function MiniReadyQueueAnim() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % SEQUENCE.length)
    }, 1900)
    return () => clearInterval(id)
  }, [])

  const ev = SEQUENCE[step]

  return (
    <div className="space-y-2">
      <div className="surface-card space-y-3 p-4">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
          Recorrido por las colas
        </p>

        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <div className="rounded-xl border border-sky-300/30 bg-sky-300/5 p-3">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-sky-300">
              Llegando
            </p>
            <div className="flex min-h-[28px] flex-wrap gap-1.5">
              <AnimatePresence mode="popLayout">
                {ev.arriving.length === 0 ? (
                  <span className="text-[11px] text-[color:var(--text-faint)]">—</span>
                ) : (
                  ev.arriving.map((pid) => <Chip key={pid} pid={pid} />)
                )}
              </AnimatePresence>
            </div>
          </div>

          <ArrowRight className="hidden self-center text-[color:var(--text-faint)] md:block" size={14} />

          <div className="rounded-xl border border-amber-300/30 bg-amber-300/5 p-3">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-300">
              Cola de listos
            </p>
            <div className="flex min-h-[28px] flex-wrap gap-1.5">
              <AnimatePresence mode="popLayout">
                {ev.ready.length === 0 ? (
                  <span className="text-[11px] text-[color:var(--text-faint)]">vacía</span>
                ) : (
                  ev.ready.map((pid) => <Chip key={pid} pid={pid} />)
                )}
              </AnimatePresence>
            </div>
          </div>

          <ArrowRight className="hidden self-center text-[color:var(--text-faint)] md:block" size={14} />

          <div className="rounded-xl border border-emerald-300/30 bg-emerald-300/5 p-3">
            <p className="mb-1.5 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300">
              <Cpu size={11} /> CPU
            </p>
            <div className="flex min-h-[28px] flex-wrap gap-1.5">
              <AnimatePresence mode="wait">
                {ev.running === null ? (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] text-[color:var(--text-faint)]"
                  >
                    inactiva
                  </motion.span>
                ) : (
                  <Chip key={`running-${ev.running}`} pid={ev.running} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {ev.done.length > 0 && (
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-2.5">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
              Terminados
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ev.done.map((pid) => (
                <Chip key={pid} pid={pid} />
              ))}
            </div>
          </div>
        )}

        <p className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-2 text-[12px] leading-relaxed text-[color:var(--text)]">
          {ev.caption}
        </p>
      </div>

      <ComponentLegend
        items={[
          {
            label: 'Caja "Llegando"',
            description:
              'Procesos que acaban de aparecer (su tiempo de llegada coincide con el reloj actual).',
          },
          {
            label: 'Caja "Cola de listos"',
            description:
              'La fila de espera. Pueden correr pero la CPU está ocupada o aún no es su turno.',
          },
          {
            label: 'Caja "CPU"',
            description:
              'El proceso elegido por el algoritmo. Solo uno a la vez por núcleo.',
          },
          {
            label: 'Caja "Terminados"',
            description: 'Procesos que ya completaron su ráfaga.',
          },
        ]}
      />
    </div>
  )
}
