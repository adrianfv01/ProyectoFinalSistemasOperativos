import { useMemo } from 'react'
import { Backpack, RefreshCw, ListTree, Gauge } from 'lucide-react'
import GuideStep from '../GuideStep'
import AnalogyHero from '../components/AnalogyHero'
import ConceptCard from '../components/ConceptCard'
import InsightBanner from '../components/InsightBanner'
import AlgorithmCardPicker from '../components/AlgorithmCardPicker'
import BigSlider from '../components/BigSlider'
import ReplacementPlayer from '../components/ReplacementPlayer'
import {
  useTutorialStore,
  type ReplacementChoice,
} from '../../store/tutorialStore'
import { miniToProcesses } from '../utils'
import {
  generateReferenceString,
  getReplacementAlgorithm,
} from '../../engine/memory'
import { ANALOGIES, REPL_DESCRIPTIONS, COMMON } from '../copy'
import type { GuideChapterDefinition } from '../types'

function StepIntro() {
  return (
    <GuideStep
      title="Cuando ya no cabe nada más"
      hook="Capítulo 4 · Reemplazo"
      icon={Backpack}
    >
      <AnalogyHero
        icon={Backpack}
        title={ANALOGIES.replacement.title}
        body={ANALOGIES.replacement.body}
        accent="from-rose-500/30 to-orange-500/20"
      />

      <ConceptCard title="Falla de página" icon={RefreshCw}>
        <p>
          Cuando un proceso pide una <strong>página</strong> que no está cargada
          en memoria, hay un <strong>fallo de página</strong>. La página tiene
          que traerse del disco, lo cual es lentísimo.
        </p>
        <p>
          Si todos los marcos están ocupados, hay que decidir{' '}
          <strong>cuál sacar</strong>. Esa decisión la toma el algoritmo de
          reemplazo.
        </p>
      </ConceptCard>
    </GuideStep>
  )
}

function StepPick() {
  const {
    replacementChoice,
    setReplacementChoice,
    numFramesGuide,
    setNumFramesGuide,
  } = useTutorialStore()

  const options = (Object.keys(REPL_DESCRIPTIONS) as ReplacementChoice[]).map(
    (k) => ({
      value: k,
      name: REPL_DESCRIPTIONS[k].fullName,
      motto: REPL_DESCRIPTIONS[k].motto,
      pros: REPL_DESCRIPTIONS[k].pros,
      cons: REPL_DESCRIPTIONS[k].cons,
    }),
  )

  return (
    <GuideStep
      title="Elige una regla para sacar páginas"
      hook="Tu turno"
      icon={ListTree}
    >
      <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-4">
        <BigSlider
          label="Marcos disponibles"
          value={numFramesGuide}
          min={2}
          max={6}
          onChange={setNumFramesGuide}
          hint="Para esta demo bajamos los marcos para que se note el reemplazo."
        />
      </div>

      <AlgorithmCardPicker<ReplacementChoice>
        options={options}
        value={replacementChoice}
        onChange={setReplacementChoice}
        label="Algoritmos de reemplazo"
      />
    </GuideStep>
  )
}

function StepRun() {
  const {
    miniProcesses,
    pagesPerProcess,
    replacementChoice,
    numFramesGuide,
  } = useTutorialStore()

  const { steps, refLength } = useMemo(() => {
    if (!replacementChoice || miniProcesses.length === 0) {
      return { steps: [], refLength: 0 }
    }
    const procs = miniToProcesses(miniProcesses, pagesPerProcess)
    const refs = generateReferenceString(procs)
    const fn = getReplacementAlgorithm(replacementChoice)
    return { steps: fn(refs, numFramesGuide), refLength: refs.length }
  }, [miniProcesses, pagesPerProcess, replacementChoice, numFramesGuide])

  if (!replacementChoice) {
    return (
      <GuideStep title="Mira la simulación" hook="Reproductor" icon={Gauge}>
        <p className="text-sm text-gray-400">
          Regresa al paso anterior y elige un algoritmo.
        </p>
      </GuideStep>
    )
  }

  const desc = REPL_DESCRIPTIONS[replacementChoice]
  const totalFaults = steps.filter((s) => s.isPageFault).length
  const hitRatio = steps.length > 0 ? ((steps.length - totalFaults) / steps.length) * 100 : 0

  return (
    <GuideStep
      title="Mira al algoritmo trabajar"
      hook={`Simulación con ${desc.name}`}
      icon={Gauge}
    >
      <p className="text-sm leading-relaxed text-gray-300">
        Generamos automáticamente {refLength} referencias a páginas a partir de
        tus procesos. Las verdes son aciertos (la página ya estaba), las rojas
        son fallos (hubo que cargarla y quizá sacar otra).
      </p>

      <ReplacementPlayer steps={steps} numFrames={numFramesGuide} />

      <ConceptCard title={`Resultado con ${desc.name}`} tone="info">
        <ul className="ml-4 list-disc space-y-1 text-xs">
          <li>
            Total de referencias:{' '}
            <strong className="text-gray-100">{steps.length}</strong>
          </li>
          <li>
            Fallos de página:{' '}
            <strong className="text-rose-300">{totalFaults}</strong>
          </li>
          <li>
            Tasa de aciertos:{' '}
            <strong className="text-emerald-300">
              {hitRatio.toFixed(1)}%
            </strong>
          </li>
        </ul>
      </ConceptCard>

      <InsightBanner
        body={
          replacementChoice === 'optimal'
            ? 'El algoritmo Óptimo da el mínimo posible de fallos, pero hace trampa: necesita ver el futuro. En la realidad se usa como referencia para medir qué tan bueno es FIFO o LRU.'
            : replacementChoice === 'lru'
            ? 'LRU se acerca al óptimo en la mayoría de los casos porque aprovecha el hecho de que las páginas usadas recientemente suelen volver a usarse pronto.'
            : 'FIFO es muy fácil de implementar, pero a veces saca páginas que aún se usan mucho. Es un buen punto de partida para entender la idea de reemplazo.'
        }
      />
    </GuideStep>
  )
}

export const replacementChapter: GuideChapterDefinition = {
  id: 'reemplazo',
  slug: 'reemplazo',
  label: 'Reemplazo de páginas',
  shortLabel: 'Reemplazo',
  icon: Backpack,
  accent: 'from-rose-500 to-orange-500',
  steps: [
    {
      id: 'intro',
      title: 'Reemplazo',
      icon: Backpack,
      render: () => <StepIntro />,
    },
    {
      id: 'pick',
      title: 'Elige algoritmo',
      icon: ListTree,
      render: () => <StepPick />,
      canAdvance: () => useTutorialStore.getState().replacementChoice !== null,
      blockedHint: COMMON.blockedPickReplacement,
    },
    {
      id: 'run',
      title: 'Simulación',
      icon: Gauge,
      render: () => <StepRun />,
    },
  ],
}
