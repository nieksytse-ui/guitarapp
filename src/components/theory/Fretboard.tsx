import { useMemo } from 'react'
import { buildFretboard, GUITAR_TUNING_HIGH_TO_LOW } from '@/lib/theory'
import { Note } from 'tonal'
import { cn } from '@/lib/utils'

interface FretboardProps {
  fretCount?: number
  /** Pitch classes die opgelicht worden (bijv. toonladder- of akkoordnoten). */
  highlight?: string[]
  /** Grondtoon — krijgt een afwijkende, sterkere kleur. */
  root?: string
  /** Toon nootnamen in de stippen. */
  showLabels?: boolean
  onCellClick?: (note: string, pc: string, string: number, fret: number) => void
  className?: string
}

const FRET_MARKERS = [3, 5, 7, 9]
const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E']

/** Interactieve gitaarhals die noten van een toonladder/akkoord kan oplichten. */
export function Fretboard({
  fretCount = 12,
  highlight = [],
  root,
  showLabels = true,
  onCellClick,
  className,
}: FretboardProps) {
  const board = useMemo(() => buildFretboard(fretCount), [fretCount])
  const highlightSet = useMemo(
    () => new Set(highlight.map((n) => Note.pitchClass(n))),
    [highlight],
  )
  const rootPc = root ? Note.pitchClass(root) : undefined

  return (
    <div className={cn('overflow-x-auto no-scrollbar', className)}>
      <div className="inline-block min-w-full">
        {/* Fretnummers */}
        <div className="flex pl-7">
          {Array.from({ length: fretCount + 1 }, (_, fret) => (
            <div
              key={fret}
              className="w-12 shrink-0 text-center text-[11px] font-medium text-muted-foreground"
            >
              {fret}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-gradient-to-b from-amber-50/40 to-amber-100/20 p-1 dark:from-zinc-800/40 dark:to-zinc-900/30">
          {board.map((row, stringIdx) => (
            <div key={stringIdx} className="flex items-center">
              <div className="w-7 shrink-0 text-center text-xs font-bold text-muted-foreground">
                {STRING_LABELS[stringIdx]}
              </div>
              {row.map((cell) => {
                const isHi = highlightSet.has(cell.pc)
                const isRoot = rootPc === cell.pc
                const isOpen = cell.fret === 0
                return (
                  <div
                    key={cell.fret}
                    className={cn(
                      'relative flex h-9 w-12 shrink-0 items-center justify-center',
                      !isOpen && 'border-l border-zinc-300/60 dark:border-zinc-600/50',
                      cell.fret === 0 && 'border-r-2 border-r-zinc-400 dark:border-r-zinc-500',
                    )}
                  >
                    {/* Snaarlijn */}
                    <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-zinc-400/50 dark:bg-zinc-500/40" />

                    {(isHi || onCellClick) && (
                      <button
                        type="button"
                        onClick={() => onCellClick?.(cell.note, cell.pc, cell.string, cell.fret)}
                        disabled={!onCellClick && !isHi}
                        aria-label={`${cell.pc} op snaar ${cell.string}, fret ${cell.fret}`}
                        className={cn(
                          'relative z-10 grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold transition-all',
                          isRoot
                            ? 'bg-amber text-amber-foreground shadow-soft ring-2 ring-amber/40'
                            : isHi
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-transparent text-transparent hover:bg-primary/10',
                          onCellClick && 'cursor-pointer hover:scale-110',
                        )}
                      >
                        {showLabels && isHi ? cell.pc : ''}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Fret-markers (stippen) */}
          <div className="flex pl-7">
            {Array.from({ length: fretCount + 1 }, (_, fret) => (
              <div key={fret} className="flex w-12 shrink-0 justify-center">
                {FRET_MARKERS.includes(fret) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                )}
                {fret === 12 && (
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
