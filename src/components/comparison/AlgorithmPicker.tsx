import { useState } from 'react'
import { Settings2, Play, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALGORITHM_LABELS, type AlgorithmName } from '../../store/schedulingStore'
import { REPLACEMENT_LABELS, type ReplacementAlgorithmName } from '../../store/memoryStore'
import Stepper from '../ui/Stepper'

const SCHEDULING_KEYS = Object.keys(ALGORITHM_LABELS) as AlgorithmName[]
const REPLACEMENT_KEYS = Object.keys(REPLACEMENT_LABELS) as ReplacementAlgorithmName[]
const NEEDS_QUANTUM: AlgorithmName[] = ['roundRobin', 'multilevelQueue', 'multilevelFeedback']

interface AlgorithmPickerProps {
  selectedScheduling: Set<AlgorithmName>
  selectedReplacement: Set<ReplacementAlgorithmName>
  quantum: number
  onToggleScheduling: (key: AlgorithmName) => void
  onToggleReplacement: (key: ReplacementAlgorithmName) => void
  onQuantumChange: (q: number) => void
  onCompare: () => void
  disabled?: boolean
}

export default function AlgorithmPicker({
  selectedScheduling,
  selectedReplacement,
  quantum,
  onToggleScheduling,
  onToggleReplacement,
  onQuantumChange,
  onCompare,
  disabled,
}: AlgorithmPickerProps) {
  const [openSched, setOpenSched] = useState(true)
  const [openRepl, setOpenRepl] = useState(true)

  const needsQuantum = NEEDS_QUANTUM.some((k) => selectedScheduling.has(k))
  const hasSelection = selectedScheduling.size > 0 || selectedReplacement.size > 0

  return (
    <div className="surface-card p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <CollapsibleSection
          title="Algoritmos de planificación"
          icon={<Settings2 size={16} className="text-[color:var(--accent)]" />}
          count={selectedScheduling.size}
          open={openSched}
          onToggle={() => setOpenSched((v) => !v)}
        >
          <div className="grid grid-cols-2 gap-2">
            {SCHEDULING_KEYS.map((key) => {
              const active = selectedScheduling.has(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onToggleScheduling(key)}
                  className={`flex h-12 items-center justify-center rounded-xl border px-3 text-[13px] font-medium transition active:scale-[0.98] sm:h-11 ${
                    active
                      ? 'border-[color:var(--accent)]/50 bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                      : 'border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]'
                  }`}
                >
                  <span className="truncate">{ALGORITHM_LABELS[key]}</span>
                </button>
              )
            })}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Algoritmos de reemplazo de página"
          icon={<Settings2 size={16} className="text-emerald-300" />}
          count={selectedReplacement.size}
          open={openRepl}
          onToggle={() => setOpenRepl((v) => !v)}
        >
          <div className="grid grid-cols-2 gap-2">
            {REPLACEMENT_KEYS.map((key) => {
              const active = selectedReplacement.has(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onToggleReplacement(key)}
                  className={`flex h-12 items-center justify-center rounded-xl border px-3 text-[13px] font-medium transition active:scale-[0.98] sm:h-11 ${
                    active
                      ? 'border-emerald-300/50 bg-emerald-300/10 text-emerald-300'
                      : 'border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]'
                  }`}
                >
                  <span className="truncate">{REPLACEMENT_LABELS[key]}</span>
                </button>
              )
            })}
          </div>
        </CollapsibleSection>
      </div>

      {needsQuantum && (
        <div className="mt-5">
          <Stepper
            label="Quantum (RR / MLQ / MLFQ)"
            value={quantum}
            min={1}
            max={100}
            onChange={onQuantumChange}
            className="max-w-[200px]"
          />
        </div>
      )}

      <button
        onClick={onCompare}
        disabled={!hasSelection || disabled}
        className="btn-primary mt-5 hidden h-11 lg:inline-flex"
      >
        <Play size={16} />
        Comparar
      </button>
    </div>
  )
}

interface CollapsibleProps {
  title: string
  icon: React.ReactNode
  count: number
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleSection({
  title,
  icon,
  count,
  open,
  onToggle,
  children,
}: CollapsibleProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-[color:var(--surface-2)]"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold text-[color:var(--text)]">
          {icon}
          {title}
          {count > 0 && (
            <span className="chip chip-accent">{count} sel.</span>
          )}
        </span>
        <motion.span animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={18} className="text-[color:var(--text-muted)]" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-2 pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
