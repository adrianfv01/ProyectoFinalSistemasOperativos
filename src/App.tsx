import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './components/layout/AppShell'
import ProcessesPage from './pages/ProcessesPage'
import SchedulingPage from './pages/SchedulingPage'
import MemoryPage from './pages/MemoryPage'
import ReplacementPage from './pages/ReplacementPage'
import MetricsPage from './pages/MetricsPage'
import ComparisonPage from './pages/ComparisonPage'
import WelcomePage from './pages/WelcomePage'
import GuideRouter from './guide/GuideRouter'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -12 },
}

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function ShellRoute({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AnimatedPage>{children}</AnimatedPage>
    </AppShell>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<WelcomePage />} />

        <Route path="/guia" element={<GuideRouter />} />
        <Route path="/guia/:capitulo" element={<GuideRouter />} />
        <Route path="/guia/:capitulo/:paso" element={<GuideRouter />} />

        <Route path="/procesos" element={<ShellRoute><ProcessesPage /></ShellRoute>} />
        <Route path="/planificacion" element={<ShellRoute><SchedulingPage /></ShellRoute>} />
        <Route path="/memoria" element={<ShellRoute><MemoryPage /></ShellRoute>} />
        <Route path="/reemplazo" element={<ShellRoute><ReplacementPage /></ShellRoute>} />
        <Route path="/metricas" element={<ShellRoute><MetricsPage /></ShellRoute>} />
        <Route path="/comparacion" element={<ShellRoute><ComparisonPage /></ShellRoute>} />
      </Routes>
    </AnimatePresence>
  )
}
