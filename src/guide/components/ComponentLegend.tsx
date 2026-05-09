import { ReactNode } from 'react'
import { BookOpen } from 'lucide-react'

export interface ComponentLegendItem {
  swatch?: ReactNode
  label: string
  description: string
}

interface ComponentLegendProps {
  title?: string
  items: ComponentLegendItem[]
  compact?: boolean
}

export default function ComponentLegend({
  title = 'Qué muestra esta visualización',
  items,
  compact = false,
}: ComponentLegendProps) {
  return (
    <div
      className={`rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)]/60 ${
        compact ? 'p-2.5' : 'p-3'
      }`}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <BookOpen size={12} className="text-[color:var(--accent)]" />
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
          {title}
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] leading-snug">
            {item.swatch && (
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                {item.swatch}
              </span>
            )}
            <span className="text-[color:var(--text-muted)]">
              <strong className="font-semibold text-[color:var(--text)]">
                {item.label}:
              </strong>{' '}
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-3 w-3 rounded-sm border border-white/20"
      style={{ backgroundColor: color }}
    />
  )
}

export function OutlineSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-3 w-3 rounded-sm border-2"
      style={{ borderColor: color }}
    />
  )
}
