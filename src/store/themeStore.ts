import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light' | 'system'

interface ThemeStore {
  mode: ThemeMode
  dark: boolean
  toggle: () => void
  setMode: (mode: ThemeMode) => void
}

/**
 * Tipos mínimos para la View Transitions API. Aún no están en los lib de
 * TypeScript por defecto, así que los declaramos localmente para evitar
 * castings dispersos por el archivo.
 */
interface ViewTransition {
  readonly ready: Promise<void>
  readonly finished: Promise<void>
  readonly updateCallbackDone: Promise<void>
  skipTransition: () => void
}

type StartViewTransition = (callback: () => void | Promise<void>) => ViewTransition

const STORAGE_KEY = 'simulador-so:theme'

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'dark' || raw === 'light' || raw === 'system') {
      return raw
    }
  } catch {
    // localStorage puede fallar en modo privado o sandbox
  }
  return 'dark'
}

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveDark(mode: ThemeMode): boolean {
  if (mode === 'system') return systemPrefersDark()
  return mode === 'dark'
}

function applyThemeClass(dark: boolean) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (dark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  // También se actualiza la meta del tema para barras nativas (PWA / iOS).
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) {
    meta.content = dark ? '#06070A' : '#FAFAFA'
  }
}

const initialMode = readStoredMode()
const initialDark = resolveDark(initialMode)
applyThemeClass(initialDark)

if (typeof window !== 'undefined' && window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const listener = () => {
    const current = useThemeStore.getState()
    if (current.mode === 'system') {
      const nextDark = systemPrefersDark()
      applyThemeClass(nextDark)
      useThemeStore.setState({ dark: nextDark })
    }
  }
  if (mq.addEventListener) {
    mq.addEventListener('change', listener)
  } else if (mq.addListener) {
    mq.addListener(listener)
  }
}

function persist(mode: ThemeMode) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // ignorar
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Lanza la animación de "barrido" sobre el snapshot del nuevo tema
 * producido por la View Transitions API. El `::view-transition-new(root)`
 * se revela progresivamente con un `clip-path: inset(...)` cuyo borde
 * derecho avanza de izquierda a derecha como una línea recta vertical.
 */
function runWipeAnimation() {
  if (typeof document === 'undefined') return

  document.documentElement.animate(
    [
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)' },
    ],
    {
      duration: 650,
      easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      pseudoElement: '::view-transition-new(root)',
      fill: 'forwards',
    },
  )
}

/**
 * Aplica el cambio real al DOM y persiste el modo. Centralizado para que
 * tanto el camino "instantáneo" como el animado lo usen igual.
 */
function commitTheme(nextDark: boolean) {
  const nextMode: ThemeMode = nextDark ? 'dark' : 'light'
  applyThemeClass(nextDark)
  persist(nextMode)
  return { mode: nextMode, dark: nextDark }
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: initialMode,
  dark: initialDark,
  toggle: () => {
    const current = get()
    const nextDark = !current.dark

    const startViewTransition =
      typeof document !== 'undefined'
        ? (document as unknown as { startViewTransition?: StartViewTransition })
            .startViewTransition
        : undefined

    // Sin soporte de View Transitions o con preferencia de movimiento
    // reducido, aplicamos el cambio de inmediato.
    if (!startViewTransition || prefersReducedMotion()) {
      set(commitTheme(nextDark))
      return
    }

    const transition = startViewTransition.call(document, () => {
      set(commitTheme(nextDark))
    })

    transition.ready
      .then(() => runWipeAnimation())
      .catch(() => {
        // Si la transición es saltada o falla, ya aplicamos el cambio
        // dentro del callback, así que no hay nada más que hacer.
      })
  },
  setMode: (mode) =>
    set(() => {
      const nextDark = resolveDark(mode)
      applyThemeClass(nextDark)
      persist(mode)
      return { mode, dark: nextDark }
    }),
}))
