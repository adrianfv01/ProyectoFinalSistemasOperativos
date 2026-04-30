import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitFork, Cpu } from 'lucide-react'
import { useProcessStore } from '../../store/processStore'
import { getProcessColor } from '../../utils/colors'
import type { Process } from '../../engine/processes/types'

interface Props {
  selectedPid: number | null
  onSelectPid?: (pid: number) => void
}

export default function ForkTree({ selectedPid, onSelectPid }: Props) {
  const processes = useProcessStore((s) => s.processes)
  const forkProcess = useProcessStore((s) => s.forkProcess)

  const { roots, childrenOf } = useMemo(() => {
    const childMap = new Map<number, Process[]>()
    const allPids = new Set(processes.map((p) => p.pid))
    for (const p of processes) {
      const parentExists = p.parentPid !== undefined && allPids.has(p.parentPid)
      const key = parentExists ? (p.parentPid as number) : -1
      if (!childMap.has(key)) childMap.set(key, [])
      childMap.get(key)!.push(p)
    }
    return {
      roots: childMap.get(-1) ?? [],
      childrenOf: (pid: number) => childMap.get(pid) ?? [],
    }
  }, [processes])

  if (processes.length === 0) return null

  return (
    <div className="surface-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[color:var(--text)] sm:text-[16px]">
          <GitFork size={16} className="text-[color:var(--accent)]" />
          Árbol de procesos (fork)
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
          padre → hijo
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <ul className="min-w-max space-y-2">
          <AnimatePresence initial={false}>
            {roots.map((root) => (
              <ForkNode
                key={root.pid}
                process={root}
                childrenOf={childrenOf}
                depth={0}
                selectedPid={selectedPid}
                onSelectPid={onSelectPid}
                onFork={forkProcess}
              />
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--text-faint)]">
        Cada hijo hereda la ráfaga, prioridad, páginas e hilos de su padre, igual que <code className="font-mono text-[10px]">fork()</code> en POSIX.
      </p>
    </div>
  )
}

interface NodeProps {
  process: Process
  childrenOf: (pid: number) => Process[]
  depth: number
  selectedPid: number | null
  onSelectPid?: (pid: number) => void
  onFork: (pid: number) => void
}

function ForkNode({
  process,
  childrenOf,
  depth,
  selectedPid,
  onSelectPid,
  onFork,
}: NodeProps) {
  const color = getProcessColor(process.pid)
  const kids = childrenOf(process.pid)
  const isSelected = selectedPid === process.pid

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.18 }}
      className="relative"
    >
      <div className="flex items-center gap-2">
        {depth > 0 && (
          <div
            className="h-px shrink-0 bg-[color:var(--border-strong)]"
            style={{ width: 18 }}
            aria-hidden
          />
        )}

        <button
          type="button"
          onClick={() => onSelectPid?.(process.pid)}
          className={`group flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition active:scale-[0.99] ${
            isSelected
              ? 'border-[color:var(--accent)]/60 bg-[color:var(--accent-soft)]'
              : 'border-[color:var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--accent)]/30'
          }`}
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
            style={{ backgroundColor: color }}
          >
            P{process.pid}
          </span>
          <span className="flex flex-col">
            <span className="font-mono text-[11px] tabular-nums text-[color:var(--text)]">
              ráfaga {process.burstTime} · {process.numPages} pág
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-[color:var(--text-muted)]">
              {process.threads.length > 0 && (
                <>
                  <Cpu size={10} />
                  {process.threads.length} hilo{process.threads.length === 1 ? '' : 's'}
                </>
              )}
              {process.parentPid !== undefined && (
                <span className="ml-1 text-[color:var(--text-faint)]">
                  hijo de P{process.parentPid}
                </span>
              )}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFork(process.pid)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition hover:border-amber-300/40 hover:text-amber-300"
          title={`Hacer fork de P${process.pid}`}
          aria-label={`Hacer fork de P${process.pid}`}
        >
          <GitFork size={14} />
        </button>
      </div>

      {kids.length > 0 && (
        <ul className="mt-2 space-y-2 border-l border-[color:var(--border)] pl-4">
          <AnimatePresence initial={false}>
            {kids.map((child) => (
              <ForkNode
                key={child.pid}
                process={child}
                childrenOf={childrenOf}
                depth={depth + 1}
                selectedPid={selectedPid}
                onSelectPid={onSelectPid}
                onFork={onFork}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </motion.li>
  )
}
