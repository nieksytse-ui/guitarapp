import { useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Guitar,
  Pause,
  Play,
  Plus,
  RotateCcw,
} from 'lucide-react'
import type { Difficulty, StrumCell, StrummingPattern, TimeSignature } from '@/lib/types'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StrumArrow } from '@/components/strumming/StrumArrow'
import { PatternPreview } from '@/components/strumming/PatternPreview'
import { useStrummingPlayer } from '@/hooks/useStrummingPlayer'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useAward } from '@/hooks/useAward'
import { XP_REWARDS } from '@/lib/xp'
import { clamp, cn } from '@/lib/utils'
import {
  STRUMMING_PATTERNS,
  beatIndices,
  cellsPerBar,
  countLabels,
  emptyPattern,
} from '@/data/strummingPatterns'
import { CHORD_BY_ID } from '@/data/chords'

const CHORD_OPTIONS = ['none', 'G', 'C', 'D', 'A', 'E', 'Em', 'Am', 'Dm']
const NEXT_CELL: Record<StrumCell, StrumCell> = { '-': 'D', D: 'U', U: 'X', X: '-' }
const MIN_BPM = 40
const MAX_BPM = 240

type DifficultyFilter = 'all' | Difficulty

const DIFFICULTY_FILTERS: { value: DifficultyFilter; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'gemiddeld', label: 'Gemiddeld' },
  { value: 'gevorderd', label: 'Gevorderd' },
]

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  gemiddeld: 'Gemiddeld',
  gevorderd: 'Gevorderd',
}

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  beginner: 'bg-emerald-500',
  gemiddeld: 'bg-amber-500',
  gevorderd: 'bg-rose-500',
}

export default function StrummingPage() {
  const accent = useSettingsStore((s) => s.metronomeAccent)
  const award = useAward()

  const [patternId, setPatternId] = useState<string>('pop-old-faithful')
  const [bpm, setBpm] = useState(90)
  const [metronome, setMetronome] = useState(true)
  const [chordId, setChordId] = useState('G')

  // Filter voor de patroonbibliotheek.
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')

  // Eigen patroon
  const [customTs, setCustomTs] = useState<TimeSignature>('4/4')
  const [customCells, setCustomCells] = useState<StrumCell[]>(() => emptyPattern('4/4'))

  const isCustom = patternId === 'custom'

  const pattern: StrummingPattern = useMemo(() => {
    if (isCustom) {
      return {
        id: 'custom',
        name: 'Eigen patroon',
        timeSignature: customTs,
        cells: customCells,
        accents: [0],
      }
    }
    return STRUMMING_PATTERNS.find((p) => p.id === patternId) ?? STRUMMING_PATTERNS[0]
  }, [isCustom, patternId, customTs, customCells])

  const chordNotes = chordId !== 'none' ? CHORD_BY_ID.get(chordId)?.notes : undefined

  // XP: elke 4 voltooide maten levert een "ronde" op.
  const barCounter = useRef(0)
  const handleBarComplete = () => {
    barCounter.current += 1
    if (barCounter.current % 4 === 0) {
      void award({
        type: 'strumming',
        title: `Strumming: ${pattern.name}`,
        xp: XP_REWARDS.strummingRound,
        durationSec: Math.round((4 * cellsPerBar(pattern.timeSignature) * 30) / bpm),
        meta: { pattern: pattern.id, bpm },
      })
    }
  }

  const { isPlaying, currentStep, toggle, stop } = useStrummingPlayer({
    pattern,
    bpm,
    chordNotes,
    metronome,
    accent,
    onBarComplete: handleBarComplete,
  })

  const counts = countLabels(pattern.timeSignature)
  const beats = beatIndices(pattern.timeSignature)

  const setBpmSafe = (v: number) => setBpm(clamp(Math.round(v), MIN_BPM, MAX_BPM))

  const selectPattern = (id: string) => {
    stop()
    setPatternId(id)
  }

  const filteredPatterns = useMemo(
    () =>
      difficulty === 'all'
        ? STRUMMING_PATTERNS
        : STRUMMING_PATTERNS.filter((p) => p.difficulty === difficulty),
    [difficulty],
  )

  // Door de (gefilterde) lijst heen "klikken" met vorige/volgende.
  const stepPattern = (dir: -1 | 1) => {
    const list = filteredPatterns.length > 0 ? filteredPatterns : STRUMMING_PATTERNS
    const idx = list.findIndex((p) => p.id === patternId)
    const base = idx === -1 ? (dir === 1 ? -1 : 0) : idx
    const next = (base + dir + list.length) % list.length
    selectPattern(list[next].id)
  }

  const changeCustomTs = (ts: TimeSignature) => {
    stop()
    setCustomTs(ts)
    setCustomCells(emptyPattern(ts))
  }

  const cycleCell = (index: number) => {
    setCustomCells((cells) => {
      const next = [...cells]
      next[index] = NEXT_CELL[next[index]]
      return next
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strumming-trainer"
        description="Train ritmes met meelopende pijlen en een metronoom. Kies een patroon of maak je eigen."
        icon={<Guitar className="h-5 w-5" />}
      />

      {/* Speelvlak */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!isCustom && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => stepPattern(-1)}
                    aria-label="Vorig patroon"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => stepPattern(1)}
                    aria-label="Volgend patroon"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Badge variant="secondary">{pattern.timeSignature}</Badge>
              <span className="font-semibold">{pattern.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {!isCustom && pattern.difficulty && (
                <Badge variant="muted" className="gap-1.5">
                  <span className={cn('h-2 w-2 rounded-full', DIFFICULTY_DOT[pattern.difficulty])} />
                  {DIFFICULTY_LABELS[pattern.difficulty]}
                </Badge>
              )}
              <Badge variant="muted">{bpm} BPM</Badge>
            </div>
          </div>

          {/* Pijlenrij met playhead */}
          <div className="flex flex-wrap items-end justify-center gap-2 rounded-xl bg-muted/40 p-4 sm:gap-3">
            {pattern.cells.map((cell, i) => (
              <StrumArrow
                key={i}
                cell={cell}
                count={counts[i] ?? ''}
                isBeat={beats.includes(i)}
                active={currentStep === i}
                onClick={isCustom ? () => cycleCell(i) : undefined}
              />
            ))}
          </div>

          {pattern.description && !isCustom && (
            <p className="mt-3 text-center text-sm text-muted-foreground">{pattern.description}</p>
          )}
          {isCustom && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground">
              <Plus className="h-3.5 w-3.5" /> Tik op de vakjes om te wisselen: rust → ↓ → ↑ → X.
            </p>
          )}

          {/* Transport */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button size="lg" onClick={toggle} className="min-w-36">
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5" /> Stop
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" /> Speel
                </>
              )}
            </Button>
            {isCustom && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  stop()
                  setCustomCells(emptyPattern(customTs))
                }}
                aria-label="Wis eigen patroon"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patroonbibliotheek */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Patronen</CardTitle>
          <span className="text-xs text-muted-foreground">
            {filteredPatterns.length} patroon{filteredPatterns.length === 1 ? '' : 'en'}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter op niveau */}
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

          {/* Raster met patronen */}
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPatterns.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPattern(p.id)}
                className={cn(
                  'flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors',
                  patternId === p.id
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                    : 'border-border hover:bg-accent',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold leading-tight">{p.name}</span>
                  <Badge variant="secondary" className="shrink-0">
                    {p.timeSignature}
                  </Badge>
                </div>
                <PatternPreview cells={p.cells} />
                {p.difficulty && (
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <span className={cn('h-2 w-2 rounded-full', DIFFICULTY_DOT[p.difficulty])} />
                    {DIFFICULTY_LABELS[p.difficulty]}
                  </span>
                )}
              </button>
            ))}

            {/* Eigen patroon */}
            <button
              onClick={() => selectPattern('custom')}
              className={cn(
                'flex min-h-[96px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-3 text-sm font-semibold transition-colors',
                isCustom
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                  : 'border-border text-muted-foreground hover:bg-accent',
              )}
            >
              <Plus className="h-5 w-5" /> Eigen patroon
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Instellingen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instellingen</CardTitle>
        </CardHeader>
        <CardContent className="grid items-start gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* BPM */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Tempo</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={MIN_BPM}
                  max={MAX_BPM}
                  value={bpm}
                  onChange={(e) => setBpmSafe(Number(e.target.value))}
                  className="h-8 w-20 text-center"
                />
                <span className="text-sm text-muted-foreground">BPM</span>
              </div>
            </div>
            <Slider
              value={[bpm]}
              min={MIN_BPM}
              max={MAX_BPM}
              step={1}
              onValueChange={([v]) => setBpmSafe(v)}
            />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>langzaam</span>
              <span>snel</span>
            </div>
          </div>

          {/* Akkoord */}
          <div>
            <Label>Meespelen met akkoord</Label>
            <Select value={chordId} onValueChange={setChordId}>
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHORD_OPTIONS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id === 'none' ? 'Geen (alleen ritme)' : id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metronoom */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Metronoom</Label>
              <p className="text-xs text-muted-foreground">Klik op de hoofdtellen</p>
            </div>
            <Switch checked={metronome} onCheckedChange={setMetronome} />
          </div>

          {/* Maatsoort (alleen eigen patroon) */}
          {isCustom && (
            <div>
              <Label>Maatsoort</Label>
              <Select value={customTs} onValueChange={(v) => changeCustomTs(v as TimeSignature)}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4/4">4/4</SelectItem>
                  <SelectItem value="3/4">3/4</SelectItem>
                  <SelectItem value="6/8">6/8</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
