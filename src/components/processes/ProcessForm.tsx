import { useState, type FormEvent } from 'react'
import { useProcessStore } from '../../store/processStore'
import { Plus } from 'lucide-react'

interface ProcessFormProps {
  variant?: 'card' | 'plain'
  onCreated?: () => void
}

export default function ProcessForm({ variant = 'card', onCreated }: ProcessFormProps = {}) {
  const addProcess = useProcessStore((s) => s.addProcess)
  const [arrival, setArrival] = useState('')
  const [burst, setBurst] = useState('')
  const [priority, setPriority] = useState('')
  const [pages, setPages] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const arrivalTime = parseInt(arrival, 10)
    const burstTime = parseInt(burst, 10)
    const priorityVal = parseInt(priority, 10)
    const numPages = parseInt(pages, 10)

    if (isNaN(arrivalTime) || arrivalTime < 0) {
      setError('El tiempo de llegada debe ser un entero no negativo.')
      return
    }
    if (isNaN(burstTime) || burstTime <= 0) {
      setError('La ráfaga debe ser un entero mayor a 0.')
      return
    }
    if (isNaN(priorityVal) || priorityVal < 0) {
      setError('La prioridad debe ser un entero no negativo.')
      return
    }
    if (isNaN(numPages) || numPages < 0) {
      setError('El número de páginas debe ser un entero no negativo.')
      return
    }

    addProcess({ arrivalTime, burstTime, priority: priorityVal, numPages })
    setArrival('')
    setBurst('')
    setPriority('')
    setPages('')
    onCreated?.()
  }

  const inputClass =
    'w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-2.5 font-mono text-[15px] tabular-nums text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--accent)]/50 focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[13px] sm:py-2'

  const wrapperClass = variant === 'card' ? 'surface-card p-5' : ''

  return (
    <form onSubmit={handleSubmit} className={wrapperClass}>
      {variant === 'card' && (
        <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-[color:var(--text)]">
          Nuevo proceso
        </h2>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-[12px] font-medium text-[color:var(--text-muted)]">
            Tiempo de llegada
          </span>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            step={1}
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-[12px] font-medium text-[color:var(--text-muted)]">
            Ráfaga (burst)
          </span>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            step={1}
            value={burst}
            onChange={(e) => setBurst(e.target.value)}
            placeholder="1"
            className={inputClass}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-[12px] font-medium text-[color:var(--text-muted)]">
            Prioridad
          </span>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            step={1}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-[12px] font-medium text-[color:var(--text-muted)]">
            Número de páginas
          </span>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            step={1}
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            placeholder="4"
            className={inputClass}
          />
        </label>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-300/30 bg-rose-300/5 px-3 py-2 text-[12px] text-rose-300">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary mt-4 h-12 w-full sm:h-11">
        <Plus size={16} />
        Agregar proceso
      </button>
    </form>
  )
}
