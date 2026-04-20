import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChefHat } from 'lucide-react'
import { useTutorialStore } from '../../store/tutorialStore'
import { getProcessColor } from '../../utils/colors'
import BigSlider from './BigSlider'

export default function ProcessBuilder() {
  const { miniProcesses, addMiniProcess, removeMiniProcess } = useTutorialStore()
  const [arrival, setArrival] = useState(0)
  const [burst, setBurst] = useState(3)

  const max = 5
  const isFull = miniProcesses.length >= max

  return (
    <div className="space-y-3">
      <div className="surface-card p-4">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] text-amber-300">
            <ChefHat className="h-4 w-4" />
          </span>
          <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            Arma un nuevo encargo
          </h3>
        </div>

        <div className="space-y-5">
          <BigSlider
            label="Tiempo de llegada"
            value={arrival}
            min={0}
            max={8}
            onChange={setArrival}
            unit=" s"
            hint="Cuándo entra este pedido a la cola."
          />
          <BigSlider
            label="Ráfaga (cuánto tarda)"
            value={burst}
            min={1}
            max={8}
            onChange={setBurst}
            unit=" s"
            hint="Tiempo total que necesita la CPU para terminarlo."
          />
        </div>

        <button
          type="button"
          disabled={isFull}
          onClick={() => addMiniProcess({ arrivalTime: arrival, burstTime: burst })}
          className="btn-primary mt-5 h-12 w-full"
        >
          <Plus size={18} />
          {isFull ? 'Máximo 5 procesos' : 'Agregar proceso'}
        </button>
      </div>

      <div className="surface-card p-3">
        <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
          Tus procesos ({miniProcesses.length}/{max})
        </p>
        {miniProcesses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[color:var(--border)] px-3 py-6 text-center text-[12px] text-[color:var(--text-faint)]">
            Toca "Agregar proceso" para crear el primero.
          </p>
        ) : (
          <ul className="space-y-1.5">
            <AnimatePresence initial={false}>
              {miniProcesses.map((p) => (
                <motion.li
                  key={p.pid}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-2"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-[12px] font-bold tabular-nums text-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
                    style={{ backgroundColor: getProcessColor(p.pid) }}
                  >
                    P{p.pid}
                  </span>
                  <div className="flex-1 text-[12px] text-[color:var(--text-muted)]">
                    <p>
                      Llega en{' '}
                      <strong className="font-mono tabular-nums text-[color:var(--text)]">
                        {p.arrivalTime}s
                      </strong>
                      , tarda{' '}
                      <strong className="font-mono tabular-nums text-[color:var(--text)]">
                        {p.burstTime}s
                      </strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMiniProcess(p.pid)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-300 transition hover:bg-rose-300/10"
                    aria-label={`Quitar P${p.pid}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  )
}
