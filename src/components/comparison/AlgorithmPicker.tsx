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
    <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <CollapsibleSection
          title="Algoritmos de planificación"
          icon={<Settings2 size={16} className="text-indigo-400" />}
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
                  className={`flex h-12 items-center justify-center rounded-xl border px-3 text-sm font-medium transition active:scale-[0.98] sm:h-11 ${
                    active
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200'
                      : 'border-gray-700 bg-gray-900/50 text-gray-300'
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
          icon={<Settings2 size={16} className="text-emerald-400" />}
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
                  className={`flex h-12 items-center justify-center rounded-xl border px-3 text-sm font-medium transition active:scale-[0.98] sm:h-11 ${
                    active
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200'
                      : 'border-gray-700 bg-gray-900/50 text-gray-300'
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
        className="mt-5 hidden h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 lg:inline-flex"
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
        className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-gray-800/60"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-200">
          {icon}
          {title}
          {count > 0 && (
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
              {count} sel.
            </span>
          )}
        </span>
        <motion.span animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={18} className="text-gray-400" />
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
