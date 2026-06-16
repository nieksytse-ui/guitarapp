import { NavLink } from 'react-router-dom'
import { navItems } from '@/config/navigation'
import { Logo } from '@/components/Logo'
import { XpLevelCard } from '@/components/XpLevelCard'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-border/70 bg-card/40 p-4 lg:flex">
      <div className="flex items-center justify-between px-1 py-2">
        <Logo />
        <ThemeToggle />
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <XpLevelCard className="mt-2" />
    </aside>
  )
}
