import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  HardDrive,
  Cpu,
  Layers,
  RefreshCw,
  ArrowRight,
  PlayCircle,
  Settings2,
  Sparkles,
  FlaskConical,
} from 'lucide-react'
import { useTutorialStore } from '../store/tutorialStore'
import ThemeToggle from '../components/ui/ThemeToggle'
import AboutButton from '../components/ui/AboutButton'

const HIGHLIGHTS = [
  {
    icon: Cpu,
    title: 'Procesos y CPU',
    body: 'Crea procesos y míralos correr en la CPU.',
  },
  {
    icon: Layers,
    title: 'Memoria y páginas',
    body: 'Entiende cómo se reparte la RAM en marcos.',
  },
  {
    icon: RefreshCw,
    title: 'Reemplazo de páginas',
    body: 'Compara FIFO, LRU y el algoritmo óptimo.',
  },
]

export default function WelcomePage() {
  const completedChapters = useTutorialStore((s) => s.completedChapters)
  const hasProgress = completedChapters.length > 0

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden text-[color:var(--text)]">
      {/* aurora del hero */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-[color:var(--accent-soft)] blur-[120px]" />
        <div className="absolute -bottom-32 right-[-10%] h-[420px] w-[480px] rounded-full bg-[color:var(--accent-soft)] opacity-60 blur-[120px]" />
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-7 px-5 pt-12 pb-8 sm:max-w-lg">
        <div className="flex items-center justify-between gap-3">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="chip"
          >
            <HardDrive className="h-3 w-3 text-[color:var(--accent)]" />
            <span className="text-[color:var(--text-muted)]">
              Simulador de Sistema Operativo
            </span>
            <span className="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] shadow-[0_0_10px_var(--accent)]" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <AboutButton />
            <ThemeToggle />
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-balance text-[40px] font-semibold leading-[1.05] tracking-tight sm:text-[52px]"
          >
            <span className="gradient-text">
              Aprende cómo funciona tu compu, paso a paso.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-pretty text-[15px] leading-relaxed text-[color:var(--text-muted)]"
          >
            Una guía interactiva con analogías sencillas, animaciones y mini
            simulaciones. No necesitas saber nada sobre sistemas operativos para
            empezar.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid gap-2"
        >
          {HIGHLIGHTS.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 + i * 0.05 }}
              className="surface-glass group flex items-start gap-3 p-3.5 transition hover:border-[color:var(--accent)]/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-2)] text-[color:var(--accent)] transition group-hover:border-[color:var(--accent)]/40">
                <h.icon className="h-[18px] w-[18px]" />
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[13.5px] font-semibold tracking-tight text-[color:var(--text)]">
                  {h.title}
                </p>
                <p className="mt-0.5 text-[12.5px] text-[color:var(--text-muted)]">
                  {h.body}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-auto space-y-2.5"
        >
          <Link
            to="/guia"
            className="btn-primary group h-14 w-full text-[15px]"
          >
            {hasProgress ? (
              <PlayCircle className="h-5 w-5" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {hasProgress ? 'Continuar la guía' : 'Empezar la guía'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            to="/demos"
            className="btn-ghost h-12 w-full text-[13px]"
          >
            <FlaskConical className="h-4 w-4" />
            Cargar un demo precargado
          </Link>

          <Link
            to="/procesos"
            className="btn-ghost h-12 w-full text-[13px]"
          >
            <Settings2 className="h-4 w-4" />
            Ir directo al modo libre
          </Link>

          <p className="px-2 text-center text-[11px] text-[color:var(--text-faint)]">
            Hecho para celular. También funciona en computadora.
          </p>
        </motion.div>
      </main>

      <div className="pointer-events-none mb-6 flex items-center justify-center gap-2 text-[10px] text-[color:var(--text-faint)]">
        <GraduationCap className="h-3 w-3" />
        <span className="font-mono uppercase tracking-[0.18em]">
          Proyecto final · Sistemas Operativos
        </span>
      </div>
    </div>
  )
}
