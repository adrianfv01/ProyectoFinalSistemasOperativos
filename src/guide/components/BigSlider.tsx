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

  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
          {label}
        </span>
        <span className="font-mono text-[26px] font-bold tabular-nums text-[color:var(--text)]">
          {value}
          {unit && (
            <span className="ml-1 text-[13px] font-medium text-[color:var(--text-muted)]">
              {unit}
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-3)] hover:text-[color:var(--text)] disabled:cursor-not-allowed disabled:opacity-30"
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
          className="h-12 flex-1 cursor-pointer appearance-none rounded-full"
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--surface-2) ${pct}%, var(--surface-2) 100%)`,
          }}
        />

        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-3)] hover:text-[color:var(--text)] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={`Aumentar ${label}`}
        >
          <Plus size={20} />
        </button>
      </div>

      {hint && (
        <p className="text-[12px] text-[color:var(--text-faint)]">{hint}</p>
      )}
    </div>
  )
}
