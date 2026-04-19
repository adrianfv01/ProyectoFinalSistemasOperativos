import {
  GraduationCap,
  Sparkles,
  ChefHat,
  CalendarClock,
  Car,
  Backpack,
  PartyPopper,
} from 'lucide-react'
import GuideStep from '../GuideStep'
import AnalogyHero from '../components/AnalogyHero'
import ConceptCard from '../components/ConceptCard'
import { useTutorialStore } from '../../store/tutorialStore'
import type { GuideChapterDefinition } from '../types'

const CHAPTERS_PREVIEW = [
  {
    icon: ChefHat,
    title: 'Procesos',
    body: 'Aprende qué corre tu compu y cómo nacen los procesos.',
  },
  {
    icon: CalendarClock,
    title: 'Planificación',
    body: 'Decide cuál proceso usa la CPU y compara estrategias.',
  },
  {
    icon: Car,
    title: 'Memoria',
    body: 'Cómo se reparte la RAM entre tantos procesos a la vez.',
  },
  {
    icon: Backpack,
    title: 'Reemplazo',
    body: 'Qué pasa cuando ya no cabe nada y hay que decidir.',
  },
  {
    icon: PartyPopper,
    title: 'Resumen',
    body: 'Métricas finales y siguientes pasos.',
  },
]

function StepWelcome() {
  const seedDefaultProcesses = useTutorialStore((s) => s.seedDefaultProcesses)
  const miniProcesses = useTutorialStore((s) => s.miniProcesses)

  return (
    <GuideStep
      title="Bienvenido al simulador"
      hook="Antes de empezar"
      icon={GraduationCap}
    >
      <AnalogyHero
        icon={GraduationCap}
        title="Vamos a aprender sin prisas"
        body="Cada capítulo arranca con una analogía sencilla, te explica el concepto y luego te deja jugar con una mini simulación. Si algo no se entiende, regresas con el botón Atrás."
        accent="from-indigo-500/30 to-fuchsia-500/20"
      />

      <ConceptCard title="Lo que vas a recorrer" icon={Sparkles}>
        <ul className="space-y-2">
          {CHAPTERS_PREVIEW.map((c) => (
            <li key={c.title} className="flex items-start gap-2.5">
              <c.icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
              <span>
                <strong className="text-gray-100">{c.title}.</strong>{' '}
                <span className="text-gray-400">{c.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </ConceptCard>

      {miniProcesses.length === 0 && (
        <button
          type="button"
          onClick={seedDefaultProcesses}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 text-sm font-medium text-indigo-200 transition active:scale-[0.98] hover:bg-indigo-500/20"
        >
          <Sparkles size={16} />
          Cargar ejemplo (3 procesos)
        </button>
      )}
    </GuideStep>
  )
}

export const welcomeChapter: GuideChapterDefinition = {
  id: 'inicio',
  slug: 'inicio',
  label: 'Bienvenida',
  shortLabel: 'Inicio',
  icon: GraduationCap,
  accent: 'from-indigo-500 to-fuchsia-500',
  steps: [
    {
      id: 'welcome',
      title: 'Bienvenida',
      icon: GraduationCap,
      render: () => <StepWelcome />,
    },
  ],
}
