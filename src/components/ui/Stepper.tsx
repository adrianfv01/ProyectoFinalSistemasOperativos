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
        <label className="mb-1 block text-sm text-gray-400">{label}</label>
      )}
      <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-600 bg-gray-900">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="flex min-h-11 w-12 items-center justify-center text-gray-300 transition active:bg-gray-800 disabled:opacity-30"
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
          className="w-full min-w-0 border-x border-gray-700 bg-transparent text-center text-base font-semibold text-gray-100 outline-none"
        />
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="flex min-h-11 w-12 items-center justify-center text-gray-300 transition active:bg-gray-800 disabled:opacity-30"
          aria-label="Aumentar"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
