import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileTopNav } from '@/components/layout/MobileTopNav'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useApplyTheme } from '@/hooks/useApplyTheme'
import { useProgressStore } from '@/store/useProgressStore'

export function AppLayout() {
  useApplyTheme()
  const load = useProgressStore((s) => s.load)

  // Laad opgeslagen voortgang één keer bij het opstarten.
  useEffect(() => {
    void load()
  }, [load])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
        <Sidebar />
        <div className="flex min-h-screen flex-col">
          <MobileTopNav />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <Outlet />
          </main>
          <footer className="border-t border-border/60 px-4 py-5 text-center text-xs text-muted-foreground">
            FretFlow · gemaakt om gitaar leren leuk te houden 🎸
          </footer>
        </div>
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
