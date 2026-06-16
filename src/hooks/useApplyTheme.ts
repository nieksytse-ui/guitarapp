import { useEffect } from 'react'
import { resolveTheme, useSettingsStore } from '@/store/useSettingsStore'

/**
 * Past het gekozen thema toe op <html> en luistert naar wijzigingen in de
 * systeemvoorkeur wanneer 'system' is gekozen.
 */
export function useApplyTheme() {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement

    const apply = () => {
      const resolved = resolveTheme(theme)
      root.classList.toggle('dark', resolved === 'dark')
      root.style.colorScheme = resolved
    }

    apply()

    if (theme === 'system' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme])
}
