import { create } from 'zustand'

interface ThemeStore {
  dark: boolean
  toggle: () => void
}

function applyThemeClass(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

applyThemeClass(true)

export const useThemeStore = create<ThemeStore>((set) => ({
  dark: true,
  toggle: () =>
    set((s) => {
      const next = !s.dark
      applyThemeClass(next)
      return { dark: next }
    }),
}))
