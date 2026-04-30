import { useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './components/layout/AppShell'
import ProcessesPage from './pages/ProcessesPage'
import SchedulingPage from './pages/SchedulingPage'
import MemoryPage from './pages/MemoryPage'
import ReplacementPage from './pages/ReplacementPage'
import MetricsPage from './pages/MetricsPage'
import ComparisonPage from './pages/ComparisonPage'
import DemosPage from './pages/DemosPage'
import WelcomePage from './pages/WelcomePage'
import GuideRouter from './guide/GuideRouter'
import { getRouteIndex } from './components/layout/routesConfig'
import { useIsMobile } from './utils/useIsMobile'

function AnimatedPage({
  children,
  direction,
  mobile,
}: {
  children: React.ReactNode
  direction: number
  mobile: boolean
}) {
  const variants = mobile
    ? {
        initial: { opacity: 0, x: direction * 60 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: direction * -60 },
      }
    : {
        initial: { opacity: 0, y: 12 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -12 },
      }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function ShellRoute({
  children,
  direction,
  mobile,
}: {
  children: React.ReactNode
  direction: number
  mobile: boolean
}) {
  return (
    <AppShell>
      <AnimatedPage direction={direction} mobile={mobile}>
        {children}
      </AnimatedPage>
    </AppShell>
  )
}

export default function App() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const previousIndex = useRef<number>(getRouteIndex(location.pathname))

  const currentIndex = getRouteIndex(location.pathname)
  let direction = 0
  if (currentIndex >= 0 && previousIndex.current >= 0) {
    direction = currentIndex >= previousIndex.current ? 1 : -1
  }
  if (currentIndex >= 0) previousIndex.current = currentIndex

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<WelcomePage />} />

        <Route path="/guia" element={<GuideRouter />} />
        <Route path="/guia/:capitulo" element={<GuideRouter />} />
        <Route path="/guia/:capitulo/:paso" element={<GuideRouter />} />

        <Route
          path="/procesos"
          element={
            <ShellRoute direction={direction} mobile={isMobile}>
              <ProcessesPage />
            </ShellRoute>
          }
        />
        <Route
          path="/planificacion"
          element={
            <ShellRoute direction={direction} mobile={isMobile}>
              <SchedulingPage />
            </ShellRoute>
          }
        />
        <Route
          path="/memoria"
          element={
            <ShellRoute direction={direction} mobile={isMobile}>
              <MemoryPage />
            </ShellRoute>
          }
        />
        <Route
          path="/reemplazo"
          element={
            <ShellRoute direction={direction} mobile={isMobile}>
              <ReplacementPage />
            </ShellRoute>
          }
        />
        <Route
          path="/metricas"
          element={
            <ShellRoute direction={direction} mobile={isMobile}>
              <MetricsPage />
            </ShellRoute>
          }
        />
        <Route
          path="/comparacion"
          element={
            <ShellRoute direction={direction} mobile={isMobile}>
              <ComparisonPage />
            </ShellRoute>
          }
        />
        <Route
          path="/demos"
          element={
            <ShellRoute direction={direction} mobile={isMobile}>
              <DemosPage />
            </ShellRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}
