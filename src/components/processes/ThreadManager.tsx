import { useState } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { Plus, X, Cpu, Trash2 } from 'lucide-react'
import { useProcessStore } from '../../store/processStore'
import { getProcessColor } from '../../utils/colors'
import { useIsMobile } from '../../utils/useIsMobile'
import type { ProcessState } from '../../engine/processes/types'

const STATE_LABELS: Record<ProcessState, string> = {
  new: 'Nuevo',
  ready: 'Listo',
  running: 'Ejecución',
  waiting: 'Espera',
  terminated: 'Terminado',
}

interface Props {
  selectedPid: number | null
}

export default function ThreadManager({ selectedPid }: Props) {
  const processes = useProcessStore((s) => s.processes)
  const addThread = useProcessStore((s) => s.addThread)
  const removeThread = useProcessStore((s) => s.removeThread)
  const isMobile = useIsMobile()

  const [burstInput, setBurstInput] = useState('')
  const [showForm, setShowForm] = useState(false)

  const process = processes.find((p) => p.pid === selectedPid) ?? processes[0]
  const color = process ? getProcessColor(process.pid) : '#6366f1'

  function handleAdd() {
    if (!process) return
    const bt = parseInt(burstInput, 10)
    if (isNaN(bt) || bt <= 0) return
    addThread(process.pid, bt)
    setBurstInput('')
    setShowForm(false)
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Hilos</h2>
        {process && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: color }}
          >
            PID {process.pid}
          </span>
        )}
      </div>

      {!process ? (
        <p className="py-6 text-center text-sm text-gray-500">
          Selecciona un proceso para ver sus hilos.
        </p>
      ) : (
        <>
          <AnimatePresence initial={false}>
            {process.threads.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4 text-center text-sm text-gray-500"
              >
                Este proceso no tiene hilos.
              </motion.p>
            )}
            {process.threads.map((t) => (
              <ThreadRow
                key={t.tid}
                tid={t.tid}
                burstTime={t.burstTime}
                remainingTime={t.remainingTime}
                stateLabel={STATE_LABELS[t.state]}
                isMobile={isMobile}
                onRemove={() => removeThread(process.pid, t.tid)}
              />
            ))}
          </AnimatePresence>

          {showForm ? (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                placeholder="Ráfaga del hilo"
                value={burstInput}
                onChange={(e) => setBurstInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="h-11 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 text-base text-gray-100 outline-none focus:border-indigo-500 sm:h-9 sm:w-32 sm:text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex h-11 flex-1 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98] sm:h-9 sm:flex-none"
                >
                  Agregar
                </button>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setBurstInput('')
                  }}
                  className="h-11 rounded-lg border border-gray-700 px-4 text-sm font-medium text-gray-300 transition active:bg-gray-800 sm:h-9"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-600 text-sm text-gray-400 transition hover:border-gray-500 hover:text-gray-300 sm:h-10"
            >
              <Plus size={16} />
              Agregar hilo
            </button>
          )}
        </>
      )}
    </div>
  )
}

interface ThreadRowProps {
  tid: number
  burstTime: number
  remainingTime: number
  stateLabel: string
  isMobile: boolean
  onRemove: () => void
}

function ThreadRow({
  tid,
  burstTime,
  remainingTime,
  stateLabel,
  isMobile,
  onRemove,
}: ThreadRowProps) {
  const [dragX, setDragX] = useState(0)

  function handleDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x < -100) onRemove()
    setDragX(0)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -120 }}
      transition={{ duration: 0.18 }}
      className="relative mb-2 overflow-hidden rounded-lg"
      data-no-swipe
    >
      <div className="absolute inset-y-0 right-0 flex items-center bg-red-500/20 px-4 text-red-300">
        <Trash2 size={16} />
      </div>

      <motion.div
        drag={isMobile ? 'x' : false}
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.05}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={{ x: dragX }}
        className="flex items-center justify-between border border-gray-700 bg-gray-800 px-3 py-2.5"
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Cpu size={14} className="shrink-0 text-gray-500" />
          <span className="text-sm font-medium text-gray-200">TID {tid}</span>
          <span className="text-xs text-gray-400">
            Ráfaga: {burstTime} / Rest.: {remainingTime}
          </span>
          <span className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400">
            {stateLabel}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-700 hover:text-red-400"
          aria-label={`Eliminar hilo ${tid}`}
        >
          <X size={16} />
        </button>
      </motion.div>
    </motion.div>
  )
}
