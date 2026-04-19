import { Minus, Plus } from 'lucide-react'

interface BigSliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
  hint?: string
}

export default function BigSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  hint,
}: BigSliderProps) {
  const dec = () => onChange(Math.max(min, value - step))
  const inc = () => onChange(Math.min(max, value + step))

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-2xl font-bold tabular-nums text-indigo-300">
          {value}
          {unit && <span className="ml-0.5 text-sm text-gray-400">{unit}</span>}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-gray-200 transition active:scale-95 hover:bg-gray-700 disabled:opacity-30"
          aria-label={`Disminuir ${label}`}
        >
          <Minus size={20} />
        </button>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-12 flex-1 cursor-pointer appearance-none rounded-full bg-gray-800 accent-indigo-500"
          style={{
            background: `linear-gradient(to right, rgb(99 102 241) 0%, rgb(99 102 241) ${
              ((value - min) / (max - min)) * 100
            }%, rgb(31 41 55) ${((value - min) / (max - min)) * 100}%, rgb(31 41 55) 100%)`,
          }}
        />

        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-gray-200 transition active:scale-95 hover:bg-gray-700 disabled:opacity-30"
          aria-label={`Aumentar ${label}`}
        >
          <Plus size={20} />
        </button>
      </div>

      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
