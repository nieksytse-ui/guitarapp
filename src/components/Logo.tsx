import { Guitar } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-soft">
        <Guitar className="h-5 w-5" />
      </div>
      {!iconOnly && (
        <span className="text-lg font-extrabold tracking-tight">
          Fret<span className="text-primary">Flow</span>
        </span>
      )}
    </div>
  )
}
