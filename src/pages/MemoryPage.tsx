import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MemoryStick, Layers, Box, AlertTriangle, Settings } from 'lucide-react'
import { useProcessStore } from '../store/processStore'
import { useMemoryStore } from '../store/memoryStore'
import { allocatePages, computeInternalFragmentation, initializeFrames } from '../engine/memory'
import type { MemoryState } from '../engine/memory/types'
import MemoryConfig from '../components/memory/MemoryConfig'
import MemoryGrid from '../components/memory/MemoryGrid'
import PageTable from '../components/memory/PageTable'
import BottomSheet from '../components/ui/BottomSheet'
import StickyActionBar from '../components/ui/StickyActionBar'

export default function MemoryPage() {
  const processes = useProcessStore((s) => s.processes)
  const { frames: numFrames, totalMemory, pageSize } = useMemoryStore()

  const [memState, setMemState] = useState<MemoryState | null>(null)
  const [configOpen, setConfigOpen] = useState(false)

  const emptyFrames = useMemo(() => initializeFrames(numFrames), [numFrames])

  const currentFrames = memState?.frames ?? emptyFrames
  const usedCount = currentFrames.filter((f) => f.pid !== null).length
  const freeCount = currentFrames.length - usedCount
  const fragmentation = memState
    ? computeInternalFragmentation(totalMemory, pageSize, processes)
    : 0
  const pids = memState ? Array.from(memState.pageTables.keys()) : []

  function handleAllocate() {
    if (processes.length === 0) return
    const result = allocatePages(processes, numFrames)
    result.internalFragmentation = computeInternalFragmentation(totalMemory, pageSize, processes)
    setMemState(result)
  }

  const cards = [
    {
      label: 'Total marcos',
      value: numFrames,
      icon: <Layers size={18} />,
      accent: 'text-indigo-400',
    },
    {
      label: 'Marcos usados',
      value: usedCount,
      icon: <Box size={18} />,
      accent: 'text-emerald-400',
    },
    {
      label: 'Marcos libres',
      value: freeCount,
      icon: <MemoryStick size={18} />,
      accent: 'text-sky-400',
    },
    {
      label: 'Fragmentación interna',
      value: `${fragmentation} KB`,
      icon: <AlertTriangle size={18} />,
      accent: 'text-amber-400',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="hidden items-end justify-between lg:flex">
        <div>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
            Módulo · Memory
          </span>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-[color:var(--text)]">
            Memoria
          </h1>
        </div>
      </div>

      {processes.length === 0 ? (
        <div className="surface-glass p-10 text-center">
          <p className="text-[13px] text-[color:var(--text-muted)]">
            Primero agrega procesos en la pantalla de Captura.
          </p>
        </div>
      ) : (
        <>
          <button
            onClick={() => setConfigOpen(true)}
            className="surface-card flex w-full items-center justify-between p-4 text-left transition hover:border-[color:var(--accent)]/30 active:scale-[0.99] lg:hidden"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] text-[color:var(--accent)]">
                <Settings size={18} />
              </span>
              <div>
                <p className="text-[13.5px] font-semibold text-[color:var(--text)]">
                  Configurar memoria
                </p>
                <p className="font-mono text-[11px] text-[color:var(--text-muted)]">
                  {totalMemory} KB · página {pageSize} KB · {numFrames} marcos
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[color:var(--accent)]">
              Editar
            </span>
          </button>

          <div className="hidden lg:grid lg:grid-cols-[1fr_auto] lg:gap-5">
            <MemoryConfig />

            <div className="grid grid-cols-2 gap-3 lg:gap-3">
              {cards.map((c) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="surface-card flex flex-col items-center justify-center px-4 py-4"
                >
                  <span className={c.accent}>{c.icon}</span>
                  <span className={`mt-1 font-mono text-[22px] font-semibold tabular-nums ${c.accent}`}>
                    {c.value}
                  </span>
                  <span className="text-[11px] text-[color:var(--text-muted)]">
                    {c.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:hidden">
            {cards.map((c) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="surface-card flex flex-col items-center justify-center px-3 py-3 text-center"
              >
                <span className={c.accent}>{c.icon}</span>
                <span className={`mt-1 font-mono text-[18px] font-semibold tabular-nums ${c.accent}`}>
                  {c.value}
                </span>
                <span className="text-[11px] text-[color:var(--text-muted)]">
                  {c.label}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="hidden lg:block">
            <button onClick={handleAllocate} className="btn-primary">
              Asignar páginas
            </button>
          </div>

          <MemoryGrid frames={currentFrames} />

          {memState && <PageTable pageTables={memState.pageTables} pids={pids} />}

          <StickyActionBar>
            <button onClick={handleAllocate} className="btn-primary h-12 w-full">
              Asignar páginas
            </button>
          </StickyActionBar>

          <BottomSheet
            open={configOpen}
            onClose={() => setConfigOpen(false)}
            title="Configuración de memoria"
          >
            <MemoryConfig variant="plain" onApplied={() => setConfigOpen(false)} />
          </BottomSheet>
        </>
      )}
    </div>
  )
}
