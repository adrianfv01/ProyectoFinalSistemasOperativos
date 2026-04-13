import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2, GitFork, Plus, Check, X } from 'lucide-react'
import { useProcessStore } from '../../store/processStore'
import { getProcessColor } from '../../utils/colors'
import type { Process, ProcessState } from '../../engine/processes/types'

const STATE_LABELS: Record<ProcessState, string> = {
  new: 'Nuevo',
  ready: 'Listo',
  running: 'Ejecución',
  waiting: 'Espera',
  terminated: 'Terminado',
}

interface Props {
  selectedPid: number | null
  onSelectPid: (pid: number) => void
}

interface EditState {
  pid: number
  arrivalTime: number
  burstTime: number
  priority: number
  numPages: number
}

export default function ProcessTable({ selectedPid, onSelectPid }: Props) {
  const processes = useProcessStore((s) => s.processes)
  const removeProcess = useProcessStore((s) => s.removeProcess)
  const updateProcess = useProcessStore((s) => s.updateProcess)
  const forkProcess = useProcessStore((s) => s.forkProcess)
  const addThread = useProcessStore((s) => s.addThread)

  const [editing, setEditing] = useState<EditState | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  function startEdit(p: Process) {
    setEditing({
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      numPages: p.numPages,
    })
  }

  function saveEdit() {
    if (!editing) return
    if (editing.burstTime <= 0) return
    updateProcess(editing.pid, {
      arrivalTime: editing.arrivalTime,
      burstTime: editing.burstTime,
      priority: editing.priority,
      numPages: editing.numPages,
    })
    setEditing(null)
  }

  function handleAddThread(pid: number) {
    const input = prompt('Ráfaga del hilo:')
    if (!input) return
    const bt = parseInt(input, 10)
    if (isNaN(bt) || bt <= 0) return
    addThread(pid, bt)
  }

  const cellBase = 'px-3 py-2 text-sm'

  return (
    <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/60 text-xs font-medium uppercase tracking-wider text-gray-400">
              <th className="px-3 py-3">PID</th>
              <th className="px-3 py-3">Llegada</th>
              <th className="px-3 py-3">Ráfaga</th>
              <th className="px-3 py-3">Prioridad</th>
              <th className="px-3 py-3">Páginas</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Hilos</th>
              <th className="px-3 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {processes.map((p) => {
                const color = getProcessColor(p.pid)
                const isEditing = editing?.pid === p.pid
                const isSelected = selectedPid === p.pid

                return (
                  <motion.tr
                    key={p.pid}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelectPid(p.pid)}
                    className={`cursor-pointer border-b border-gray-800 transition-colors ${
                      isSelected ? 'bg-indigo-500/10' : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <td className={cellBase}>
                      <span
                        className="inline-flex min-w-[2rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {p.pid}
                      </span>
                    </td>

                    {isEditing ? (
                      <>
                        <td className={cellBase}>
                          <input
                            type="number"
                            min={0}
                            value={editing.arrivalTime}
                            onChange={(e) =>
                              setEditing({ ...editing, arrivalTime: parseInt(e.target.value) || 0 })
                            }
                            className="w-16 rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 outline-none focus:border-indigo-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className={cellBase}>
                          <input
                            type="number"
                            min={1}
                            value={editing.burstTime}
                            onChange={(e) =>
                              setEditing({ ...editing, burstTime: parseInt(e.target.value) || 1 })
                            }
                            className="w-16 rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 outline-none focus:border-indigo-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className={cellBase}>
                          <input
                            type="number"
                            min={0}
                            value={editing.priority}
                            onChange={(e) =>
                              setEditing({ ...editing, priority: parseInt(e.target.value) || 0 })
                            }
                            className="w-16 rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 outline-none focus:border-indigo-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className={cellBase}>
                          <input
                            type="number"
                            min={0}
                            value={editing.numPages}
                            onChange={(e) =>
                              setEditing({ ...editing, numPages: parseInt(e.target.value) || 0 })
                            }
                            className="w-16 rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 outline-none focus:border-indigo-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={`${cellBase} text-gray-300`}>{p.arrivalTime}</td>
                        <td className={`${cellBase} text-gray-300`}>{p.burstTime}</td>
                        <td className={`${cellBase} text-gray-300`}>{p.priority}</td>
                        <td className={`${cellBase} text-gray-300`}>{p.numPages}</td>
                      </>
                    )}

                    <td className={cellBase}>
                      <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                        {STATE_LABELS[p.state]}
                      </span>
                    </td>

                    <td className={`${cellBase} text-center text-gray-300`}>
                      {p.threads.length}
                    </td>

                    <td className={`${cellBase} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                saveEdit()
                              }}
                              className="rounded p-1 text-emerald-400 transition hover:bg-emerald-400/10"
                              title="Guardar"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditing(null)
                              }}
                              className="rounded p-1 text-gray-400 transition hover:bg-gray-700"
                              title="Cancelar"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                startEdit(p)
                              }}
                              className="rounded p-1 text-gray-400 transition hover:bg-gray-700 hover:text-indigo-400"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>

                            {confirmDelete === p.pid ? (
                              <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    removeProcess(p.pid)
                                    setConfirmDelete(null)
                                  }}
                                  className="rounded p-1 text-red-400 transition hover:bg-red-400/10"
                                  title="Confirmar"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="rounded p-1 text-gray-400 transition hover:bg-gray-700"
                                  title="Cancelar"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setConfirmDelete(p.pid)
                                }}
                                className="rounded p-1 text-gray-400 transition hover:bg-gray-700 hover:text-red-400"
                                title="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                forkProcess(p.pid)
                              }}
                              className="rounded p-1 text-gray-400 transition hover:bg-gray-700 hover:text-amber-400"
                              title="Fork"
                            >
                              <GitFork size={14} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddThread(p.pid)
                              }}
                              className="rounded p-1 text-gray-400 transition hover:bg-gray-700 hover:text-emerald-400"
                              title="Agregar hilo"
                            >
                              <Plus size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {processes.length === 0 && (
        <div className="py-10 text-center text-sm text-gray-500">
          No hay procesos. Agrega uno o carga un archivo.
        </div>
      )}
    </div>
  )
}
