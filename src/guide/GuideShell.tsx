import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { COMMON } from './copy'
import type { GuideChapterDefinition } from './types'
import GuideRailDesktop from './components/GuideRailDesktop'
import ThemeToggle from '../components/ui/ThemeToggle'
import AboutButton from '../components/ui/AboutButton'
import Modal from '../components/ui/Modal'

interface GuideShellProps {
  chapters: GuideChapterDefinition[]
  currentChapterId: string
  currentStepIndex: number
  completedChapterIds: string[]
  chapterLabel: string
  chapterIndex: number
  totalChapters: number
  stepIndex: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  onJumpTo: (chapterSlug: string, stepIndex: number) => void
  canBack: boolean
  canNext: boolean
  nextLabel?: string
  blockedHint?: string
  children: ReactNode
}

export default function GuideShell({
  chapters,
  currentChapterId,
  currentStepIndex,
  completedChapterIds,
  chapterLabel,
  chapterIndex,
  totalChapters,
  stepIndex,
  totalSteps,
  onBack,
  onNext,
  onJumpTo,
  canBack,
  canNext,
  nextLabel,
  blockedHint,
  children,
}: GuideShellProps) {
  const navigate = useNavigate()
  const [showExitModal, setShowExitModal] = useState(false)

  const overallProgress =
    ((chapterIndex + (stepIndex + 1) / totalSteps) / totalChapters) * 100

  const exit = () => {
    setShowExitModal(true)
  }

  const confirmExit = () => {
    setShowExitModal(false)
    navigate('/')
  }

  return (
    <div className="relative min-h-[100dvh] text-[color:var(--text)]">
      {/* aurora sutil para la guía */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-[color:var(--accent-soft)] opacity-60 blur-[120px]" />
      </div>

      {/* ====== Mobile (<1024px) ====== */}
      <div className="flex min-h-[100dvh] flex-col lg:hidden">
        <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[color:var(--bg-soft)]/85 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3">
            <button
              type="button"
              onClick={exit}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--text-muted)] transition active:scale-95 hover:bg-[color:var(--surface)] hover:text-[color:var(--text)]"
              aria-label={COMMON.exitGuide}
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
                Capítulo {chapterIndex + 1} de {totalChapters}
              </span>
              <span className="text-xs font-medium text-[color:var(--text)]">
                {chapterLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] tabular-nums text-[color:var(--text-faint)]">
                {stepIndex + 1}/{totalSteps}
              </span>
              <AboutButton />
              <ThemeToggle />
            </div>
          </div>

          <div className="relative mx-auto h-[2px] w-full max-w-md overflow-hidden bg-[color:var(--border)]">
            <motion.div
              className="absolute inset-y-0 left-0 bg-[color:var(--accent)] shadow-[0_0_8px_var(--accent)]"
              initial={false}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-md px-4 py-5 pb-32 sm:px-5">
            {children}
          </div>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-[color:var(--border)] bg-[color:var(--bg-soft)]/90 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-md px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
            {!canNext && blockedHint && (
              <p className="mb-2 rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-3 py-2 text-center text-xs text-[color:var(--text-muted)]">
                {blockedHint}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBack}
                disabled={!canBack}
                className="btn-ghost h-12 flex-1"
              >
                <ChevronLeft size={18} />
                {COMMON.back}
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!canNext}
                className="btn-primary h-12 flex-[1.6]"
              >
                {nextLabel ?? COMMON.next}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* ====== Desktop (>=1024px) ====== */}
      <div className="hidden lg:flex">
        <GuideRailDesktop
          chapters={chapters}
          currentChapterId={currentChapterId}
          currentStepIndex={currentStepIndex}
          completedChapterIds={completedChapterIds}
          onJumpTo={onJumpTo}
          onExitRequest={exit}
        />

        <div className="flex min-h-[100dvh] flex-1 flex-col lg:ml-64">
          <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[color:var(--bg-soft)]/80 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-8 py-4">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
                  Capítulo {chapterIndex + 1} de {totalChapters}
                </span>
                <span className="text-sm font-semibold text-[color:var(--text)]">
                  {chapterLabel}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] tabular-nums text-[color:var(--text-faint)]">
                  Paso {stepIndex + 1} de {totalSteps}
                </span>
                <AboutButton />
                <ThemeToggle size="regular" />
                <button
                  type="button"
                  onClick={exit}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-xs font-medium text-[color:var(--text-muted)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)]"
                  aria-label={COMMON.exitGuide}
                >
                  <X size={14} />
                  Salir
                </button>
              </div>
            </div>

            <div className="relative mx-auto h-[2px] w-full max-w-3xl overflow-hidden bg-[color:var(--border)]">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[color:var(--accent)] shadow-[0_0_8px_var(--accent)]"
                initial={false}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl px-8 py-10 pb-36">
              {children}
            </div>
          </main>

          <footer className="sticky bottom-0 z-30 border-t border-[color:var(--border)] bg-[color:var(--bg-soft)]/90 backdrop-blur-xl">
            <div className="mx-auto w-full max-w-3xl px-8 py-4">
              {!canNext && blockedHint && (
                <p className="mb-3 rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-3 py-2 text-center text-xs text-[color:var(--text-muted)]">
                  {blockedHint}
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={!canBack}
                  className="btn-ghost h-11"
                >
                  <ChevronLeft size={18} />
                  {COMMON.back}
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canNext}
                  className="btn-primary h-11"
                >
                  {nextLabel ?? COMMON.next}
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <Modal
        open={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Salir de la guía"
        description={COMMON.exitConfirm}
        actions={
          <>
            <button
              type="button"
              className="btn-ghost flex-1 px-4 py-2 sm:flex-none"
              onClick={() => setShowExitModal(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary flex-1 px-4 py-2 sm:flex-none"
              onClick={confirmExit}
            >
              Salir
            </button>
          </>
        }
      />
    </div>
  )
}
