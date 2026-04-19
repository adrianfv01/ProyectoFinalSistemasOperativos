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
      <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-200">
          <ChefHat className="h-4 w-4 text-amber-400" />
          Arma un nuevo encargo
        </div>

        <div className="space-y-4">
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
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={18} />
          {isFull ? 'Máximo 5 procesos' : 'Agregar proceso'}
        </button>
      </div>

      <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Tus procesos ({miniProcesses.length}/{max})
        </p>
        {miniProcesses.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-700 px-3 py-6 text-center text-xs text-gray-500">
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
                  className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: getProcessColor(p.pid) }}
                  >
                    P{p.pid}
                  </span>
                  <div className="flex-1 text-xs text-gray-300">
                    <p>
                      Llega en <strong className="text-gray-100">{p.arrivalTime}s</strong>,
                      tarda <strong className="text-gray-100">{p.burstTime}s</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMiniProcess(p.pid)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 transition hover:bg-rose-500/10"
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
