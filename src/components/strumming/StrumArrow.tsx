import { ArrowDown, ArrowUp, X } from 'lucide-react'
import type { StrumCell } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StrumArrowProps {
  cell: StrumCell
  count: string
  active?: boolean
  isBeat?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Toont één cel van het strumming-patroon als pijl (↓/↑), chunk (X) of rust,
 * met de telaanduiding eronder. Licht op wanneer de playhead erlangs komt.
 */
export function StrumArrow({
  cell,
  count,
  active = false,
  isBeat = false,
  onClick,
  className,
}: StrumArrowProps) {
  const content =
    cell === 'D' ? (
      <ArrowDown className="h-6 w-6" strokeWidth={2.5} />
    ) : cell === 'U' ? (
      <ArrowUp className="h-6 w-6" strokeWidth={2.5} />
    ) : cell === 'X' ? (
      <X className="h-5 w-5" strokeWidth={2.5} />
    ) : (
      <span className="block h-1.5 w-1.5 rounded-full bg-current opacity-40" />
    )

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        aria-label={`${count}: ${cellLabel(cell)}`}
        className={cn(
          'grid h-12 w-12 place-items-center rounded-xl border-2 transition-all duration-100 sm:h-14 sm:w-14',
          onClick && 'cursor-pointer hover:border-primary/60',
          cell === '-'
            ? 'border-dashed border-border text-muted-foreground'
            : 'border-border',
          cell === 'D' && 'text-primary',
          cell === 'U' && 'text-sky-500',
          cell === 'X' && 'text-rose-500',
          active &&
            'scale-110 border-primary bg-primary/10 shadow-soft ring-2 ring-primary/40',
        )}
      >
        {content}
      </button>
      <span
        className={cn(
          'text-xs font-semibold tabular-nums',
          isBeat ? 'text-foreground' : 'text-muted-foreground',
          active && 'text-primary',
        )}
      >
        {count}
      </span>
    </div>
  )
}

function cellLabel(cell: StrumCell): string {
  switch (cell) {
    case 'D':
      return 'neerwaartse aanslag'
    case 'U':
      return 'opwaartse aanslag'
    case 'X':
      return 'gedempte aanslag'
    default:
      return 'geen aanslag'
  }
}
