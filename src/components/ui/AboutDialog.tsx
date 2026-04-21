import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  GraduationCap,
  Sparkles,
  Cpu,
  HardDrive,
  Layers,
  Users,
  ExternalLink,
  Target,
  Code2,
  Rocket,
} from 'lucide-react'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
      />
    </svg>
  )
}

interface AboutDialogProps {
  open: boolean
  onClose: () => void
}

interface TeamMember {
  name: string
  studentId: string
}

const TEAM: TeamMember[] = [
  { name: 'Adrián Flores Villatoro', studentId: '596141' },
  { name: 'Brad Michel Valtierra Rivera', studentId: '370370' },
  { name: 'David Muñoz Zavala', studentId: '621613' },
]

const REPO_URL =
  'https://github.com/AdrianFV725/ProyectoFinalSistemasOperativos'

const TECH_STACK = [
  'React 19',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'Zustand',
  'Framer Motion',
  'Recharts',
  'React Router',
  'Firebase Hosting',
]

const MODULES: { icon: typeof Cpu; title: string; description: string }[] = [
  {
    icon: Cpu,
    title: 'Procesos y planificación',
    description:
      'Ocho algoritmos de CPU (FCFS, SJF, SRTF, HRRN, Round Robin, prioridad, multinivel y multinivel con retroalimentación) con diagrama de Gantt en vivo.',
  },
  {
    icon: HardDrive,
    title: 'Memoria y reemplazo',
    description:
      'Paginación con detección de fallos y cinco algoritmos de reemplazo: FIFO, LRU, óptimo, reloj y segunda oportunidad.',
  },
  {
    icon: Layers,
    title: 'Métricas y comparación',
    description:
      'Tablero consolidado con tiempos promedio, utilización de CPU, tasa de aciertos y comparativa lado a lado entre algoritmos.',
  },
]

export default function AboutDialog({ open, onClose }: AboutDialogProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="about-backdrop"
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden
          />

          <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="about-title"
              initial={{ y: 32, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 30, stiffness: 360 }}
              className="surface-card relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl rounded-b-none p-0 sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="relative shrink-0 overflow-hidden border-b border-[color:var(--border)] px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
                <span
                  className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br from-[color:var(--accent-soft)] via-transparent to-transparent opacity-90"
                  aria-hidden
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-2)]">
                      <Sparkles className="h-5 w-5 text-[color:var(--accent)]" />
                      <span className="absolute -inset-0.5 -z-10 rounded-xl bg-[color:var(--accent-soft)] blur-md" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                        Acerca del proyecto
                      </p>
                      <h2
                        id="about-title"
                        className="mt-0.5 text-lg font-semibold tracking-tight text-[color:var(--text)] sm:text-xl"
                      >
                        Simulador de Sistemas Operativos
                      </h2>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-1.5 py-0.5 font-mono text-[10px] text-[color:var(--text-muted)]">
                          <GraduationCap className="h-3 w-3" />
                          UDEM
                        </span>
                        <span className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-1.5 py-0.5 font-mono text-[10px] text-[color:var(--text-muted)]">
                          Primavera 2026
                        </span>
                        <span className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-1.5 py-0.5 font-mono text-[10px] text-[color:var(--text-muted)]">
                          v1.0
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text)] active:scale-95"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                <section>
                  <SectionHeading icon={Target} title="Objetivo" />
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--text-muted)]">
                    Llevar los conceptos abstractos de un sistema operativo a algo
                    que se pueda ver, tocar y experimentar. La aplicación combina
                    una guía interactiva por capítulos para quien llega sin
                    contexto previo, con un modo libre que permite configurar y
                    ejecutar simulaciones completas de planificación de CPU,
                    paginación de memoria y reemplazo de páginas.
                  </p>
                </section>

                <section>
                  <SectionHeading icon={Layers} title="Lo que incluye" />
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {MODULES.map(({ icon: Icon, title, description }) => (
                      <div
                        key={title}
                        className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)]/60 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                          <p className="text-[12.5px] font-semibold text-[color:var(--text)]">
                            {title}
                          </p>
                        </div>
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-[color:var(--text-muted)]">
                          {description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <SectionHeading icon={Rocket} title="Arquitectura y escalabilidad" />
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--text-muted)]">
                    El motor de simulación vive en{' '}
                    <code className="rounded bg-[color:var(--surface-2)] px-1 py-0.5 font-mono text-[12px] text-[color:var(--text)]">
                      src/engine/
                    </code>{' '}
                    como TypeScript puro, sin dependencias de React. Cada familia
                    de algoritmos expone una factory (
                    <code className="rounded bg-[color:var(--surface-2)] px-1 py-0.5 font-mono text-[12px] text-[color:var(--text)]">
                      getScheduler
                    </code>
                    ,{' '}
                    <code className="rounded bg-[color:var(--surface-2)] px-1 py-0.5 font-mono text-[12px] text-[color:var(--text)]">
                      getReplacementAlgorithm
                    </code>
                    ), por lo que sumar un nuevo planificador o un nuevo
                    algoritmo de reemplazo es agregar un archivo y registrarlo
                    en su{' '}
                    <code className="rounded bg-[color:var(--surface-2)] px-1 py-0.5 font-mono text-[12px] text-[color:var(--text)]">
                      index.ts
                    </code>
                    . La interfaz se alimenta de cinco stores de Zustand
                    independientes (procesos, planificación, memoria, tema y
                    tutorial), lo que mantiene la lógica desacoplada de la vista
                    y permite reutilizar el motor desde pruebas, scripts o
                    nuevas pantallas sin reescribirlo.
                  </p>
                </section>

                <section>
                  <SectionHeading icon={Code2} title="Tecnologías" />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {TECH_STACK.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)]/70 px-2 py-1 font-mono text-[11px] text-[color:var(--text-muted)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <SectionHeading icon={Users} title="Equipo" />
                  <ul className="mt-2 grid gap-2 sm:grid-cols-3">
                    {TEAM.map((member) => (
                      <li
                        key={member.studentId}
                        className="flex flex-col rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)]/60 p-3"
                      >
                        <span className="text-[12.5px] font-semibold leading-snug text-[color:var(--text)]">
                          {member.name}
                        </span>
                        <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
                          ID {member.studentId}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <div className="flex items-center gap-2">
                    <GithubIcon className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                      Repositorio
                    </h3>
                  </div>
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-2 flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-3.5 py-3 transition hover:border-[color:var(--accent)]/50 hover:bg-[color:var(--surface-2)]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)]">
                        <GithubIcon className="h-4 w-4 text-[color:var(--text)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-[color:var(--text)]">
                          AdrianFV725/ProyectoFinalSistemasOperativos
                        </p>
                        <p className="truncate text-[11.5px] text-[color:var(--text-muted)]">
                          Código fuente, README extendido y guía de despliegue
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-[color:var(--text-faint)] transition group-hover:text-[color:var(--accent)]" />
                  </a>
                </section>
              </div>

              <div className="shrink-0 border-t border-[color:var(--border)] bg-[color:var(--bg-soft)]/60 px-5 py-3 sm:px-7">
                <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                  Proyecto final · Sistemas Operativos · UDEM
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

interface SectionHeadingProps {
  icon: typeof Target
  title: string
}

function SectionHeading({ icon: Icon, title }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-[color:var(--accent)]" />
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
        {title}
      </h3>
    </div>
  )
}
