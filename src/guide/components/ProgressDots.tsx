interface ProgressDotsProps {
  total: number
  current: number
  onPick?: (index: number) => void
}

export default function ProgressDots({
  total,
  current,
  onPick,
}: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current
        const done = i < current
        return (
          <button
            key={i}
            type="button"
            onClick={() => onPick?.(i)}
            disabled={!onPick}
            aria-label={`Paso ${i + 1} de ${total}`}
            className={`h-1.5 rounded-full transition-all ${
              active
                ? 'w-6 bg-indigo-400'
                : done
                ? 'w-1.5 bg-indigo-500/60'
                : 'w-1.5 bg-gray-700'
            } ${onPick ? 'cursor-pointer' : 'cursor-default'}`}
          />
        )
      })}
    </div>
  )
}
