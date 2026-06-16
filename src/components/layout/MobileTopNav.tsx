import { NavLink } from 'react-router-dom'
import { navItems } from '@/config/navigation'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

/** Mobiele kop met logo + horizontaal scrollbare navigatiepillen. */
export function MobileTopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Logo />
        <ThemeToggle />
      </div>
      <nav className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pb-2.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
