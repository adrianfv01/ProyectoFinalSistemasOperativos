import { useCallback, useState, type DragEvent, type ChangeEvent } from 'react'
import { Upload, FileText } from 'lucide-react'
import { parseProcessFile, parseMemoryFile, type MemoryConfig } from '../../utils/fileParser'
import { useProcessStore } from '../../store/processStore'

interface Props {
  onMemoryConfig?: (config: MemoryConfig) => void
  variant?: 'card' | 'plain'
  onLoaded?: () => void
}

export default function FileUpload({ onMemoryConfig, variant = 'card', onLoaded }: Props) {
  const setProcesses = useProcessStore((s) => s.setProcesses)
  const [dragOverProcess, setDragOverProcess] = useState(false)
  const [dragOverMemory, setDragOverMemory] = useState(false)
  const [processFileName, setProcessFileName] = useState<string | null>(null)
  const [memoryFileName, setMemoryFileName] = useState<string | null>(null)

  const acceptedTypes = ['.txt', '.csv']

  function isValidFile(file: File) {
    return acceptedTypes.some((ext) => file.name.toLowerCase().endsWith(ext))
  }

  const handleProcessFile = useCallback(
    (file: File) => {
      if (!isValidFile(file)) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const processes = parseProcessFile(content)
        if (processes.length > 0) {
          setProcesses(processes)
          setProcessFileName(file.name)
          onLoaded?.()
        }
      }
      reader.readAsText(file)
    },
    [setProcesses, onLoaded],
  )

  const handleMemoryFile = useCallback(
    (file: File) => {
      if (!isValidFile(file)) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const config = parseMemoryFile(content)
        onMemoryConfig?.(config)
        setMemoryFileName(file.name)
        onLoaded?.()
      }
      reader.readAsText(file)
    },
    [onMemoryConfig, onLoaded],
  )

  function onDrop(handler: (f: File) => void, setDrag: (v: boolean) => void) {
    return (e: DragEvent) => {
      e.preventDefault()
      setDrag(false)
      const file = e.dataTransfer.files[0]
      if (file) handler(file)
    }
  }

  function onFileInput(handler: (f: File) => void) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handler(file)
      e.target.value = ''
    }
  }

  function prevent(e: DragEvent) {
    e.preventDefault()
  }

  const wrapperClass =
    variant === 'card'
      ? 'flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-900 p-5'
      : 'flex flex-col gap-3'

  return (
    <div className={wrapperClass}>
      {variant === 'card' && (
        <h2 className="text-lg font-semibold text-gray-100">Cargar archivos</h2>
      )}

      <label
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition ${
          dragOverProcess
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={(e) => {
          prevent(e)
          setDragOverProcess(true)
        }}
        onDragLeave={() => setDragOverProcess(false)}
        onDrop={onDrop(handleProcessFile, setDragOverProcess)}
      >
        <Upload size={28} className="text-gray-400" />
        <span className="text-sm text-gray-300">
          Arrastra o haz clic para cargar <strong>procesos</strong>
        </span>
        <span className="text-xs text-gray-500">.txt, .csv</span>
        {processFileName && (
          <span className="flex items-center gap-1 text-xs text-indigo-400">
            <FileText size={12} /> {processFileName}
          </span>
        )}
        <input
          type="file"
          accept=".txt,.csv"
          className="hidden"
          onChange={onFileInput(handleProcessFile)}
        />
      </label>

      <label
        className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed p-4 transition ${
          dragOverMemory
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={(e) => {
          prevent(e)
          setDragOverMemory(true)
        }}
        onDragLeave={() => setDragOverMemory(false)}
        onDrop={onDrop(handleMemoryFile, setDragOverMemory)}
      >
        <Upload size={20} className="text-gray-400" />
        <span className="text-xs text-gray-300">
          Archivo de <strong>configuración de memoria</strong>
        </span>
        {memoryFileName && (
          <span className="flex items-center gap-1 text-xs text-indigo-400">
            <FileText size={12} /> {memoryFileName}
          </span>
        )}
        <input
          type="file"
          accept=".txt,.csv"
          className="hidden"
          onChange={onFileInput(handleMemoryFile)}
        />
      </label>
    </div>
  )
}
