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
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-300">{label}</p>
      <div className="grid gap-2.5">
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition ${
                selected
                  ? 'border-indigo-400 bg-indigo-500/15 ring-1 ring-indigo-400'
                  : 'border-gray-700 bg-gray-900/60 hover:border-gray-600 hover:bg-gray-800/60'
              }`}
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <h4 className="text-base font-bold text-gray-100">{opt.name}</h4>
                {selected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white"
                  >
                    <Check size={14} strokeWidth={3} />
                  </motion.span>
                )}
              </div>
              <p className="text-sm italic text-indigo-300">"{opt.motto}"</p>
              {(opt.pros || opt.cons) && (
                <div className="mt-2 grid gap-1 text-xs text-gray-400">
                  {opt.pros && (
                    <p>
                      <span className="text-emerald-400">A favor:</span>{' '}
                      {opt.pros}
                    </p>
                  )}
                  {opt.cons && (
                    <p>
                      <span className="text-rose-400">En contra:</span>{' '}
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
