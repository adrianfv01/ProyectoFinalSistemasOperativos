import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2, GitFork, Plus, Check, X, MoreVertical } from 'lucide-react'
import { useProcessStore } from '../../store/processStore'
import { getProcessColor } from '../../utils/colors'
import type { Process, ProcessState } from '../../engine/processes/types'
import BottomSheet from '../ui/BottomSheet'
import Modal from '../ui/Modal'

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

const inputClass =
  'w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2.5 text-base text-gray-100 outline-none focus:border-indigo-500'

export default function ProcessTable({ selectedPid, onSelectPid }: Props) {
  const processes = useProcessStore((s) => s.processes)
  const removeProcess = useProcessStore((s) => s.removeProcess)
  const updateProcess = useProcessStore((s) => s.updateProcess)
  const forkProcess = useProcessStore((s) => s.forkProcess)
  const addThread = useProcessStore((s) => s.addThread)

  const [editing, setEditing] = useState<EditState | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [actionsForPid, setActionsForPid] = useState<number | null>(null)
  const [threadForPid, setThreadForPid] = useState<number | null>(null)
  const [threadBurst, setThreadBurst] = useState('')

  function startEdit(p: Process) {
    setEditing({
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      numPages: p.numPages,
    })
    setActionsForPid(null)
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

  function openThreadSheet(pid: number) {
    setThreadForPid(pid)
    setThreadBurst('')
    setActionsForPid(null)
  }

  function confirmAddThread() {
    if (threadForPid === null) return
    const bt = parseInt(threadBurst, 10)
    if (isNaN(bt) || bt <= 0) return
    addThread(threadForPid, bt)
    setThreadForPid(null)
    setThreadBurst('')
  }

  const cellBase = 'px-3 py-2 text-sm'
  const actionsProcess = processes.find((p) => p.pid === actionsForPid)

  return (
    <>
      <div className="space-y-2 lg:hidden">
        <AnimatePresence initial={false}>
          {processes.map((p) => {
            const color = getProcessColor(p.pid)
            const isSelected = selectedPid === p.pid

            return (
              <motion.button
                key={p.pid}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                onClick={() => onSelectPid(p.pid)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
                  isSelected
                    ? 'border-indigo-500/60 bg-indigo-500/10'
                    : 'border-gray-700 bg-gray-900'
                }`}
                data-no-swipe
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  P{p.pid}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-md bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-300"
                    >
                      {STATE_LABELS[p.state]}
                    </span>
                    {p.threads.length > 0 && (
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                        {p.threads.length} hilo{p.threads.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] text-gray-400">
                    <span>
                      Llegada: <span className="font-mono text-gray-200">{p.arrivalTime}</span>
                    </span>
                    <span>
                      Ráfaga: <span className="font-mono text-gray-200">{p.burstTime}</span>
                    </span>
                    <span>
                      Prio.: <span className="font-mono text-gray-200">{p.priority}</span>
                    </span>
                    <span>
                      Págs.: <span className="font-mono text-gray-200">{p.numPages}</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActionsForPid(p.pid)
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-300 transition active:bg-gray-800"
                  aria-label={`Acciones de proceso ${p.pid}`}
                >
                  <MoreVertical size={20} />
                </button>
              </motion.button>
            )
          })}
        </AnimatePresence>

        {processes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/50 px-4 py-10 text-center text-sm text-gray-500">
            Aún no agregas procesos. Toca el botón de la esquina inferior para crear uno.
          </div>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-gray-700 bg-gray-900 lg:block">
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
                              inputMode="numeric"
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
                              inputMode="numeric"
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
                              inputMode="numeric"
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
                              inputMode="numeric"
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
                                  openThreadSheet(p.pid)
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

      <BottomSheet
        open={actionsProcess !== undefined}
        onClose={() => setActionsForPid(null)}
        title={actionsProcess ? `Proceso P${actionsProcess.pid}` : ''}
      >
        {actionsProcess && (
          <div className="grid gap-2">
            <SheetAction
              icon={<Pencil size={18} />}
              label="Editar parámetros"
              onClick={() => startEdit(actionsProcess)}
              accent="text-indigo-300"
            />
            <SheetAction
              icon={<Plus size={18} />}
              label="Agregar hilo"
              onClick={() => openThreadSheet(actionsProcess.pid)}
              accent="text-emerald-300"
            />
            <SheetAction
              icon={<GitFork size={18} />}
              label="Crear copia (fork)"
              onClick={() => {
                forkProcess(actionsProcess.pid)
                setActionsForPid(null)
              }}
              accent="text-amber-300"
            />
            <SheetAction
              icon={<Trash2 size={18} />}
              label="Eliminar proceso"
              onClick={() => {
                setActionsForPid(null)
                setConfirmDelete(actionsProcess.pid)
              }}
              accent="text-red-300"
            />
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Editar P${editing.pid}` : ''}
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Llegada"
                value={editing.arrivalTime}
                min={0}
                onChange={(v) => setEditing({ ...editing, arrivalTime: v })}
              />
              <NumberField
                label="Ráfaga"
                value={editing.burstTime}
                min={1}
                onChange={(v) => setEditing({ ...editing, burstTime: v })}
              />
              <NumberField
                label="Prioridad"
                value={editing.priority}
                min={0}
                onChange={(v) => setEditing({ ...editing, priority: v })}
              />
              <NumberField
                label="Páginas"
                value={editing.numPages}
                min={0}
                onChange={(v) => setEditing({ ...editing, numPages: v })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={saveEdit}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition active:scale-[0.98]"
              >
                <Check size={18} />
                Guardar cambios
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex h-11 items-center justify-center rounded-xl border border-gray-700 text-sm font-medium text-gray-300 transition active:bg-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        open={threadForPid !== null}
        onClose={() => setThreadForPid(null)}
        title={threadForPid !== null ? `Agregar hilo a P${threadForPid}` : ''}
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Tiempo de ráfaga del hilo</span>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              value={threadBurst}
              onChange={(e) => setThreadBurst(e.target.value)}
              placeholder="Ej. 4"
              className={inputClass}
              autoFocus
            />
          </label>
          <button
            onClick={confirmAddThread}
            disabled={!threadBurst || parseInt(threadBurst, 10) <= 0}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
          >
            <Plus size={18} />
            Agregar hilo
          </button>
        </div>
      </BottomSheet>

      <Modal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Eliminar proceso"
        description={
          confirmDelete !== null
            ? `Se eliminará P${confirmDelete} junto con sus hilos. Esta acción no se puede deshacer.`
            : ''
        }
        actions={
          <>
            <button
              onClick={() => setConfirmDelete(null)}
              className="h-11 rounded-xl border border-gray-700 px-4 text-sm font-medium text-gray-300 transition active:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (confirmDelete !== null) removeProcess(confirmDelete)
                setConfirmDelete(null)
              }}
              className="h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98]"
            >
              Eliminar
            </button>
          </>
        }
      />
    </>
  )
}

function SheetAction({
  icon,
  label,
  onClick,
  accent,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  accent: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-14 items-center gap-3 rounded-2xl border border-gray-700 bg-gray-800/60 px-4 text-left transition active:bg-gray-800"
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 ${accent}`}>
        {icon}
      </span>
      <span className="text-sm font-medium text-gray-100">{label}</span>
    </button>
  )
}

function NumberField({
  label,
  value,
  min,
  onChange,
}: {
  label: string
  value: number
  min: number
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-400">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min={min}
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10)
          if (!isNaN(v)) onChange(Math.max(min, v))
        }}
        className={inputClass}
      />
    </label>
  )
}
