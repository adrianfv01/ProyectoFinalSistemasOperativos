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
} from 'lucide-react'
import { useTutorialStore } from '../store/tutorialStore'

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
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-br from-gray-950 via-indigo-950/40 to-gray-950 text-gray-100">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-10 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 self-start rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300"
        >
          <HardDrive className="h-3.5 w-3.5" />
          Simulador de Sistema Operativo
        </motion.div>

        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-balance text-4xl font-bold leading-tight text-white sm:text-5xl"
          >
            Aprende cómo funciona tu compu, paso a paso.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-pretty text-base leading-relaxed text-gray-300"
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
          className="grid gap-2.5"
        >
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-900/60 p-3"
            >
              <div className="rounded-lg bg-indigo-500/15 p-2 text-indigo-300">
                <h.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-100">{h.title}</p>
                <p className="text-xs text-gray-400">{h.body}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-auto space-y-2.5"
        >
          <Link
            to="/guia"
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 text-base font-semibold text-white shadow-xl shadow-indigo-900/40 transition active:scale-[0.98] hover:brightness-110"
          >
            {hasProgress ? (
              <>
                <PlayCircle className="h-5 w-5" />
                Continuar la guía
              </>
            ) : (
              <>
                <GraduationCap className="h-5 w-5" />
                Empezar la guía
              </>
            )}
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link
            to="/procesos"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-700 bg-gray-900/70 px-5 text-sm font-medium text-gray-200 transition active:scale-[0.98] hover:bg-gray-800"
          >
            <Settings2 className="h-4 w-4" />
            Ir directo al modo libre
          </Link>

          <p className="px-2 text-center text-[11px] text-gray-500">
            Hecho para celular. También funciona en computadora.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
