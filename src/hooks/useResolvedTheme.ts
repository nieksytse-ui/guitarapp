import { useEffect, useState } from 'react'
import { resolveTheme, useSettingsStore } from '@/store/useSettingsStore'

/**
 * Geeft het daadwerkelijk actieve thema ('light' | 'dark') terug en
 * her-rendert wanneer de gebruiker of het systeem het thema wijzigt.
 * Handig voor canvas/SVG-componenten die expliciete kleuren nodig hebben.
 */
export function useResolvedTheme(): 'light' | 'dark' {
  const theme = useSettingsStore((s) => s.theme)
  const [resolved, setResolved] = useState(() => resolveTheme(theme))

  useEffect(() => {
    setResolved(resolveTheme(theme))
    if (theme === 'system' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = () => setResolved(mq.matches ? 'dark' : 'light')
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }
  }, [theme])

  return resolved
}
