import { useMemo } from 'react'
import { Layers, Car, Boxes, AlertTriangle } from 'lucide-react'
import GuideStep from '../GuideStep'
import AnalogyHero from '../components/AnalogyHero'
import ConceptCard from '../components/ConceptCard'
import InsightBanner from '../components/InsightBanner'
import BigSlider from '../components/BigSlider'
import MiniMemoryGrid from '../components/MiniMemoryGrid'
import PagesPerProcessEditor from '../components/PagesPerProcessEditor'
import { useTutorialStore } from '../../store/tutorialStore'
import { miniToProcesses } from '../utils'
import {
  allocatePages,
  computeInternalFragmentation,
  initializeFrames,
} from '../../engine/memory'
import { ANALOGIES } from '../copy'
import type { GuideChapterDefinition } from '../types'

function StepIntro() {
  return (
    <GuideStep
      title="¿Dónde viven los procesos?"
      hook="Capítulo 3 · Memoria"
      icon={Car}
    >
      <AnalogyHero
        icon={Car}
        title={ANALOGIES.memory.title}
        body={ANALOGIES.memory.body}
        accent="from-emerald-500/30 to-sky-500/20"
      />

      <ConceptCard title="Página vs marco" icon={Boxes}>
        <p>
          Una <strong>página</strong> es un pedacito (de tamaño fijo) de la
          memoria que necesita un proceso. Un <strong>marco</strong> es un
          espacio físico de la RAM, también de tamaño fijo, donde cabe una
          página.
        </p>
        <p>
          Si una página mide 4 KB y la memoria son 32 KB, entonces hay{' '}
          <strong>32 / 4 = 8 marcos</strong>.
        </p>
      </ConceptCard>
    </GuideStep>
  )
}

function StepConfig() {
  const { totalMemory, pageSize, setTotalMemory, setPageSize } = useTutorialStore()
  const frames = Math.floor(totalMemory / pageSize)

  return (
    <GuideStep
      title="Configura tu RAM"
      hook="Configuración"
      icon={Layers}
    >
      <p className="text-sm leading-relaxed text-gray-300">
        Mueve los sliders y observa cómo cambia el número de marcos. Más memoria
        o páginas más pequeñas, más marcos disponibles.
      </p>

      <div className="space-y-4 rounded-xl border border-gray-700 bg-gray-900/70 p-4">
        <BigSlider
          label="Memoria total"
          value={totalMemory}
          min={8}
          max={64}
          step={4}
          unit=" KB"
          onChange={setTotalMemory}
        />
        <BigSlider
          label="Tamaño de página"
          value={pageSize}
          min={1}
          max={8}
          onChange={setPageSize}
          unit=" KB"
        />

        <div className="flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2.5">
          <span className="text-sm text-indigo-200">Marcos disponibles</span>
          <span className="text-2xl font-bold tabular-nums text-indigo-300">
            {frames}
          </span>
        </div>
      </div>
    </GuideStep>
  )
}

function StepAllocate() {
  const { miniProcesses, pagesPerProcess, totalMemory, pageSize } =
    useTutorialStore()
  const numFrames = Math.floor(totalMemory / pageSize)

  const procs = useMemo(
    () => miniToProcesses(miniProcesses, pagesPerProcess),
    [miniProcesses, pagesPerProcess],
  )

  const memState = useMemo(() => {
    if (procs.length === 0) return null
    const result = allocatePages(procs, numFrames)
    result.internalFragmentation = computeInternalFragmentation(
      totalMemory,
      pageSize,
      procs,
    )
    return result
  }, [procs, numFrames, totalMemory, pageSize])

  const totalRequested = procs.reduce((acc, p) => acc + p.numPages, 0)
  const overflow = totalRequested - numFrames

  const frames = memState?.frames ?? initializeFrames(numFrames)

  return (
    <GuideStep
      title="Asigna páginas a marcos"
      hook="Tu turno"
      icon={Boxes}
    >
      <p className="text-sm leading-relaxed text-gray-300">
        Decide cuántas páginas pide cada proceso. El simulador llena los marcos
        en orden y te avisa si la memoria no alcanza.
      </p>

      <PagesPerProcessEditor />

      <MiniMemoryGrid frames={frames} />

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Páginas pedidas
          </p>
          <p className="text-xl font-bold text-gray-100">{totalRequested}</p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Marcos disponibles
          </p>
          <p className="text-xl font-bold text-gray-100">{numFrames}</p>
        </div>
      </div>

      {overflow > 0 ? (
        <ConceptCard title={`Faltaron ${overflow} marcos`} tone="warning" icon={AlertTriangle}>
          <p>
            Pediste más páginas de las que caben. Las páginas que no entran
            tendrían que cargarse después usando un{' '}
            <strong>algoritmo de reemplazo</strong>. Justo de eso trata el
            siguiente capítulo.
          </p>
        </ConceptCard>
      ) : (
        <ConceptCard title="Todo cupo" tone="success">
          <p>
            Cada página encontró un marco libre. En sistemas reales esto rara
            vez sucede: la memoria casi siempre se llena y hay que decidir qué
            página sacar.
          </p>
        </ConceptCard>
      )}

      {memState && memState.internalFragmentation > 0 && (
        <ConceptCard title="Fragmentación interna" tone="info">
          <p>
            Sobran <strong>{memState.internalFragmentation} KB</strong>{' '}
            reservados pero sin usarse dentro de las páginas. Es el "espacio
            muerto" del estacionamiento: cajones medio vacíos que no puedes
            prestar a nadie.
          </p>
        </ConceptCard>
      )}

      <InsightBanner body="Dividir la memoria en páginas iguales evita el desorden, pero a cambio puede dejar pequeños huecos sin aprovechar dentro de cada página." />
    </GuideStep>
  )
}

export const memoryChapter: GuideChapterDefinition = {
  id: 'memoria',
  slug: 'memoria',
  label: 'Memoria',
  shortLabel: 'Memoria',
  icon: Car,
  accent: 'from-emerald-500 to-sky-500',
  steps: [
    {
      id: 'intro',
      title: 'Memoria y paginación',
      icon: Car,
      render: () => <StepIntro />,
    },
    {
      id: 'config',
      title: 'Configura RAM',
      icon: Layers,
      render: () => <StepConfig />,
    },
    {
      id: 'allocate',
      title: 'Asigna páginas',
      icon: Boxes,
      render: () => <StepAllocate />,
    },
  ],
}
