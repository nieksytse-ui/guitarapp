import { cn } from '@/lib/utils'
import {
  FINGER_COLORS,
  STRINGS,
  STRING_LABELS,
  isStringCorrect,
  type ExpectedString,
  type InputMap,
  type InputString,
  type Tool,
} from '@/components/chords/chordTrainerCore'

const FRET_MARKERS = [3, 5, 7, 9]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ChordInputFretboardProps {
  value: InputMap
  onChange: (next: InputMap) => void
  tool: Tool
  fretCount?: number
  /** Het juiste antwoord — alleen gebruikt wanneer `revealed` true is. */
  expected?: Map<number, ExpectedString> | null
  /** Toon de correctheid en het juiste antwoord (na "Controleer"). */
  revealed?: boolean
  className?: string
}

/**
 * Interactieve gitaarhals waarop je een akkoord "indrukt": kies een vinger (of
 * open/demp) en tik op de juiste snaar/fret. Na controle kleuren de posities
 * groen (goed), amber (zo hoort het) of rood (fout geplaatst).
 */
export function ChordInputFretboard({
  value,
  onChange,
  tool,
  fretCount = 4,
  expected,
  revealed = false,
  className,
}: ChordInputFretboardProps) {
  const setString = (s: number, st: InputString | null) => {
    const next = new Map(value)
    if (st) next.set(s, st)
    else next.delete(s)
    onChange(next)
  }

  const handleNut = (s: number) => {
    if (revealed) return
    if (tool === 'open') setString(s, { kind: 'open' })
    else if (tool === 'mute') setString(s, { kind: 'mute' })
    else if (tool === 'erase') setString(s, null)
  }

  const handleFret = (s: number, fret: number) => {
    if (revealed) return
    if (tool.startsWith('f')) {
      const finger = Number(tool.slice(1))
      const current = value.get(s)
      // Tik op dezelfde positie met dezelfde vinger = weghalen.
      if (current?.kind === 'finger' && current.fret === fret && current.finger === finger) {
        setString(s, null)
        return
      }
      // Een vinger kan maar op één plek liggen: haal 'm eerst overal anders weg.
      const next = new Map(value)
      for (const [str, st] of next) {
        if (st.kind === 'finger' && st.finger === finger) next.delete(str)
      }
      next.set(s, { kind: 'finger', fret, finger })
      onChange(next)
    } else if (tool === 'erase') {
      const current = value.get(s)
      if (current?.kind === 'finger' && current.fret === fret) setString(s, null)
    }
  }

  const frets = Array.from({ length: fretCount }, (_, i) => i + 1)

  return (
    <div className={cn('overflow-x-auto no-scrollbar', className)}>
      <div className="inline-block min-w-full select-none">
        {/* Kopregel: open/demp-zone + fretnummers */}
        <div className="flex pl-6">
          <div className="w-10 shrink-0 text-center text-[11px] font-medium text-muted-foreground">
            o/×
          </div>
          {frets.map((f) => (
            <div
              key={f}
              className="w-12 shrink-0 text-center text-[11px] font-medium text-muted-foreground"
            >
              {f}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-gradient-to-b from-amber-50/40 to-amber-100/20 p-1 dark:from-zinc-800/40 dark:to-zinc-900/30">
          {STRINGS.map((s) => {
            const u = value.get(s)
            const e = expected?.get(s)
            const correct = revealed ? isStringCorrect(e, u) : undefined
            return (
              <div key={s} className="flex items-center">
                {/* Snaarlabel */}
                <div
                  className={cn(
                    'w-6 shrink-0 text-center text-xs font-bold',
                    correct === true && 'text-emerald-600 dark:text-emerald-400',
                    correct === false && 'text-rose-600 dark:text-rose-400',
                    correct === undefined && 'text-muted-foreground',
                  )}
                >
                  {STRING_LABELS[s]}
                </div>

                {/* Open/demp-zone (vóór de nut) */}
                <NutCell
                  string={s}
                  user={u}
                  expected={e}
                  revealed={revealed}
                  onClick={() => handleNut(s)}
                />

                {/* Frets */}
                {frets.map((f) => (
                  <FretCell
                    key={f}
                    string={s}
                    fret={f}
                    user={u}
                    expected={e}
                    revealed={revealed}
                    onClick={() => handleFret(s, f)}
                  />
                ))}
              </div>
            )
          })}

          {/* Fret-markers */}
          <div className="flex pl-6">
            <div className="w-10 shrink-0" />
            {frets.map((f) => (
              <div key={f} className="flex w-12 shrink-0 justify-center">
                {FRET_MARKERS.includes(f) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cellen
// ---------------------------------------------------------------------------

function NutCell({
  string,
  user,
  expected,
  revealed,
  onClick,
}: {
  string: number
  user?: InputString
  expected?: ExpectedString
  revealed: boolean
  onClick: () => void
}) {
  const userOpen = user?.kind === 'open'
  const userMute = user?.kind === 'mute'

  let symbol: 'O' | 'X' | '' = userOpen ? 'O' : userMute ? 'X' : ''
  let tone = 'border-border text-muted-foreground'

  if (revealed) {
    const expOpen = expected?.kind === 'open'
    const expMute = expected?.kind === 'mute'
    if (expOpen || expMute) {
      symbol = expOpen ? 'O' : 'X'
      const matched = (expOpen && userOpen) || (expMute && userMute)
      tone = matched
        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/40'
        : 'border-amber-500 border-dashed text-amber-600 dark:text-amber-400'
    } else if (userOpen || userMute) {
      // Hier hoorde niets te staan.
      tone = 'border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/40'
    } else {
      symbol = ''
      tone = 'border-transparent'
    }
  } else if (userOpen || userMute) {
    tone = 'border-foreground/40 text-foreground'
  }

  return (
    <div className="flex w-10 shrink-0 justify-center border-r-2 border-r-zinc-400 pr-1 dark:border-r-zinc-500">
      <button
        type="button"
        onClick={onClick}
        disabled={revealed}
        aria-label={`Snaar ${string} open of dempen`}
        className={cn(
          'grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold transition-all',
          !revealed && 'hover:border-primary/60',
          symbol ? tone : cn(tone, 'border-dashed'),
        )}
      >
        {symbol}
      </button>
    </div>
  )
}

function FretCell({
  string,
  fret,
  user,
  expected,
  revealed,
  onClick,
}: {
  string: number
  fret: number
  user?: InputString
  expected?: ExpectedString
  revealed: boolean
  onClick: () => void
}) {
  const userFinger = user?.kind === 'finger' && user.fret === fret ? user.finger : null
  const expFinger =
    revealed && expected?.kind === 'finger' && expected.fret === fret
      ? (expected.finger ?? 0)
      : null

  let content: React.ReactNode = null

  if (revealed) {
    if (expFinger !== null) {
      const matched = userFinger !== null && userFinger === expFinger
      content = (
        <span
          className={cn(
            'grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-white shadow-sm',
            expFinger ? FINGER_COLORS[expFinger] : 'bg-zinc-500',
            matched
              ? 'ring-2 ring-emerald-500'
              : 'opacity-90 ring-2 ring-amber-500 ring-offset-1 ring-offset-background',
          )}
        >
          {expFinger || '•'}
        </span>
      )
    } else if (userFinger !== null) {
      // Vinger geplaatst waar niets hoort.
      content = (
        <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-rose-500 text-[11px] font-bold text-rose-600 dark:text-rose-400">
          {userFinger}
        </span>
      )
    }
  } else if (userFinger !== null) {
    content = (
      <span
        className={cn(
          'grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-white shadow-sm',
          FINGER_COLORS[userFinger],
        )}
      >
        {userFinger}
      </span>
    )
  }

  return (
    <div className="relative flex h-10 w-12 shrink-0 items-center justify-center border-l border-zinc-300/60 dark:border-zinc-600/50">
      {/* Snaarlijn */}
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-zinc-400/50 dark:bg-zinc-500/40" />
      <button
        type="button"
        onClick={onClick}
        disabled={revealed}
        aria-label={`Snaar ${string}, fret ${fret}`}
        className={cn(
          'relative z-10 grid h-8 w-8 place-items-center rounded-full transition-all',
          !revealed && 'hover:bg-primary/10',
        )}
      >
        {content}
      </button>
    </div>
  )
}
