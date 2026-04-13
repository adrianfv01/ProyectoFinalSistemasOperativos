import { useState, type FormEvent } from 'react'
import { useProcessStore } from '../../store/processStore'
import { Plus } from 'lucide-react'

export default function ProcessForm() {
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
  }

  const inputClass =
    'w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-700 bg-gray-900 p-5">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">Nuevo proceso</h2>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-400">Tiempo de llegada</span>
          <input
            type="number"
            min={0}
            step={1}
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-400">Ráfaga (burst)</span>
          <input
            type="number"
            min={1}
            step={1}
            value={burst}
            onChange={(e) => setBurst(e.target.value)}
            placeholder="1"
            className={inputClass}
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-400">Prioridad</span>
          <input
            type="number"
            min={0}
            step={1}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-400">Número de páginas</span>
          <input
            type="number"
            min={0}
            step={1}
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            placeholder="4"
            className={inputClass}
          />
        </label>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-[0.98]"
      >
        <Plus size={16} />
        Agregar proceso
      </button>
    </form>
  )
}
