import { useMemo } from 'react'
import { Note } from 'tonal'
import { cn } from '@/lib/utils'

interface PianoKeyboardProps {
  /** Pitch classes om op te lichten. */
  highlight?: string[]
  root?: string
  /** Aantal octaven (1 of 2). */
  octaves?: number
  startOctave?: number
  showLabels?: boolean
  onKeyClick?: (note: string) => void
  className?: string
}

const WHITE = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
// Positie (in witte-toets-eenheden) van de zwarte toetsen binnen een octaaf.
const BLACK: { pc: string; pos: number }[] = [
  { pc: 'C#', pos: 1 },
  { pc: 'D#', pos: 2 },
  { pc: 'F#', pos: 4 },
  { pc: 'G#', pos: 5 },
  { pc: 'A#', pos: 6 },
]

/** Pianoklavier dat akkoord-/toonladdernoten kan oplichten en afspelen. */
export function PianoKeyboard({
  highlight = [],
  root,
  octaves = 1,
  startOctave = 4,
  showLabels = true,
  onKeyClick,
  className,
}: PianoKeyboardProps) {
  const highlightSet = useMemo(() => new Set(highlight.map((n) => Note.pitchClass(n))), [highlight])
  const rootPc = root ? Note.pitchClass(root) : undefined
  const whiteCount = WHITE.length * octaves
  const whiteWidthPct = 100 / whiteCount

  const enharmonic = (pc: string) => Note.enharmonic(pc) || pc

  const isHi = (pc: string) =>
    highlightSet.has(pc) || highlightSet.has(enharmonic(pc))
  const isRoot = (pc: string) => rootPc === pc || enharmonic(pc) === rootPc

  return (
    <div
      className={cn('relative w-full select-none', className)}
      style={{ aspectRatio: `${whiteCount * 0.62} / 1` }}
    >
      {/* Witte toetsen */}
      <div className="flex h-full w-full">
        {Array.from({ length: octaves }, (_, o) =>
          WHITE.map((pc) => {
            const oct = startOctave + o
            const note = `${pc}${oct}`
            const hi = isHi(pc)
            const r = isRoot(pc)
            return (
              <button
                key={note}
                type="button"
                onClick={() => onKeyClick?.(note)}
                disabled={!onKeyClick}
                aria-label={`${pc}${oct}`}
                className={cn(
                  'relative flex h-full flex-1 items-end justify-center rounded-b-md border border-zinc-300 pb-2 text-[10px] font-semibold transition-colors dark:border-zinc-600',
                  r
                    ? 'bg-amber text-amber-foreground'
                    : hi
                      ? 'bg-primary/80 text-primary-foreground'
                      : 'bg-white text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-200 dark:text-zinc-600 dark:hover:bg-zinc-300',
                  onKeyClick && 'cursor-pointer',
                )}
              >
                {showLabels && (hi || r) ? pc : ''}
              </button>
            )
          }),
        )}
      </div>

      {/* Zwarte toetsen */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: octaves }, (_, o) =>
          BLACK.map(({ pc, pos }) => {
            const oct = startOctave + o
            const note = `${pc}${oct}`
            const hi = isHi(pc)
            const r = isRoot(pc)
            const left = (o * WHITE.length + pos) * whiteWidthPct
            return (
              <button
                key={note}
                type="button"
                onClick={() => onKeyClick?.(note)}
                disabled={!onKeyClick}
                aria-label={`${pc}${oct}`}
                className={cn(
                  'pointer-events-auto absolute top-0 z-10 h-[62%] -translate-x-1/2 rounded-b-md border border-zinc-700 text-[8px] font-semibold transition-colors',
                  r
                    ? 'bg-amber text-amber-foreground'
                    : hi
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700',
                  onKeyClick && 'cursor-pointer',
                )}
                style={{ left: `${left}%`, width: `${whiteWidthPct * 0.62}%` }}
              >
                <span className="flex h-full items-end justify-center pb-1">
                  {showLabels && (hi || r) ? pc : ''}
                </span>
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}
