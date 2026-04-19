import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { COMMON } from './copy'

interface GuideShellProps {
  chapterLabel: string
  chapterIndex: number
  totalChapters: number
  stepIndex: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  canBack: boolean
  canNext: boolean
  nextLabel?: string
  blockedHint?: string
  children: ReactNode
}

export default function GuideShell({
  chapterLabel,
  chapterIndex,
  totalChapters,
  stepIndex,
  totalSteps,
  onBack,
  onNext,
  canBack,
  canNext,
  nextLabel,
  blockedHint,
  children,
}: GuideShellProps) {
  const navigate = useNavigate()

  const overallProgress =
    ((chapterIndex + (stepIndex + 1) / totalSteps) / totalChapters) * 100

  const exit = () => {
    if (window.confirm(COMMON.exitConfirm)) {
      navigate('/')
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900 text-gray-100">
      <header className="sticky top-0 z-30 border-b border-gray-800/80 bg-gray-950/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={exit}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition active:scale-95 hover:bg-gray-800 hover:text-gray-200"
            aria-label={COMMON.exitGuide}
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
              Capítulo {chapterIndex + 1} de {totalChapters}
            </span>
            <span className="text-xs font-medium text-gray-200">
              {chapterLabel}
            </span>
          </div>

          <span className="text-xs tabular-nums text-gray-500">
            {stepIndex + 1}/{totalSteps}
          </span>
        </div>

        <div className="mx-auto h-1 w-full max-w-md overflow-hidden bg-gray-800">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
            initial={false}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-md px-4 py-5 pb-32 sm:px-5">
          {children}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-800/80 bg-gray-950/95 backdrop-blur">
        <div className="mx-auto w-full max-w-md px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
          {!canNext && blockedHint && (
            <p className="mb-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-300">
              {blockedHint}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBack}
              disabled={!canBack}
              className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-700 bg-gray-900 text-sm font-semibold text-gray-300 transition active:scale-[0.98] hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
              {COMMON.back}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              className="flex h-12 flex-[1.6] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition active:scale-[0.98] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {nextLabel ?? COMMON.next}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
