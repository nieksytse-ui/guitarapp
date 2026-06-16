import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  Ear,
  Eraser,
  Eye,
  EyeOff,
  Flame,
  Hand,
  RotateCcw,
  Target,
} from 'lucide-react'
import type { ChordShape, Difficulty } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChordDiagram } from '@/components/ChordDiagram'
import { ChordInputFretboard } from '@/components/chords/ChordInputFretboard'
import {
  FINGER_COLORS,
  FINGER_LABELS,
  STRINGS,
  buildExpected,
  isStringCorrect,
  maxFretOf,
  type InputMap,
  type Tool,
} from '@/components/chords/chordTrainerCore'
import { useAudio } from '@/hooks/useAudio'
import { strumChord } from '@/lib/audio/engine'
import { useAward } from '@/hooks/useAward'
import { CHORDS, CHORD_TYPE_LABELS, DIFFICULTY_LABELS } from '@/data/chords'
import { cn } from '@/lib/utils'

type DifficultyFilter = 'all' | Difficulty

const DIFFICULTY_FILTERS: { value: DifficultyFilter; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'gemiddeld', label: 'Gemiddeld' },
  { value: 'gevorderd', label: 'Gevorderd' },
]

// Geschikt voor de hals-trainer: open posities (geen barré), alle 6 snaren
// beschreven en frets binnen bereik. Dit dekt alle open akkoorden + powerchords.
const TRAINER_CHORDS = CHORDS.filter(
  (c) =>
    !c.barres?.length &&
    c.position === 1 &&
    c.fingers.length === 6 &&
    c.fingers.every(([, fret]) => fret === 'x' || (typeof fret === 'number' && fret <= 4)),
)

const FINGER_TOOLS: { tool: Tool; finger: number }[] = [
  { tool: 'f1', finger: 1 },
  { tool: 'f2', finger: 2 },
  { tool: 'f3', finger: 3 },
  { tool: 'f4', finger: 4 },
]

function randomFrom(list: ChordShape[], exceptId?: string): ChordShape {
  const pool = exceptId && list.length > 1 ? list.filter((c) => c.id !== exceptId) : list
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Hals-trainer: je krijgt een willekeurig akkoord en moet zelf de juiste
 * vingerposities (en open/gedempte snaren) op de hals aangeven. Na "Controleer"
 * zie je per snaar of het klopt en wat het juiste antwoord was.
 */
export function ChordTrainer() {
  const { ready } = useAudio()
  const award = useAward()

  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const pool = useMemo(
    () =>
      difficulty === 'all'
        ? TRAINER_CHORDS
        : TRAINER_CHORDS.filter((c) => c.difficulty === difficulty),
    [difficulty],
  )

  const [current, setCurrent] = useState<ChordShape>(() => randomFrom(TRAINER_CHORDS))
  const [value, setValue] = useState<InputMap>(() => new Map())
  const [tool, setTool] = useState<Tool>('f1')
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [lastResult, setLastResult] = useState<{ correct: number; total: number } | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [perfects, setPerfects] = useState(0)
  const [streak, setStreak] = useState(0)

  const expected = useMemo(() => buildExpected(current), [current])
  const fretCount = Math.max(4, maxFretOf(expected))

  const playCurrent = useCallback(async () => {
    await ready()
    strumChord(current.notes, { duration: '2n' })
  }, [ready, current])

  const nextChord = useCallback(() => {
    setCurrent((cur) => randomFrom(pool, cur.id))
    setValue(new Map())
    setRevealed(false)
    setShowHint(false)
    setLastResult(null)
  }, [pool])

  // Als het niveaufilter wijzigt en het huidige akkoord valt erbuiten: nieuw akkoord.
  useEffect(() => {
    if (!pool.some((c) => c.id === current.id)) {
      setCurrent(randomFrom(pool))
      setValue(new Map())
      setRevealed(false)
      setShowHint(false)
      setLastResult(null)
    }
  }, [pool, current.id])

  const check = useCallback(() => {
    if (revealed) return
    let correct = 0
    for (const s of STRINGS) {
      if (isStringCorrect(expected.get(s), value.get(s))) correct++
    }
    const perfect = correct === STRINGS.length
    setRevealed(true)
    setLastResult({ correct, total: STRINGS.length })
    setAttempts((a) => a + 1)
    setPerfects((p) => p + (perfect ? 1 : 0))
    setStreak((s) => (perfect ? s + 1 : 0))
    void playCurrent()

    const xp = correct === 0 ? 0 : perfect ? 14 : Math.max(2, correct * 2)
    if (xp > 0) {
      void award({
        type: 'chord-practice',
        title: `Hals-trainer: ${current.name}`,
        xp,
        durationSec: 25,
        meta: { chord: current.id, correct, perfect },
      })
    }
  }, [revealed, expected, value, playCurrent, award, current])

  const clearBoard = () => {
    if (!revealed) setValue(new Map())
  }

  // Sneltoetsen: 1-4 vingers, O open, X demp, E gum, Enter controleer/volgende.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const k = e.key.toLowerCase()
      if (revealed) {
        if (e.key === 'Enter') nextChord()
        return
      }
      if (k >= '1' && k <= '4') setTool(`f${k}` as Tool)
      else if (k === 'o') setTool('open')
      else if (k === 'x') setTool('mute')
      else if (k === 'e') setTool('erase')
      else if (e.key === 'Enter') check()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealed, check, nextChord])

  const filledCount = value.size

  return (
    <div className="space-y-5">
      {/* Niveaufilter + score */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setDifficulty(f.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                difficulty === f.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-accent',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Target className="h-4 w-4" /> {perfects}/{attempts}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-amber">
            <Flame className="h-4 w-4" /> {streak}
          </span>
        </div>
      </div>

      {/* Opdracht */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Plaats dit akkoord op de hals
              </p>
              <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight">
                {current.name}{' '}
                <span className="text-base font-normal text-muted-foreground">
                  {current.display}
                </span>
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary">{CHORD_TYPE_LABELS[current.type]}</Badge>
                <Badge variant="muted">{DIFFICULTY_LABELS[current.difficulty]}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => void playCurrent()}>
                <Ear className="h-4 w-4" /> Beluister
              </Button>
              <Button
                variant={showHint ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowHint((h) => !h)}
              >
                {showHint ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} Hint
              </Button>
            </div>
          </div>

          {showHint && !revealed && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-border p-3">
              <div className="h-28 w-24 shrink-0">
                <ChordDiagram chord={current} showTuning={false} />
              </div>
              <p className="text-sm text-muted-foreground">
                Spiek even bij het diagram en plaats daarna de vingers zelf op de hals.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gereedschap */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Hand className="h-4 w-4" /> Kies:
            </span>
            {FINGER_TOOLS.map(({ tool: t, finger }) => (
              <button
                key={t}
                onClick={() => setTool(t)}
                disabled={revealed}
                title={FINGER_LABELS[finger]}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all disabled:opacity-50',
                  tool === t ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:bg-accent',
                )}
              >
                <span
                  className={cn(
                    'grid h-6 w-6 place-items-center rounded-full text-xs font-bold text-white',
                    FINGER_COLORS[finger],
                  )}
                >
                  {finger}
                </span>
                <span className="hidden sm:inline">{FINGER_LABELS[finger]}</span>
              </button>
            ))}

            <span className="mx-1 h-6 w-px bg-border" />

            <ToolButton active={tool === 'open'} disabled={revealed} onClick={() => setTool('open')}>
              <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-current text-xs font-bold">
                O
              </span>
              <span className="hidden sm:inline">Open</span>
            </ToolButton>
            <ToolButton active={tool === 'mute'} disabled={revealed} onClick={() => setTool('mute')}>
              <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-current text-xs font-bold">
                ×
              </span>
              <span className="hidden sm:inline">Dempen</span>
            </ToolButton>
            <ToolButton active={tool === 'erase'} disabled={revealed} onClick={() => setTool('erase')}>
              <Eraser className="h-4 w-4" />
              <span className="hidden sm:inline">Gum</span>
            </ToolButton>
          </div>

          {/* Hals */}
          <ChordInputFretboard
            value={value}
            onChange={setValue}
            tool={tool}
            fretCount={fretCount}
            expected={expected}
            revealed={revealed}
          />

          <p className="text-xs text-muted-foreground">
            Tip: kies een vinger en tik op de fret. Voor open/gedempte snaren kies je{' '}
            <strong>Open</strong> of <strong>Dempen</strong> en tik je in de <strong>o/×</strong>
            -kolom vóór de nut. Sneltoetsen: 1–4, O, X, E, Enter.
          </p>
        </CardContent>
      </Card>

      {/* Resultaat + acties */}
      {revealed && lastResult && (
        <Card
          className={cn(
            'border-2',
            lastResult.correct === lastResult.total
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-amber-500/40 bg-amber-500/5',
          )}
        >
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="text-lg font-bold">
                {lastResult.correct === lastResult.total
                  ? '🎉 Perfect! Alle 6 snaren goed.'
                  : `${lastResult.correct} van ${lastResult.total} snaren goed.`}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full ring-2 ring-emerald-500" /> goed
                </span>
                {' · '}
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full ring-2 ring-amber-500" /> juiste
                  antwoord
                </span>
                {' · '}
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-rose-500" /> fout
                  geplaatst
                </span>
              </p>
            </div>
            <Button size="lg" onClick={nextChord}>
              Volgende <ArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {!revealed && (
        <div className="flex items-center justify-center gap-3">
          <Button size="lg" onClick={check} className="min-w-40">
            <Check className="h-5 w-5" /> Controleer
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={clearBoard}
            disabled={filledCount === 0}
            aria-label="Wis invoer"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

function ToolButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all disabled:opacity-50',
        active ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:bg-accent',
      )}
    >
      {children}
    </button>
  )
}
