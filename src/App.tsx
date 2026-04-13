import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './components/layout/AppShell'
import ProcessesPage from './pages/ProcessesPage'
import SchedulingPage from './pages/SchedulingPage'
import MemoryPage from './pages/MemoryPage'
import ReplacementPage from './pages/ReplacementPage'
import MetricsPage from './pages/MetricsPage'
import ComparisonPage from './pages/ComparisonPage'

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

export default function App() {
  const location = useLocation()

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage><ProcessesPage /></AnimatedPage>} />
          <Route path="/scheduling" element={<AnimatedPage><SchedulingPage /></AnimatedPage>} />
          <Route path="/memory" element={<AnimatedPage><MemoryPage /></AnimatedPage>} />
          <Route path="/replacement" element={<AnimatedPage><ReplacementPage /></AnimatedPage>} />
          <Route path="/metrics" element={<AnimatedPage><MetricsPage /></AnimatedPage>} />
          <Route path="/comparison" element={<AnimatedPage><ComparisonPage /></AnimatedPage>} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  )
}
