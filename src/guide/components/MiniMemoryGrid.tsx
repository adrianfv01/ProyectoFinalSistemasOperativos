import { motion } from 'framer-motion'
import type { Frame } from '../../engine/memory/types'
import { getProcessColor } from '../../utils/colors'
import ComponentLegend, { OutlineSwatch } from './ComponentLegend'

interface MiniMemoryGridProps {
  frames: Frame[]
  highlightFrame?: number | null
  evictedFrame?: number | null
  showLegend?: boolean
}

export default function MiniMemoryGrid({
  frames,
  highlightFrame = null,
  evictedFrame = null,
  showLegend = true,
}: MiniMemoryGridProps) {
  const cols = frames.length <= 4 ? frames.length : 4

  return (
    <div className="space-y-2">
    <div className="surface-card p-3">
      <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        Marcos de memoria
      </p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {frames.map((f) => {
          const isHighlight = f.frameNumber === highlightFrame
          const isEvicted = f.frameNumber === evictedFrame
          const occupied = f.pid !== null
          return (
            <motion.div
              key={f.frameNumber}
              layout
              initial={false}
              animate={{
                scale: isHighlight ? 1.05 : 1,
                boxShadow: isHighlight
                  ? '0 0 0 3px var(--accent)'
                  : isEvicted
                    ? '0 0 0 3px rgb(244 63 94)'
                    : '0 0 0 0 transparent',
              }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              className="relative aspect-square rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)]"
            >
              <div className="absolute left-1 top-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
                F{f.frameNumber}
              </div>
              {occupied && (
                <motion.div
                  key={`${f.pid}-${f.pageNumber}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="absolute inset-1.5 flex flex-col items-center justify-center rounded-md font-mono text-[11px] font-bold tabular-nums text-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
                  style={{ backgroundColor: getProcessColor(f.pid as number) }}
                >
                  <span>P{f.pid}</span>
                  <span className="text-[9px] opacity-80">pág. {f.pageNumber}</span>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
    {showLegend && (
      <ComponentLegend
        items={[
          {
            label: 'Cada celda (F0, F1, ...)',
            description:
              'Es un marco de memoria física. Solo cabe una página por marco.',
          },
          {
            label: 'Color y etiqueta',
            description:
              'Indican qué proceso (P1, P2, ...) y qué página están cargados en ese marco.',
          },
          {
            label: 'Marco gris vacío',
            description: 'Es un marco libre, disponible para cargar una página nueva.',
          },
          {
            label: 'Borde de acento',
            description: 'El marco resaltado en color de acento es donde se acaba de cargar la página.',
            swatch: <OutlineSwatch color="var(--accent)" />,
          },
          {
            label: 'Borde rojo',
            description: 'Marca el marco cuya página fue expulsada (víctima del reemplazo).',
            swatch: <OutlineSwatch color="rgb(244 63 94)" />,
          },
        ]}
      />
    )}
    </div>
  )
}
