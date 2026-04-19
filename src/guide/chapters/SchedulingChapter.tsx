import { useMemo } from 'react'
import {
  CalendarClock,
  Banknote,
  ListTree,
  PlayCircle,
  Trophy,
} from 'lucide-react'
import GuideStep from '../GuideStep'
import AnalogyHero from '../components/AnalogyHero'
import ConceptCard from '../components/ConceptCard'
import InsightBanner from '../components/InsightBanner'
import AlgorithmCardPicker from '../components/AlgorithmCardPicker'
import BigSlider from '../components/BigSlider'
import MiniGantt from '../components/MiniGantt'
import WaitComparison from '../components/WaitComparison'
import {
  useTutorialStore,
  type SchedulingChoice,
} from '../../store/tutorialStore'
import { miniToProcesses } from '../utils'
import { getScheduler } from '../../engine/scheduling'
import { ANALOGIES, ALGO_DESCRIPTIONS, COMMON } from '../copy'
import type { GuideChapterDefinition } from '../types'

function StepIntro() {
  return (
    <GuideStep
      title="Atender uno por uno"
      hook="Capítulo 2 · Planificación"
      icon={CalendarClock}
    >
      <AnalogyHero
        icon={Banknote}
        title={ANALOGIES.scheduling.title}
        body={ANALOGIES.scheduling.body}
        accent="from-sky-500/30 to-indigo-500/20"
      />

      <ConceptCard title="¿Qué es planificar?" icon={ListTree}>
        <p>
          La <strong>planificación de CPU</strong> es la regla que decide qué
          proceso usa la CPU en cada momento. La CPU es una sola, pero los
          procesos son varios.
        </p>
        <p>
          Diferentes algoritmos significan diferentes <strong>tiempos de
          espera</strong>, distinto <strong>orden</strong> y distinta{' '}
          <strong>cantidad de cambios</strong> entre procesos.
        </p>
      </ConceptCard>
    </GuideStep>
  )
}

function StepPick() {
  const { schedulingChoice, setSchedulingChoice, schedulingQuantum, setSchedulingQuantum } =
    useTutorialStore()

  const options = (Object.keys(ALGO_DESCRIPTIONS) as SchedulingChoice[]).map(
    (k) => ({
      value: k,
      name: ALGO_DESCRIPTIONS[k].fullName,
      motto: ALGO_DESCRIPTIONS[k].motto,
      pros: ALGO_DESCRIPTIONS[k].pros,
      cons: ALGO_DESCRIPTIONS[k].cons,
    }),
  )

  return (
    <GuideStep
      title="Elige una regla para el cajero"
      hook="Tu turno"
      icon={ListTree}
    >
      <p className="text-sm leading-relaxed text-gray-300">
        Los tres algoritmos más comunes. Toca uno para ver cómo atendería a tus
        procesos. Después podrás cambiar y comparar.
      </p>

      <AlgorithmCardPicker<SchedulingChoice>
        options={options}
        value={schedulingChoice}
        onChange={setSchedulingChoice}
        label="Algoritmos disponibles"
      />

      {schedulingChoice === 'roundRobin' && (
        <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-4">
          <BigSlider
            label="Quantum (segundos por turno)"
            value={schedulingQuantum}
            min={1}
            max={6}
            onChange={setSchedulingQuantum}
            hint="Tiempo máximo que cada proceso usa la CPU antes de ceder el turno."
          />
        </div>
      )}
    </GuideStep>
  )
}

function StepGantt() {
  const { miniProcesses, pagesPerProcess, schedulingChoice, schedulingQuantum } =
    useTutorialStore()

  const result = useMemo(() => {
    if (!schedulingChoice || miniProcesses.length === 0) return null
    const procs = miniToProcesses(miniProcesses, pagesPerProcess)
    const fn = getScheduler(schedulingChoice)
    return fn(procs, { quantum: schedulingQuantum, quantumPerLevel: [2, 4, 8] })
  }, [miniProcesses, pagesPerProcess, schedulingChoice, schedulingQuantum])

  if (!result || !schedulingChoice) {
    return (
      <GuideStep title="Mira la simulación" hook="Diagrama de Gantt" icon={PlayCircle}>
        <p className="text-sm text-gray-400">
          Regresa al paso anterior y elige un algoritmo.
        </p>
      </GuideStep>
    )
  }

  const desc = ALGO_DESCRIPTIONS[schedulingChoice]

  return (
    <GuideStep
      title="Mira cómo se reparte la CPU"
      hook="Diagrama de Gantt"
      icon={PlayCircle}
    >
      <p className="text-sm leading-relaxed text-gray-300">
        Cada bloque de color es un proceso ocupando la CPU. El tiempo avanza de
        izquierda a derecha. Toca el botón de play si quieres reiniciar la
        animación.
      </p>

      <MiniGantt timeline={result.timeline} />

      <ConceptCard title={`¿Qué pasó con ${desc.name}?`} tone="info">
        <p>{desc.motto}</p>
        <ul className="ml-4 list-disc space-y-1 text-xs">
          <li>
            Espera promedio:{' '}
            <strong className="text-gray-100">
              {result.averages.avgWaitingTime.toFixed(2)} s
            </strong>
          </li>
          <li>
            Retorno promedio:{' '}
            <strong className="text-gray-100">
              {result.averages.avgTurnaroundTime.toFixed(2)} s
            </strong>
          </li>
          <li>
            Cambios de contexto:{' '}
            <strong className="text-gray-100">{result.contextSwitches}</strong>
          </li>
        </ul>
      </ConceptCard>
    </GuideStep>
  )
}

function StepCompare() {
  const schedulingChoice = useTutorialStore((s) => s.schedulingChoice)

  return (
    <GuideStep
      title="Compara los tres algoritmos"
      hook="Comparación"
      icon={Trophy}
    >
      <p className="text-sm leading-relaxed text-gray-300">
        Estos son los tres algoritmos atendiendo exactamente a{' '}
        <strong>tus mismos procesos</strong>. La barra muestra qué tanto
        esperaron en promedio. La verde es la mejor opción para esta carga.
      </p>

      <WaitComparison />

      <InsightBanner
        body={
          schedulingChoice === 'sjf'
            ? 'SJF suele ganar en espera promedio porque los rápidos pasan primero. Cuidado: si un proceso es muy largo, puede quedarse esperando mucho.'
            : schedulingChoice === 'roundRobin'
            ? 'Round Robin es muy justo (nadie espera demasiado), pero genera más cambios de contexto. Esos cambios también cuestan tiempo en una compu real.'
            : 'FCFS es el más fácil de entender y predecir, pero si el primero es muy largo, todos los demás esperan.'
        }
      />
    </GuideStep>
  )
}

export const schedulingChapter: GuideChapterDefinition = {
  id: 'planificacion',
  slug: 'planificacion',
  label: 'Planificación',
  shortLabel: 'CPU',
  icon: CalendarClock,
  accent: 'from-sky-500 to-indigo-500',
  steps: [
    {
      id: 'intro',
      title: 'Planificación',
      icon: CalendarClock,
      render: () => <StepIntro />,
    },
    {
      id: 'pick',
      title: 'Elige algoritmo',
      icon: ListTree,
      render: () => <StepPick />,
      canAdvance: () => useTutorialStore.getState().schedulingChoice !== null,
      blockedHint: COMMON.blockedPickAlgo,
    },
    {
      id: 'gantt',
      title: 'Diagrama de Gantt',
      icon: PlayCircle,
      render: () => <StepGantt />,
    },
    {
      id: 'compare',
      title: 'Comparación',
      icon: Trophy,
      render: () => <StepCompare />,
    },
  ],
}
