import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resolveTheme, useSettingsStore } from '@/store/useSettingsStore'

export function ThemeToggle() {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const resolved = resolveTheme(theme)

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={resolved === 'dark' ? 'Schakel naar lichte modus' : 'Schakel naar donkere modus'}
      onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
    >
      {resolved === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
