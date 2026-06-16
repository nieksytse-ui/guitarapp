import { ArrowDown, ArrowUp, X } from 'lucide-react'
import type { StrumCell } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PatternPreviewProps {
  cells: StrumCell[]
  className?: string
}

/**
 * Compacte, niet-interactieve mini-weergave van een strumming-patroon: een rij
 * kleine pijltjes (↓/↑), chunks (✕) en rustpunten (·). Handig in patroonkaarten
 * zodat je in één oogopslag het ritme herkent zonder het af te spelen.
 */
export function PatternPreview({ cells, className }: PatternPreviewProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-hidden>
      {cells.map((cell, i) => (
        <span
          key={i}
          className={cn(
            'grid h-5 w-4 place-items-center',
            cell === 'D' && 'text-primary',
            cell === 'U' && 'text-sky-500',
            cell === 'X' && 'text-rose-500',
            cell === '-' && 'text-muted-foreground/40',
          )}
        >
          {cell === 'D' ? (
            <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.75} />
          ) : cell === 'U' ? (
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.75} />
          ) : cell === 'X' ? (
            <X className="h-3 w-3" strokeWidth={3} />
          ) : (
            <span className="h-1 w-1 rounded-full bg-current" />
          )}
        </span>
      ))}
    </div>
  )
}
