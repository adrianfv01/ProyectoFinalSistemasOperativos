import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Cpu } from 'lucide-react'
import { useProcessStore } from '../../store/processStore'
import { getProcessColor } from '../../utils/colors'
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
              <motion.div
                key={t.tid}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="mb-2 flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-3 py-2"
              >
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <Cpu size={14} className="shrink-0 text-gray-500" />
                  <span className="text-sm font-medium text-gray-200">TID {t.tid}</span>
                  <span className="text-xs text-gray-400">
                    Ráfaga: {t.burstTime} / Rest.: {t.remainingTime}
                  </span>
                  <span className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400">
                    {STATE_LABELS[t.state]}
                  </span>
                </div>
                <button
                  onClick={() => removeThread(process.pid, t.tid)}
                  className="rounded p-1 text-gray-500 transition hover:bg-gray-700 hover:text-red-400"
                  title="Eliminar hilo"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {showForm ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={1}
                placeholder="Ráfaga"
                value={burstInput}
                onChange={(e) => setBurstInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="w-24 rounded-lg border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                onClick={handleAdd}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
              >
                Agregar
              </button>
              <button
                onClick={() => {
                  setShowForm(false)
                  setBurstInput('')
                }}
                className="rounded-lg px-2 py-1.5 text-xs text-gray-400 transition hover:bg-gray-800"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-600 py-2 text-xs text-gray-400 transition hover:border-gray-500 hover:text-gray-300"
            >
              <Plus size={14} />
              Agregar hilo
            </button>
          )}
        </>
      )}
    </div>
  )
}
