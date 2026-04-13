import { motion } from 'framer-motion'
import { useProcessStore } from '../../store/processStore'
import { getProcessColor } from '../../utils/colors'
import { ProcessState } from '../../engine/processes/types'

interface Props {
  selectedPid: number | null
}

interface NodeDef {
  id: ProcessState
  label: string
  x: number
  y: number
}

interface EdgeDef {
  from: ProcessState
  to: ProcessState
  label: string
}

const NODES: NodeDef[] = [
  { id: ProcessState.New, label: 'Nuevo', x: 80, y: 120 },
  { id: ProcessState.Ready, label: 'Listo', x: 230, y: 120 },
  { id: ProcessState.Running, label: 'Ejecución', x: 400, y: 120 },
  { id: ProcessState.Waiting, label: 'Espera', x: 315, y: 250 },
  { id: ProcessState.Terminated, label: 'Terminado', x: 560, y: 120 },
]

const EDGES: EdgeDef[] = [
  { from: ProcessState.New, to: ProcessState.Ready, label: 'Admitido' },
  { from: ProcessState.Ready, to: ProcessState.Running, label: 'Despachado' },
  { from: ProcessState.Running, to: ProcessState.Ready, label: 'Interrumpido' },
  { from: ProcessState.Running, to: ProcessState.Waiting, label: 'E/S solicitada' },
  { from: ProcessState.Running, to: ProcessState.Terminated, label: 'Finalizado' },
  { from: ProcessState.Waiting, to: ProcessState.Ready, label: 'E/S completada' },
]

const NODE_RX = 50
const NODE_RY = 24

function getNode(id: ProcessState) {
  return NODES.find((n) => n.id === id)!
}

function computeEdgePath(from: NodeDef, to: NodeDef): { path: string; labelX: number; labelY: number } {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / dist
  const uy = dy / dist

  const x1 = from.x + ux * NODE_RX
  const y1 = from.y + uy * NODE_RY
  const x2 = to.x - ux * NODE_RX
  const y2 = to.y - uy * NODE_RY

  const isReturn =
    (from.id === ProcessState.Running && to.id === ProcessState.Ready) ||
    (from.id === ProcessState.Waiting && to.id === ProcessState.Ready)

  if (isReturn) {
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const perpX = -uy
    const perpY = ux
    const curveOffset = from.id === ProcessState.Running ? -30 : 30
    const cx = mx + perpX * curveOffset
    const cy = my + perpY * curveOffset
    return {
      path: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
      labelX: cx,
      labelY: cy,
    }
  }

  return {
    path: `M ${x1} ${y1} L ${x2} ${y2}`,
    labelX: (x1 + x2) / 2,
    labelY: (y1 + y2) / 2 - 8,
  }
}

export default function StateDiagram({ selectedPid }: Props) {
  const processes = useProcessStore((s) => s.processes)
  const process = processes.find((p) => p.pid === selectedPid) ?? processes[0]
  const activeState = process?.state
  const color = process ? getProcessColor(process.pid) : '#6366f1'

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
      <h2 className="mb-3 text-lg font-semibold text-gray-100">Diagrama de estados</h2>
      <svg viewBox="0 0 640 310" className="w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 Z" fill="#6b7280" />
          </marker>
          <marker id="arrowActive" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 Z" fill={color} />
          </marker>
        </defs>

        {EDGES.map((edge) => {
          const from = getNode(edge.from)
          const to = getNode(edge.to)
          const { path, labelX, labelY } = computeEdgePath(from, to)
          const isActive =
            activeState === edge.from ||
            activeState === edge.to

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <path
                d={path}
                fill="none"
                stroke={isActive ? color : '#4b5563'}
                strokeWidth={isActive ? 2 : 1.5}
                markerEnd={isActive ? 'url(#arrowActive)' : 'url(#arrow)'}
                opacity={isActive ? 1 : 0.5}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                className="text-[9px]"
                fill={isActive ? color : '#9ca3af'}
              >
                {edge.label}
              </text>
            </g>
          )
        })}

        {NODES.map((node) => {
          const isActive = activeState === node.id

          return (
            <g key={node.id}>
              {isActive ? (
                <motion.ellipse
                  cx={node.x}
                  cy={node.y}
                  rx={NODE_RX}
                  ry={NODE_RY}
                  fill={color + '25'}
                  stroke={color}
                  strokeWidth={2.5}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              ) : (
                <ellipse
                  cx={node.x}
                  cy={node.y}
                  rx={NODE_RX}
                  ry={NODE_RY}
                  fill="#1f2937"
                  stroke="#4b5563"
                  strokeWidth={1.5}
                />
              )}
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                className="text-[11px] font-medium"
                fill={isActive ? color : '#d1d5db'}
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>

      {process && (
        <p className="mt-2 text-center text-xs text-gray-400">
          Proceso <span className="font-semibold" style={{ color }}>PID {process.pid}</span>
          {' '}— estado actual:{' '}
          <span className="font-semibold" style={{ color }}>
            {NODES.find((n) => n.id === activeState)?.label}
          </span>
        </p>
      )}
    </div>
  )
}
