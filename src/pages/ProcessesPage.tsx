import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useProcessStore } from '../store/processStore'
import ProcessForm from '../components/processes/ProcessForm'
import FileUpload from '../components/processes/FileUpload'
import ProcessTable from '../components/processes/ProcessTable'
import StateDiagram from '../components/processes/StateDiagram'
import ThreadManager from '../components/processes/ThreadManager'
import type { MemoryConfig } from '../utils/fileParser'

export default function ProcessesPage() {
  const processes = useProcessStore((s) => s.processes)
  const clearAll = useProcessStore((s) => s.clearAll)
  const [selectedPid, setSelectedPid] = useState<number | null>(null)
  const [, setMemoryConfig] = useState<MemoryConfig | null>(null)

  const effectivePid = processes.find((p) => p.pid === selectedPid)
    ? selectedPid
    : processes[0]?.pid ?? null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Captura de Procesos</h1>
        {processes.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <Trash2 size={14} />
            Limpiar todo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProcessForm />
        <FileUpload onMemoryConfig={setMemoryConfig} />
      </div>

      <ProcessTable selectedPid={effectivePid} onSelectPid={setSelectedPid} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StateDiagram selectedPid={effectivePid} />
        <ThreadManager selectedPid={effectivePid} />
      </div>
    </div>
  )
}
