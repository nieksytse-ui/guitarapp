import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface SettingsState {
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  toggleTheme: () => void

  /** Hoofdvolume voor alle audio (0..1). */
  masterVolume: number
  setMasterVolume: (v: number) => void

  /** Accent op tel 1 in de metronoom. */
  metronomeAccent: boolean
  setMetronomeAccent: (b: boolean) => void

  /** Tel een maat in voordat oefeningen starten. */
  countIn: boolean
  setCountIn: (b: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const current = resolveTheme(get().theme)
        set({ theme: current === 'dark' ? 'light' : 'dark' })
      },

      masterVolume: 0.8,
      setMasterVolume: (masterVolume) => set({ masterVolume }),

      metronomeAccent: true,
      setMetronomeAccent: (metronomeAccent) => set({ metronomeAccent }),

      countIn: true,
      setCountIn: (countIn) => set({ countIn }),
    }),
    { name: 'fretflow-settings' },
  ),
)

/** Zet 'system' om naar de daadwerkelijke voorkeur van het OS. */
export function resolveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined' || !window.matchMedia) return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}
