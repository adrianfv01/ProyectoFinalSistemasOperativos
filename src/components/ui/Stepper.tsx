import { Minus, Plus } from 'lucide-react'

interface Props {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  className?: string
}

export default function Stepper({
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
  label,
  className = '',
}: Props) {
  const decrement = () => onChange(Math.max(min, value - step))
  const increment = () => onChange(Math.min(max, value + step))

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-[12px] font-medium text-[color:var(--text-muted)]">
          {label}
        </label>
      )}
      <div className="flex items-stretch overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] transition focus-within:border-[color:var(--accent)]/50 focus-within:shadow-[0_0_0_3px_var(--accent-soft)]">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="flex min-h-11 w-11 items-center justify-center text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)] active:bg-[color:var(--surface-3)] disabled:opacity-30"
          aria-label="Disminuir"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10)
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
          }}
          className="w-full min-w-0 border-x border-[color:var(--border)] bg-transparent text-center font-mono text-[15px] font-semibold tabular-nums text-[color:var(--text)] outline-none"
        />
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="flex min-h-11 w-11 items-center justify-center text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)] active:bg-[color:var(--surface-3)] disabled:opacity-30"
          aria-label="Aumentar"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
