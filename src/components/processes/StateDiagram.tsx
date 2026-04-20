import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useProcessStore } from '../../store/processStore'
import { getProcessColor } from '../../utils/colors'
import { useIsMobile } from '../../utils/useIsMobile'
import { ProcessState } from '../../engine/processes/types'
import { getTransitionLabel } from '../../engine/processes/stateMachine'

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
  curve?: number
  labelGap?: number
}

const NODES_DESKTOP: NodeDef[] = [
  { id: ProcessState.New, label: 'Nuevo', x: 80, y: 130 },
  { id: ProcessState.Ready, label: 'Listo', x: 250, y: 130 },
  { id: ProcessState.Running, label: 'Ejecución', x: 450, y: 130 },
  { id: ProcessState.Waiting, label: 'Espera', x: 350, y: 290 },
  { id: ProcessState.Terminated, label: 'Terminado', x: 620, y: 130 },
]

const NODES_MOBILE: NodeDef[] = [
  { id: ProcessState.New, label: 'Nuevo', x: 170, y: 60 },
  { id: ProcessState.Ready, label: 'Listo', x: 170, y: 180 },
  { id: ProcessState.Running, label: 'Ejecución', x: 170, y: 320 },
  { id: ProcessState.Waiting, label: 'Espera', x: 300, y: 460 },
  { id: ProcessState.Terminated, label: 'Terminado', x: 170, y: 600 },
]

const EDGES: EdgeDef[] = [
  { from: ProcessState.New, to: ProcessState.Ready, label: 'Admitido', labelGap: 14 },
  {
    from: ProcessState.Ready,
    to: ProcessState.Running,
    label: 'Despachado',
    curve: 22,
    labelGap: 12,
  },
  {
    from: ProcessState.Running,
    to: ProcessState.Ready,
    label: 'Interrumpido',
    curve: 22,
    labelGap: 12,
  },
  {
    from: ProcessState.Running,
    to: ProcessState.Waiting,
    label: 'E/S solicitada',
    labelGap: 16,
  },
  {
    from: ProcessState.Running,
    to: ProcessState.Terminated,
    label: 'Finalizado',
    labelGap: 14,
  },
  {
    from: ProcessState.Waiting,
    to: ProcessState.Ready,
    label: 'E/S completada',
    labelGap: 16,
  },
]

const NODE_RX = 55
const NODE_RY = 26

const SIM_SEQUENCE: ProcessState[] = [
  ProcessState.New,
  ProcessState.Ready,
  ProcessState.Running,
  ProcessState.Waiting,
  ProcessState.Ready,
  ProcessState.Running,
  ProcessState.Terminated,
]

const SPEEDS = [0.5, 1, 2] as const
type Speed = (typeof SPEEDS)[number]

function ellipseTrim(ux: number, uy: number): number {
  const a = ux / NODE_RX
  const b = uy / NODE_RY
  return 1 / Math.sqrt(a * a + b * b)
}

function computeEdgePath(
  from: NodeDef,
  to: NodeDef,
  curve: number,
  labelGap: number,
): { path: string; labelX: number; labelY: number } {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / dist
  const uy = dy / dist

  const trim = ellipseTrim(ux, uy)
  const x1 = from.x + ux * trim
  const y1 = from.y + uy * trim
  const x2 = to.x - ux * trim
  const y2 = to.y - uy * trim

  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2

  const perpX = uy
  const perpY = -ux

  if (curve !== 0) {
    const cx = mx + perpX * curve
    const cy = my + perpY * curve
    const midCurveX = mx + perpX * (curve / 2)
    const midCurveY = my + perpY * (curve / 2)
    const sign = curve >= 0 ? 1 : -1
    return {
      path: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
      labelX: midCurveX + perpX * labelGap * sign,
      labelY: midCurveY + perpY * labelGap * sign,
    }
  }

  return {
    path: `M ${x1} ${y1} L ${x2} ${y2}`,
    labelX: mx + perpX * labelGap,
    labelY: my + perpY * labelGap,
  }
}

const STEP_BASE_MS = 1400

export default function StateDiagram({ selectedPid }: Props) {
  const processes = useProcessStore((s) => s.processes)
  const process = processes.find((p) => p.pid === selectedPid) ?? processes[0]
  const realState = process?.state
  const color = process ? getProcessColor(process.pid) : '#6366f1'
  const isMobile = useIsMobile()

  const [isPlaying, setIsPlaying] = useState(false)
  const [simStep, setSimStep] = useState(0)
  const [speed, setSpeed] = useState<Speed>(1)
  const hasStartedSim = useRef(false)

  useEffect(() => {
    setIsPlaying(false)
    setSimStep(0)
    hasStartedSim.current = false
  }, [process?.pid])

  useEffect(() => {
    if (!isPlaying) return
    const intervalMs = STEP_BASE_MS / speed
    const id = window.setInterval(() => {
      setSimStep((s) => {
        if (s >= SIM_SEQUENCE.length - 1) {
          setIsPlaying(false)
          return s
        }
        return s + 1
      })
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [isPlaying, speed])

  const isSimulating = isPlaying || hasStartedSim.current
  const displayState = isSimulating ? SIM_SEQUENCE[simStep] : realState
  const activeEdge =
    isSimulating && simStep > 0
      ? { from: SIM_SEQUENCE[simStep - 1], to: SIM_SEQUENCE[simStep] }
      : null

  const handlePlayPause = () => {
    if (!process) return
    if (!isPlaying && simStep >= SIM_SEQUENCE.length - 1) {
      setSimStep(0)
    }
    hasStartedSim.current = true
    setIsPlaying((p) => !p)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setSimStep(0)
    hasStartedSim.current = false
  }

  const nodes = isMobile ? NODES_MOBILE : NODES_DESKTOP
  const viewBox = isMobile ? '0 0 360 670' : '0 0 700 380'
  const labelClass = isMobile ? 'text-[12px] font-medium' : 'text-[11px] font-medium'
  const nodeLabelClass = isMobile ? 'text-[14px] font-semibold' : 'text-[13px] font-semibold'
  const getNode = (id: ProcessState) => nodes.find((n) => n.id === id)!

  const transitionCaption = useMemo(() => {
    if (!activeEdge) return null
    const label = getTransitionLabel(activeEdge.from, activeEdge.to)
    const fromLabel = nodes.find((n) => n.id === activeEdge.from)?.label
    const toLabel = nodes.find((n) => n.id === activeEdge.to)?.label
    return { label, fromLabel, toLabel, key: `${simStep}-${activeEdge.from}-${activeEdge.to}` }
  }, [activeEdge, nodes, simStep])

  const playLabel = isPlaying
    ? 'Pausar'
    : simStep >= SIM_SEQUENCE.length - 1 && hasStartedSim.current
      ? 'Reproducir de nuevo'
      : 'Reproducir ciclo de vida'

  return (
    <div className="surface-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold tracking-tight text-[color:var(--text)]">
          Diagrama de estados
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={!process}
            aria-label={playLabel}
            title={playLabel}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--accent-soft)] px-3 text-[12px] font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent-soft)]/70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span className="hidden sm:inline">
              {isPlaying ? 'Pausar' : 'Reproducir'}
            </span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!process || (!hasStartedSim.current && simStep === 0)}
            aria-label="Reiniciar animación"
            title="Reiniciar animación"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-3)] hover:text-[color:var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={14} />
          </button>
          <div className="flex h-9 items-center overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[12px] text-[color:var(--text-muted)]">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`h-full px-2 font-mono font-semibold transition ${
                  speed === s
                    ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                    : 'hover:bg-[color:var(--surface-3)]'
                }`}
                aria-pressed={speed === s}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <svg viewBox={viewBox} className="w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker
            id="arrow"
            markerWidth="9"
            markerHeight="9"
            refX="8"
            refY="4.5"
            orient="auto"
          >
            <path d="M 0 0 L 9 4.5 L 0 9 Z" fill="var(--text-faint)" />
          </marker>
          <marker
            id="arrowActive"
            markerWidth="9"
            markerHeight="9"
            refX="8"
            refY="4.5"
            orient="auto"
          >
            <path d="M 0 0 L 9 4.5 L 0 9 Z" fill={color} />
          </marker>
        </defs>

        {EDGES.map((edge) => {
          const from = getNode(edge.from)
          const to = getNode(edge.to)
          const { path, labelX, labelY } = computeEdgePath(
            from,
            to,
            edge.curve ?? 0,
            edge.labelGap ?? 14,
          )
          const isOnPath =
            !isSimulating &&
            (displayState === edge.from || displayState === edge.to)
          const isCurrentTransition =
            !!activeEdge && activeEdge.from === edge.from && activeEdge.to === edge.to
          const highlight = isOnPath || isCurrentTransition

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <path
                d={path}
                fill="none"
                stroke={highlight ? color : 'var(--border-strong)'}
                strokeWidth={isCurrentTransition ? 2.8 : highlight ? 2.2 : 1.6}
                markerEnd={highlight ? 'url(#arrowActive)' : 'url(#arrow)'}
                opacity={highlight ? 1 : 0.5}
              />
              {isCurrentTransition && (
                <motion.path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={4}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.9 }}
                  animate={{ pathLength: 1, opacity: 0 }}
                  transition={{ duration: STEP_BASE_MS / speed / 1000, ease: 'easeInOut' }}
                />
              )}
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className={labelClass}
                fill={highlight ? color : 'var(--text-muted)'}
                stroke="var(--bg)"
                strokeWidth={3.5}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {edge.label}
              </text>
            </g>
          )
        })}

        {nodes.map((node) => {
          const isActive = displayState === node.id

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
                  fill="var(--surface-2)"
                  stroke="var(--border-strong)"
                  strokeWidth={1.5}
                />
              )}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={nodeLabelClass}
                fill={isActive ? color : 'var(--text)'}
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="mt-2 min-h-[2.5rem]">
        <AnimatePresence mode="wait">
          {transitionCaption ? (
            <motion.p
              key={transitionCaption.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-center text-[12px] text-[color:var(--text-muted)]"
            >
              <span className="font-semibold" style={{ color }}>
                {transitionCaption.fromLabel}
              </span>
              <span className="mx-1.5 text-[color:var(--text-faint)]">→</span>
              <span className="font-semibold" style={{ color }}>
                {transitionCaption.toLabel}
              </span>
              {transitionCaption.label && (
                <span className="ml-1.5 text-[color:var(--text-muted)]">
                  ({transitionCaption.label})
                </span>
              )}
            </motion.p>
          ) : process ? (
            <motion.p
              key="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-[12px] text-[color:var(--text-muted)]"
            >
              Proceso{' '}
              <span className="font-semibold" style={{ color }}>
                PID {process.pid}
              </span>
              {' '}—{' '}
              {isSimulating ? 'simulando ciclo de vida' : 'estado actual'}:{' '}
              <span className="font-semibold" style={{ color }}>
                {nodes.find((n) => n.id === displayState)?.label}
              </span>
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
