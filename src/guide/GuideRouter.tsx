import { useEffect, useMemo } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import GuideShell from './GuideShell'
import { useTutorialStore } from '../store/tutorialStore'
import { COMMON } from './copy'
import type { GuideChapterDefinition } from './types'
import { welcomeChapter } from './chapters/WelcomeChapter'
import { processesChapter } from './chapters/ProcessesChapter'
import { schedulingChapter } from './chapters/SchedulingChapter'
import { memoryChapter } from './chapters/MemoryChapter'
import { replacementChapter } from './chapters/ReplacementChapter'
import { summaryChapter } from './chapters/SummaryChapter'

const CHAPTERS: GuideChapterDefinition[] = [
  welcomeChapter,
  processesChapter,
  schedulingChapter,
  memoryChapter,
  replacementChapter,
  summaryChapter,
]

function findChapterIndex(slug?: string): number {
  if (!slug) return 0
  const idx = CHAPTERS.findIndex((c) => c.slug === slug)
  return idx === -1 ? 0 : idx
}

interface RouteParams {
  capitulo?: string
  paso?: string
  [key: string]: string | undefined
}

export default function GuideRouter() {
  const navigate = useNavigate()
  const params = useParams<RouteParams>()

  const {
    currentChapterId,
    currentStepIndex,
    completedChapters,
    setChapter,
    setStep,
    markChapterCompleted,
  } = useTutorialStore()

  // Subscribe to fields that gate step advancement so canAdvance updates re-render.
  useTutorialStore((s) => s.miniProcesses.length)
  useTutorialStore((s) => s.schedulingChoice)
  useTutorialStore((s) => s.replacementChoice)

  const chapterIndex = findChapterIndex(params.capitulo)
  const chapter = CHAPTERS[chapterIndex]

  const stepIndex = useMemo(() => {
    const raw = parseInt(params.paso ?? '1', 10)
    if (isNaN(raw)) return 0
    return Math.max(0, Math.min(chapter.steps.length - 1, raw - 1))
  }, [params.paso, chapter.steps.length])

  useEffect(() => {
    if (!params.capitulo) return
    setChapter(chapter.id)
    setStep(stepIndex)
  }, [chapter.id, stepIndex, params.capitulo, setChapter, setStep])

  if (!params.capitulo) {
    const slug =
      CHAPTERS.find((c) => c.id === currentChapterId)?.slug ?? CHAPTERS[0].slug
    const targetStep = Math.min(
      currentStepIndex + 1,
      (CHAPTERS.find((c) => c.id === currentChapterId)?.steps.length ?? 1),
    )
    return <Navigate to={`/guia/${slug}/${targetStep}`} replace />
  }

  const step = chapter.steps[stepIndex]

  const isFirstStepEver = chapterIndex === 0 && stepIndex === 0
  const isLastChapter = chapterIndex === CHAPTERS.length - 1
  const isLastStepInChapter = stepIndex === chapter.steps.length - 1
  const isLastStepEver = isLastChapter && isLastStepInChapter

  const canAdvance = step.canAdvance ? step.canAdvance() : true

  function goNext() {
    if (!canAdvance) return

    if (isLastStepInChapter) {
      markChapterCompleted(chapter.id)
      if (isLastChapter) return
      const nextChapter = CHAPTERS[chapterIndex + 1]
      navigate(`/guia/${nextChapter.slug}/1`)
      return
    }

    navigate(`/guia/${chapter.slug}/${stepIndex + 2}`)
  }

  function goBack() {
    if (isFirstStepEver) {
      navigate('/')
      return
    }
    if (stepIndex === 0) {
      const prevChapter = CHAPTERS[chapterIndex - 1]
      navigate(`/guia/${prevChapter.slug}/${prevChapter.steps.length}`)
      return
    }
    navigate(`/guia/${chapter.slug}/${stepIndex}`)
  }

  function jumpTo(slug: string, targetStepIndex: number) {
    const target = CHAPTERS.find((c) => c.slug === slug)
    if (!target) return
    const targetIdx = CHAPTERS.indexOf(target)
    const isAccessibleChapter =
      completedChapters.includes(target.id) || targetIdx <= chapterIndex
    if (!isAccessibleChapter) return
    const safeStep = Math.max(
      0,
      Math.min(target.steps.length - 1, targetStepIndex),
    )
    navigate(`/guia/${target.slug}/${safeStep + 1}`)
  }

  const stepKey = `${chapter.id}-${stepIndex}`

  return (
    <GuideShell
      chapters={CHAPTERS}
      currentChapterId={chapter.id}
      currentStepIndex={stepIndex}
      completedChapterIds={completedChapters}
      chapterLabel={chapter.label}
      chapterIndex={chapterIndex}
      totalChapters={CHAPTERS.length}
      stepIndex={stepIndex}
      totalSteps={chapter.steps.length}
      onBack={goBack}
      onNext={goNext}
      onJumpTo={jumpTo}
      canBack
      canNext={canAdvance && !isLastStepEver}
      nextLabel={isLastStepInChapter && !isLastChapter ? COMMON.finish : undefined}
      blockedHint={!canAdvance ? step.blockedHint : undefined}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {step.render()}
        </motion.div>
      </AnimatePresence>
    </GuideShell>
  )
}
