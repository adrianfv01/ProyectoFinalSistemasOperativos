import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PartyPopper,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import GuideStep from '../GuideStep'
import ConceptCard from '../components/ConceptCard'
import InsightBanner from '../components/InsightBanner'
import { useTutorialStore } from '../../store/tutorialStore'
import { useProcessStore } from '../../store/processStore'
import { useSchedulingStore } from '../../store/schedulingStore'
import { useMemoryStore } from '../../store/memoryStore'
import { miniToProcesses } from '../utils'
import { getScheduler } from '../../engine/scheduling'
import {
  generateReferenceString,
  getReplacementAlgorithm,
} from '../../engine/memory'
import { ALGO_DESCRIPTIONS, REPL_DESCRIPTIONS, COMMON } from '../copy'
import type { GuideChapterDefinition } from '../types'

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string
  accent: string
}

function MetricCard({ icon: Icon, label, value, accent }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-3 shadow-[var(--shadow-sm)] ${accent}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] opacity-90">
          {label}
        </span>
      </div>
      <p className="mt-1.5 font-mono text-[22px] font-bold tabular-nums">{value}</p>
    </motion.div>
  )
}

function StepRecap() {
  const navigate = useNavigate()
  const {
    miniProcesses,
    pagesPerProcess,
    schedulingChoice,
    schedulingQuantum,
    replacementChoice,
    numFramesGuide,
    totalMemory,
    pageSize,
    resetAll,
  } = useTutorialStore()

  const setProcesses = useProcessStore((s) => s.setProcesses)
  const setAlgorithm = useSchedulingStore((s) => s.setAlgorithm)
  const setSchedConfig = useSchedulingStore((s) => s.setConfig)
  const setSchedResult = useSchedulingStore((s) => s.setResult)
  const setReplacementAlgo = useMemoryStore((s) => s.setSelectedAlgorithm)
  const setMemoryConfig = useMemoryStore((s) => s.setMemoryConfig)
  const setFrames = useMemoryStore((s) => s.setFrames)

  const schedResult = useMemo(() => {
    if (!schedulingChoice || miniProcesses.length === 0) return null
    const procs = miniToProcesses(miniProcesses, pagesPerProcess)
    const fn = getScheduler(schedulingChoice)
    return fn(procs, { quantum: schedulingQuantum, quantumPerLevel: [2, 4, 8] })
  }, [miniProcesses, pagesPerProcess, schedulingChoice, schedulingQuantum])

  const replSummary = useMemo(() => {
    if (!replacementChoice || miniProcesses.length === 0) return null
    const procs = miniToProcesses(miniProcesses, pagesPerProcess)
    const refs = generateReferenceString(procs)
    if (refs.length === 0) return null
    const fn = getReplacementAlgorithm(replacementChoice)
    const steps = fn(refs, numFramesGuide)
    const faults = steps.filter((s) => s.isPageFault).length
    return {
      total: steps.length,
      faults,
      hitRatio: ((steps.length - faults) / steps.length) * 100,
    }
  }, [miniProcesses, pagesPerProcess, replacementChoice, numFramesGuide])

  function handleContinueFreeMode() {
    const procs = miniToProcesses(miniProcesses, pagesPerProcess)
    setProcesses(procs)

    if (schedulingChoice) {
      const fn = getScheduler(schedulingChoice)
      const result = fn(procs.map((p) => ({ ...p })), {
        quantum: schedulingQuantum,
        quantumPerLevel: [2, 4, 8],
      })
      setAlgorithm(schedulingChoice)
      setSchedConfig({ quantum: schedulingQuantum })
      setSchedResult(result)
    }

    setMemoryConfig({ totalMemory, pageSize })
    setFrames(Math.floor(totalMemory / pageSize))
    if (replacementChoice) {
      setReplacementAlgo(replacementChoice)
    }

    navigate('/procesos')
  }

  function handleRestart() {
    resetAll()
    navigate('/guia')
  }

  return (
    <GuideStep
      title="¡Felicidades, terminaste!"
      hook="Capítulo 5 · Resumen"
      icon={PartyPopper}
    >
      <p className="text-sm leading-relaxed text-gray-300">
        Estos son los resultados de las decisiones que tomaste a lo largo de la
        guía. Toda esta información sale de tus propios procesos.
      </p>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
        <MetricCard
          icon={Cpu}
          label="Uso de CPU"
          value={schedResult ? `${schedResult.cpuUtilization.toFixed(0)}%` : '—'}
          accent="border-[color:var(--accent)]/30 bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
        />
        <MetricCard
          icon={Trophy}
          label="Espera promedio"
          value={
            schedResult
              ? `${schedResult.averages.avgWaitingTime.toFixed(1)}s`
              : '—'
          }
          accent="border-emerald-300/30 bg-emerald-300/5 text-emerald-300"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Fallos de página"
          value={replSummary ? String(replSummary.faults) : '—'}
          accent="border-rose-300/30 bg-rose-300/5 text-rose-300"
        />
        <MetricCard
          icon={CheckCircle}
          label="Tasa de aciertos"
          value={
            replSummary ? `${replSummary.hitRatio.toFixed(0)}%` : '—'
          }
          accent="border-sky-300/30 bg-sky-300/5 text-sky-300"
        />
      </div>

      <ConceptCard title="Tus elecciones" tone="info">
        <ul className="ml-4 list-disc space-y-1 text-xs">
          <li>
            <strong>{miniProcesses.length}</strong> procesos creados
          </li>
          {schedulingChoice && (
            <li>
              Planificación:{' '}
              <strong className="text-gray-100">
                {ALGO_DESCRIPTIONS[schedulingChoice].name}
              </strong>
              {schedulingChoice === 'roundRobin' &&
                ` (quantum ${schedulingQuantum}s)`}
            </li>
          )}
          <li>
            Memoria: <strong className="text-gray-100">{totalMemory} KB</strong>{' '}
            con páginas de{' '}
            <strong className="text-gray-100">{pageSize} KB</strong>
          </li>
          {replacementChoice && (
            <li>
              Reemplazo:{' '}
              <strong className="text-gray-100">
                {REPL_DESCRIPTIONS[replacementChoice].name}
              </strong>
            </li>
          )}
        </ul>
      </ConceptCard>

      <InsightBanner
        body="Acabas de tocar los cuatro pilares de un sistema operativo: procesos, planificación, memoria y reemplazo. En el modo libre puedes profundizar con más algoritmos, hilos, prioridades y comparaciones."
      />

      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleContinueFreeMode}
          className="btn-primary h-12 w-full"
        >
          {COMMON.goFreeMode}
          <ArrowRight size={16} />
        </button>

        <button
          type="button"
          onClick={handleRestart}
          className="btn-ghost h-11 w-full"
        >
          <RotateCcw size={14} />
          Volver a empezar la guía
        </button>

        <Link
          to="/"
          className="flex h-10 w-full items-center justify-center gap-1 text-[12px] font-medium text-[color:var(--text-faint)] transition hover:text-[color:var(--text)]"
        >
          Ir a la pantalla de inicio
        </Link>
      </div>
    </GuideStep>
  )
}

export const summaryChapter: GuideChapterDefinition = {
  id: 'resumen',
  slug: 'resumen',
  label: 'Resumen',
  shortLabel: 'Resumen',
  icon: PartyPopper,
  accent: 'from-fuchsia-500 to-pink-500',
  steps: [
    {
      id: 'recap',
      title: 'Resumen',
      icon: PartyPopper,
      render: () => <StepRecap />,
    },
  ],
}
