import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export interface AlgorithmCardOption<T extends string = string> {
  value: T
  name: string
  motto: string
  pros?: string
  cons?: string
}

interface AlgorithmCardPickerProps<T extends string> {
  options: AlgorithmCardOption<T>[]
  value: T | null
  onChange: (v: T) => void
  label?: string
}

export default function AlgorithmCardPicker<T extends string>({
  options,
  value,
  onChange,
  label = 'Elige un algoritmo',
}: AlgorithmCardPickerProps<T>) {
  return (
    <div className="space-y-2.5">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        {label}
      </p>
      <div className="grid gap-2.5">
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full overflow-hidden rounded-2xl border p-4 text-left transition ${
                selected
                  ? 'border-[color:var(--accent)]/50 bg-[color:var(--accent-soft)] shadow-[0_0_0_3px_var(--accent-soft)]'
                  : 'border-[color:var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)]'
              }`}
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <h4 className="text-[15px] font-bold tracking-tight text-[color:var(--text)]">
                  {opt.name}
                </h4>
                {selected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[#0A0A0A] shadow-[0_2px_8px_var(--accent-soft)]"
                  >
                    <Check size={14} strokeWidth={3} />
                  </motion.span>
                )}
              </div>
              <p className="text-[13px] italic text-[color:var(--accent)]">"{opt.motto}"</p>
              {(opt.pros || opt.cons) && (
                <div className="mt-2 grid gap-1 text-[12px] text-[color:var(--text-muted)]">
                  {opt.pros && (
                    <p>
                      <span className="font-medium text-emerald-300">A favor:</span>{' '}
                      {opt.pros}
                    </p>
                  )}
                  {opt.cons && (
                    <p>
                      <span className="font-medium text-rose-300">En contra:</span>{' '}
                      {opt.cons}
                    </p>
                  )}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
