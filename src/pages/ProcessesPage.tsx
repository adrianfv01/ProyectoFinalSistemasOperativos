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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="hidden lg:block">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
            Módulo · Process Manager
          </span>
          <div className="mt-1 flex items-baseline gap-3">
            <h1 className="text-[26px] font-semibold tracking-tight text-[color:var(--text)]">
              Captura de Procesos
            </h1>
            <span className="chip chip-accent">
              {processes.length} {processes.length === 1 ? 'proceso' : 'procesos'}
            </span>
          </div>
        </div>

        <span className="chip chip-accent lg:hidden">
          {processes.length} {processes.length === 1 ? 'proceso' : 'procesos'}
        </span>

        {processes.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-rose-300/30 bg-rose-300/5 px-3 text-[12px] font-medium text-rose-300 transition hover:bg-rose-300/10"
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
            <button onClick={() => setConfirmClear(false)} className="btn-ghost h-11">
              Cancelar
            </button>
            <button
              onClick={() => {
                clearAll()
                setConfirmClear(false)
              }}
              className="btn-danger h-11"
            >
              Limpiar todo
            </button>
          </>
        }
      />
    </div>
  )
}
