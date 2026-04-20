import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, Dot, GraduationCap, LogOut } from 'lucide-react'
import { COMMON } from '../copy'
import type { GuideChapterDefinition } from '../types'

interface GuideRailDesktopProps {
  chapters: GuideChapterDefinition[]
  currentChapterId: string
  currentStepIndex: number
  completedChapterIds: string[]
  onJumpTo: (chapterSlug: string, stepIndex: number) => void
}

export default function GuideRailDesktop({
  chapters,
  currentChapterId,
  currentStepIndex,
  completedChapterIds,
  onJumpTo,
}: GuideRailDesktopProps) {
  const navigate = useNavigate()

  const currentChapterIndex = chapters.findIndex(
    (c) => c.id === currentChapterId,
  )

  function handleExit() {
    if (window.confirm(COMMON.exitConfirm)) {
      navigate('/')
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-[color:var(--border)] bg-[color:var(--bg-soft)]/85 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-[color:var(--border)] px-5">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-2)]">
          <GraduationCap className="h-4 w-4 text-[color:var(--accent)]" />
          <span className="absolute -inset-0.5 -z-10 rounded-lg bg-[color:var(--accent-soft)] blur-md" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[13px] font-semibold tracking-tight text-[color:var(--text)]">
            Guía interactiva
          </span>
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
            Tutorial paso a paso
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
          Capítulos
        </p>
        <ol className="space-y-1">
          {chapters.map((chapter, idx) => {
            const isCompleted = completedChapterIds.includes(chapter.id)
            const isActive = chapter.id === currentChapterId
            const isLocked =
              !isCompleted && !isActive && idx > currentChapterIndex
            const Icon = chapter.icon

            return (
              <li key={chapter.id}>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => !isLocked && onJumpTo(chapter.slug, 0)}
                  className={`group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition ${
                    isActive
                      ? 'bg-[color:var(--surface)] text-[color:var(--text)]'
                      : isLocked
                      ? 'cursor-not-allowed text-[color:var(--text-faint)]'
                      : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--text)]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-[color:var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                  )}
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold ${
                      isCompleted
                        ? 'bg-[color:var(--surface-2)] text-emerald-400'
                        : isActive
                        ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                        : 'bg-[color:var(--surface-2)] text-[color:var(--text-muted)]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? 'text-[color:var(--accent)]'
                        : isLocked
                        ? 'text-[color:var(--text-faint)]'
                        : 'text-[color:var(--text-muted)] group-hover:text-[color:var(--text)]'
                    }`}
                  />
                  <span className="flex-1 truncate font-medium">
                    {chapter.label}
                  </span>
                </button>

                {isActive && chapter.steps.length > 1 && (
                  <ul className="ml-9 mt-1 space-y-0.5 border-l border-[color:var(--border)] pl-2">
                    {chapter.steps.map((step, sIdx) => {
                      const isCurrentStep = sIdx === currentStepIndex
                      const isPastStep = sIdx < currentStepIndex
                      return (
                        <li key={step.id}>
                          <button
                            type="button"
                            onClick={() => onJumpTo(chapter.slug, sIdx)}
                            className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[12px] transition ${
                              isCurrentStep
                                ? 'text-[color:var(--text)]'
                                : isPastStep
                                ? 'text-[color:var(--text-muted)] hover:text-[color:var(--text)]'
                                : 'text-[color:var(--text-faint)] hover:text-[color:var(--text-muted)]'
                            }`}
                          >
                            {isPastStep ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-400/80" />
                            ) : isCurrentStep ? (
                              <Dot className="h-4 w-4 text-[color:var(--accent)]" />
                            ) : (
                              <Circle className="h-2 w-2 text-[color:var(--text-faint)]" />
                            )}
                            <span className="truncate">{step.title}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="border-t border-[color:var(--border)] px-3 py-3">
        <button
          type="button"
          onClick={handleExit}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface)] hover:text-[color:var(--text)]"
        >
          <LogOut size={14} />
          {COMMON.exitGuide}
        </button>
        <p className="mt-2 px-3 text-[10px] text-[color:var(--text-faint)]">
          Tu progreso se guarda automáticamente.
        </p>
      </div>
    </aside>
  )
}
