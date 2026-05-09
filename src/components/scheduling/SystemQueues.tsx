import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hourglass, Zap, CheckCircle2 } from 'lucide-react'
import { useSchedulingStore } from '../../store/schedulingStore'
import { useProcessStore } from '../../store/processStore'
import { getProcessColor } from '../../utils/colors'

interface QueueColumnProps {
  title: string
  description: string
  icon: React.ElementType
  pids: number[]
  tone: 'amber' | 'sky' | 'emerald'
  empty: string
}

const TONE_STYLES: Record<
  QueueColumnProps['tone'],
  { border: string; bg: string; text: string }
> = {
  amber: {
    border: 'border-amber-300/30',
    bg: 'bg-amber-300/5',
    text: 'text-amber-300',
  },
  sky: {
    border: 'border-sky-300/30',
    bg: 'bg-sky-300/5',
    text: 'text-sky-300',
  },
  emerald: {
    border: 'border-emerald-300/30',
    bg: 'bg-emerald-300/5',
    text: 'text-emerald-300',
  },
}

function QueueColumn({
  title,
  description,
  icon: Icon,
  pids,
  tone,
  empty,
}: QueueColumnProps) {
  const styles = TONE_STYLES[tone]
  return (
    <div
      className={`rounded-xl border ${styles.border} ${styles.bg} p-3`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span
          className={`flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] ${styles.text}`}
        >
          <Icon size={12} />
          {title}
        </span>
        <span
          className={`rounded-full border ${styles.border} bg-[color:var(--surface)] px-1.5 py-0.5 font-mono text-[10px] tabular-nums ${styles.text}`}
        >
          {pids.length}
        </span>
      </div>
      <p className="mb-2 text-[11px] leading-snug text-[color:var(--text-faint)]">
        {description}
      </p>
      <div className="flex min-h-[40px] flex-wrap gap-1.5">
        <AnimatePresence mode="popLayout">
          {pids.length === 0 ? (
            <motion.span
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[12px] text-[color:var(--text-faint)]"
            >
              {empty}
            </motion.span>
          ) : (
            pids.map((pid) => (
              <motion.span
                key={pid}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                style={{ backgroundColor: getProcessColor(pid) }}
                className="inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
              >
                P{pid}
              </motion.span>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function SystemQueues() {
  const { result, currentStep } = useSchedulingStore()
  const processes = useProcessStore((s) => s.processes)
  const timeline = result?.timeline ?? []

  const currentTime = useMemo(() => {
    if (timeline.length === 0) return 0
    return currentStep < timeline.length
      ? timeline[currentStep].start
      : timeline[timeline.length - 1].end
  }, [timeline, currentStep])

  const { waiting, ready, terminated } = useMemo(() => {
    const waitingPids: number[] = []
    const readyPids: number[] = []
    const terminatedPids: number[] = []

    if (timeline.length === 0) {
      return {
        waiting: waitingPids,
        ready: readyPids,
        terminated: terminatedPids,
      }
    }

    const current = timeline[Math.min(currentStep, timeline.length - 1)]
    const runningPid = current ? current.pid : null

    const completionByPid = new Map<number, number>()
    for (const slice of timeline) {
      const prev = completionByPid.get(slice.pid) ?? 0
      if (slice.end > prev) completionByPid.set(slice.pid, slice.end)
    }

    for (const p of processes) {
      const completedAt = completionByPid.get(p.pid)
      const isCompleted =
        completedAt !== undefined && completedAt <= currentTime

      if (isCompleted) {
        terminatedPids.push(p.pid)
        continue
      }

      if (p.arrivalTime > currentTime) {
        waitingPids.push(p.pid)
        continue
      }

      if (p.pid === runningPid && current && current.start === currentTime) {
        continue
      }

      readyPids.push(p.pid)
    }

    return {
      waiting: waitingPids,
      ready: readyPids,
      terminated: terminatedPids,
    }
  }, [processes, timeline, currentStep, currentTime])

  return (
    <div className="surface-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold tracking-tight text-[color:var(--text)]">
          Colas del sistema
        </h2>
        <span className="font-mono text-[11px] tabular-nums text-[color:var(--text-faint)]">
          tiempo {currentTime}
        </span>
      </div>

      <p className="mb-3 text-[12px] leading-relaxed text-[color:var(--text-muted)]">
        Cómo se distribuyen tus procesos entre las distintas colas del sistema
        en este momento. Los procesos viajan de "espera de admisión" a "listos"
        cuando llega su tiempo de arribo, y a "terminados" cuando completan su
        ráfaga.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        <QueueColumn
          title="Espera de admisión"
          description="Procesos que aún no han llegado al sistema (arrival time > tiempo actual). Equivale a la cola de bloqueados/espera en este simulador puro de CPU."
          icon={Hourglass}
          pids={waiting}
          tone="sky"
          empty="Ninguno por llegar"
        />
        <QueueColumn
          title="Cola de listos"
          description="Ya llegaron, no están corriendo y no han terminado. El planificador elige de aquí al siguiente para usar la CPU."
          icon={Zap}
          pids={ready}
          tone="amber"
          empty="Sin procesos en espera"
        />
        <QueueColumn
          title="Terminados"
          description="Procesos cuyo completion time es menor o igual al tiempo actual. Ya no compiten por la CPU."
          icon={CheckCircle2}
          pids={terminated}
          tone="emerald"
          empty="Ninguno aún"
        />
      </div>

      <p className="mt-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] p-2.5 text-[11px] leading-snug text-[color:var(--text-muted)]">
        <strong className="text-[color:var(--text)]">Nota:</strong> el simulador
        modela tareas con ráfaga de CPU pura. La cola de "Bloqueados por E/S"
        se aproxima como espera de admisión porque no hay operaciones de
        entrada/salida en este modelo.
      </p>
    </div>
  )
}
