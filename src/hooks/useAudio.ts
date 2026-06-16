import { useEffect } from 'react'
import { initAudio, setMasterVolume } from '@/lib/audio/engine'
import { useSettingsStore } from '@/store/useSettingsStore'

/**
 * Houdt het audiovolume gelijk aan de instellingen en geeft een `ready`-functie
 * terug die de audio-context start (moet vanuit een user-gesture worden aangeroepen).
 */
export function useAudio() {
  const masterVolume = useSettingsStore((s) => s.masterVolume)

  useEffect(() => {
    setMasterVolume(masterVolume)
  }, [masterVolume])

  return {
    /** Start de audio-context (idempotent). Roep aan bij klik op play. */
    ready: async () => {
      await initAudio()
      setMasterVolume(useSettingsStore.getState().masterVolume)
    },
  }
}
