import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light' | 'system'

interface ThemeStore {
  mode: ThemeMode
  dark: boolean
  toggle: () => void
  setMode: (mode: ThemeMode) => void
}

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

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: initialMode,
  dark: initialDark,
  toggle: () =>
    set((s) => {
      const nextDark = !s.dark
      const nextMode: ThemeMode = nextDark ? 'dark' : 'light'
      applyThemeClass(nextDark)
      persist(nextMode)
      return { mode: nextMode, dark: nextDark }
    }),
  setMode: (mode) =>
    set(() => {
      const nextDark = resolveDark(mode)
      applyThemeClass(nextDark)
      persist(mode)
      return { mode, dark: nextDark }
    }),
}))
