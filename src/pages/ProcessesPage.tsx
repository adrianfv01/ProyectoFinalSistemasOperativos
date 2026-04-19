import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { useProcessStore } from '../store/processStore'
import ProcessForm from '../components/processes/ProcessForm'
import ProcessTable from '../components/processes/ProcessTable'
import StateDiagram from '../components/processes/StateDiagram'
import ThreadManager from '../components/processes/ThreadManager'
import BottomSheet from '../components/ui/BottomSheet'
import Fab from '../components/ui/Fab'
import Modal from '../components/ui/Modal'

export default function ProcessesPage() {
  const processes = useProcessStore((s) => s.processes)
  const clearAll = useProcessStore((s) => s.clearAll)
  const [selectedPid, setSelectedPid] = useState<number | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const effectivePid = processes.find((p) => p.pid === selectedPid)
    ? selectedPid
    : processes[0]?.pid ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h1 className="hidden text-xl font-bold text-gray-100 sm:block sm:text-2xl lg:block">
            Captura de Procesos
          </h1>
          <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
            {processes.length} {processes.length === 1 ? 'proceso' : 'procesos'}
          </span>
        </div>
        {processes.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-red-500/30 px-3 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <Trash2 size={14} />
            Limpiar todo
          </button>
        )}
      </div>

      <div className="hidden lg:block">
        <ProcessForm />
      </div>

      <ProcessTable selectedPid={effectivePid} onSelectPid={setSelectedPid} />

      {processes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StateDiagram selectedPid={effectivePid} />
          <ThreadManager selectedPid={effectivePid} />
        </div>
      )}

      <Fab
        onClick={() => setAddOpen(true)}
        icon={<Plus size={24} />}
        label="Agregar proceso"
      />

      <BottomSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Nuevo proceso"
      >
        <ProcessForm variant="plain" onCreated={() => setAddOpen(false)} />
      </BottomSheet>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Limpiar todos los procesos"
        description="Se eliminarán todos los procesos y sus hilos. Esta acción no se puede deshacer."
        actions={
          <>
            <button
              onClick={() => setConfirmClear(false)}
              className="h-11 rounded-xl border border-gray-700 px-4 text-sm font-medium text-gray-300 transition active:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                clearAll()
                setConfirmClear(false)
              }}
              className="h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition active:scale-[0.98]"
            >
              Limpiar todo
            </button>
          </>
        }
      />
    </div>
  )
}
