import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MemoryStick, Layers, Box, AlertTriangle } from 'lucide-react'
import { useProcessStore } from '../store/processStore'
import { useMemoryStore } from '../store/memoryStore'
import { allocatePages, computeInternalFragmentation, initializeFrames } from '../engine/memory'
import type { MemoryState } from '../engine/memory/types'
import MemoryConfig from '../components/memory/MemoryConfig'
import MemoryGrid from '../components/memory/MemoryGrid'
import PageTable from '../components/memory/PageTable'

export default function MemoryPage() {
  const processes = useProcessStore((s) => s.processes)
  const { frames: numFrames, totalMemory, pageSize } = useMemoryStore()

  const [memState, setMemState] = useState<MemoryState | null>(null)

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
      <h1 className="text-xl font-bold text-gray-100 sm:text-2xl">Memoria</h1>

      {processes.length === 0 ? (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-10 text-center">
          <p className="text-gray-400">
            Primero agrega procesos en la pantalla de Captura.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
            <MemoryConfig />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 lg:gap-3">
              {cards.map((c) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center rounded-xl border border-gray-700 bg-gray-900 px-4 py-4"
                >
                  <span className={c.accent}>{c.icon}</span>
                  <span className={`mt-1 text-xl font-bold ${c.accent}`}>{c.value}</span>
                  <span className="text-[11px] text-gray-500">{c.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={handleAllocate}
              className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 sm:w-auto"
            >
              Asignar páginas
            </button>
          </div>

          <MemoryGrid frames={currentFrames} />

          {memState && (
            <PageTable pageTables={memState.pageTables} pids={pids} />
          )}
        </>
      )}
    </div>
  )
}
