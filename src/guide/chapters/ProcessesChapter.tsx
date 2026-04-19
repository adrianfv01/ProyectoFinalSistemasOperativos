import { ChefHat, ListChecks, Activity, IdCard, Plus } from 'lucide-react'
import GuideStep from '../GuideStep'
import AnalogyHero from '../components/AnalogyHero'
import ConceptCard from '../components/ConceptCard'
import InsightBanner from '../components/InsightBanner'
import ProcessBuilder from '../components/ProcessBuilder'
import AnimatedStateDiagram from '../components/AnimatedStateDiagram'
import { useTutorialStore } from '../../store/tutorialStore'
import { ANALOGIES, COMMON } from '../copy'
import type { GuideChapterDefinition } from '../types'

function StepIntro() {
  return (
    <GuideStep
      title="¿Qué es un proceso?"
      hook="Capítulo 1 · Procesos"
      icon={ChefHat}
    >
      <AnalogyHero
        icon={ChefHat}
        title={ANALOGIES.process.title}
        body={ANALOGIES.process.body}
        accent="from-amber-500/30 to-rose-500/20"
      />

      <ConceptCard title="En palabras simples" icon={ListChecks}>
        <p>
          Un <strong>proceso</strong> es un programa en ejecución. Cada uno tiene:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Un <strong>PID</strong> que lo identifica.</li>
          <li>Un <strong>tiempo de llegada</strong> (cuándo entra a la cola).</li>
          <li>Una <strong>ráfaga de CPU</strong> (cuánto tarda en ejecutarse).</li>
        </ul>
      </ConceptCard>
    </GuideStep>
  )
}

function StepStates() {
  return (
    <GuideStep
      title="Los procesos viven varios estados"
      hook="Ciclo de vida"
      icon={Activity}
    >
      <p className="text-sm leading-relaxed text-gray-300">
        Un proceso no siempre está usando la CPU. Pasa por distintos estados a lo
        largo de su vida. Mira la animación: el círculo iluminado muestra dónde
        anda en cada momento.
      </p>

      <AnimatedStateDiagram />

      <ConceptCard title="¿Por qué importa?" tone="info">
        <p>
          El sistema operativo necesita saber el estado de cada proceso para
          decidir a quién atender, a quién hacer esperar y cuándo limpiar los
          recursos de los que ya terminaron.
        </p>
      </ConceptCard>
    </GuideStep>
  )
}

function StepBuild() {
  return (
    <GuideStep
      title="Crea tus propios procesos"
      hook="Tu turno"
      icon={Plus}
    >
      <p className="text-sm leading-relaxed text-gray-300">
        Vamos a armar entre <strong>1 y 5 procesos</strong>. Estos mismos pedidos
        se usarán en los siguientes capítulos para planificar la CPU y asignar
        memoria.
      </p>

      <ProcessBuilder />

      <InsightBanner
        title={COMMON.tipTitle}
        body="Combina procesos con distintas ráfagas (cortos y largos) y tiempos de llegada. Así verás cómo cada algoritmo se comporta diferente."
      />
    </GuideStep>
  )
}

function StepRecap() {
  const miniProcesses = useTutorialStore((s) => s.miniProcesses)

  return (
    <GuideStep
      title="Listo: ya tienes tu propia carga de trabajo"
      hook="Resumen"
      icon={IdCard}
    >
      <ConceptCard title="Lo que armaste" tone="success">
        <p>
          Tienes <strong>{miniProcesses.length}</strong>{' '}
          {miniProcesses.length === 1 ? 'proceso' : 'procesos'} esperando turno.
          Cada uno es como un cliente que llega al cajero con un encargo de
          cierta duración.
        </p>
      </ConceptCard>

      <InsightBanner body="En el siguiente capítulo verás distintos algoritmos de planificación, todos atendiendo a tus mismos procesos. Compararás cuál es más justo y cuál hace esperar menos." />
    </GuideStep>
  )
}

export const processesChapter: GuideChapterDefinition = {
  id: 'procesos',
  slug: 'procesos',
  label: 'Procesos',
  shortLabel: 'Procesos',
  icon: ChefHat,
  accent: 'from-amber-500 to-rose-500',
  steps: [
    {
      id: 'intro',
      title: '¿Qué es un proceso?',
      icon: ChefHat,
      render: () => <StepIntro />,
    },
    {
      id: 'states',
      title: 'Estados',
      icon: Activity,
      render: () => <StepStates />,
    },
    {
      id: 'build',
      title: 'Crea procesos',
      icon: Plus,
      render: () => <StepBuild />,
      canAdvance: () => useTutorialStore.getState().miniProcesses.length > 0,
      blockedHint: COMMON.blockedAddProcesses,
    },
    {
      id: 'recap',
      title: 'Resumen',
      icon: IdCard,
      render: () => <StepRecap />,
    },
  ],
}
