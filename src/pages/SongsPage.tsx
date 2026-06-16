import { useCallback, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Music2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Volume2,
  Wand2,
} from 'lucide-react'
import type { Song, SongMeasure, TimeSignature } from '@/lib/types'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChordDiagram } from '@/components/ChordDiagram'
import { useSongPlayer, type FlatMeasure } from '@/hooks/useSongPlayer'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useAward } from '@/hooks/useAward'
import { XP_REWARDS } from '@/lib/xp'
import { clamp, cn } from '@/lib/utils'
import { SONGS } from '@/data/songs'
import { CHORD_BY_ID } from '@/data/chords'

const MIN_BPM = 40
const MAX_BPM = 240

const BEATS_PER_BAR: Record<TimeSignature, number> = { '4/4': 4, '3/4': 3, '6/8': 6 }

const SOURCE_LABELS: Record<Song['source'], string> = {
  'public-domain': 'Publiek domein',
  traditioneel: 'Traditioneel',
  eigen: 'Eigen liedje',
}

export default function SongsPage() {
  const [activeSong, setActiveSong] = useState<Song | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meespelen met liedjes"
        description="Speel mee met akkoordschema's en een backing-beat. Kies een liedje of voer je eigen schema in."
        icon={<Music2 className="h-5 w-5" />}
      />

      {activeSong ? (
        <SongPlayer song={activeSong} onExit={() => setActiveSong(null)} />
      ) : (
        <Tabs defaultValue="library">
          <TabsList>
            <TabsTrigger value="library">Bibliotheek</TabsTrigger>
            <TabsTrigger value="custom">Eigen liedje</TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <SongLibrary onSelect={setActiveSong} />
          </TabsContent>

          <TabsContent value="custom">
            <CustomSongForm onSelect={setActiveSong} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Bibliotheek
// ---------------------------------------------------------------------------

function SongLibrary({ onSelect }: { onSelect: (song: Song) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SONGS.map((song) => {
        const measureCount = song.sections.reduce((n, s) => n + s.measures.length, 0)
        const chords = Array.from(
          new Set(song.sections.flatMap((s) => s.measures.map((m) => m.chord))),
        )
        return (
          <button
            key={song.id}
            onClick={() => onSelect(song)}
            className="group flex flex-col rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold leading-tight">{song.title}</h3>
                <p className="text-sm text-muted-foreground">{song.artist}</p>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-lime-500 to-green-600 text-white transition-transform group-hover:scale-110">
                <Play className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {song.songKey && <Badge variant="secondary">Toon: {song.songKey}</Badge>}
              <Badge variant="muted">{song.tempo} BPM</Badge>
              <Badge variant="muted">{song.timeSignature}</Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {chords.map((c) => (
                <span
                  key={c}
                  className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {c}
                </span>
              ))}
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {SOURCE_LABELS[song.source]} · {measureCount} maten
            </p>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Eigen liedje invoeren
// ---------------------------------------------------------------------------

function parseSchema(text: string, ts: TimeSignature): SongMeasure[] {
  const per = BEATS_PER_BAR[ts]
  return text
    .split(/[\s|]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((token) => {
      const [chord, beatsStr] = token.split(':')
      const beats = beatsStr ? clamp(parseInt(beatsStr, 10) || per, 1, 16) : per
      return { chord, beats }
    })
}

function CustomSongForm({ onSelect }: { onSelect: (song: Song) => void }) {
  const [title, setTitle] = useState('')
  const [songKey, setSongKey] = useState('')
  const [tempo, setTempo] = useState(90)
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4')
  const [schema, setSchema] = useState('G | Em | C | D')

  const measures = useMemo(() => parseSchema(schema, timeSignature), [schema, timeSignature])
  const unknown = useMemo(
    () => Array.from(new Set(measures.map((m) => m.chord).filter((c) => !CHORD_BY_ID.has(c)))),
    [measures],
  )

  const canPlay = measures.length > 0

  const play = () => {
    if (!canPlay) return
    const song: Song = {
      id: `eigen-${Date.now()}`,
      title: title.trim() || 'Mijn liedje',
      artist: 'Eigen schema',
      songKey: songKey.trim() || undefined,
      tempo: clamp(Math.round(tempo), MIN_BPM, MAX_BPM),
      timeSignature,
      source: 'eigen',
      sections: [{ name: 'Schema', measures }],
    }
    onSelect(song)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wand2 className="h-4 w-4 text-primary" /> Voer je eigen liedje in
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="song-title">Titel</Label>
            <Input
              id="song-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bijv. Mijn oefenliedje"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="song-key">Toonsoort (optioneel)</Label>
            <Input
              id="song-key"
              value={songKey}
              onChange={(e) => setSongKey(e.target.value)}
              placeholder="Bijv. G"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="song-tempo">Tempo (BPM)</Label>
            <Input
              id="song-tempo"
              type="number"
              min={MIN_BPM}
              max={MAX_BPM}
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Maatsoort</Label>
            <Select value={timeSignature} onValueChange={(v) => setTimeSignature(v as TimeSignature)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4/4">4/4</SelectItem>
                <SelectItem value="3/4">3/4</SelectItem>
                <SelectItem value="6/8">6/8</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="song-schema">Akkoordschema</Label>
          <textarea
            id="song-schema"
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            rows={3}
            spellCheck={false}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="G | Em | C | D"
          />
          <p className="text-xs text-muted-foreground">
            Eén akkoord per maat, gescheiden door spaties of <code>|</code>. Eigen aantal tellen?
            Schrijf <code>G:2</code> voor 2 tellen.
          </p>
        </div>

        {/* Voorbeeldweergave */}
        <div className="flex flex-wrap gap-1.5">
          {measures.map((m, i) => (
            <span
              key={i}
              className={cn(
                'rounded-md border px-2 py-1 text-sm font-medium',
                CHORD_BY_ID.has(m.chord)
                  ? 'border-border bg-muted'
                  : 'border-dashed border-amber-500/60 text-amber-600 dark:text-amber-400',
              )}
            >
              {m.chord}
              {m.beats !== BEATS_PER_BAR[timeSignature] && (
                <span className="ml-1 text-xs text-muted-foreground">×{m.beats}</span>
              )}
            </span>
          ))}
        </div>

        {unknown.length > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Geen diagram/geluid voor: {unknown.join(', ')} — je kunt nog steeds meespelen op de
            metronoom.
          </p>
        )}

        <Button onClick={play} disabled={!canPlay} size="lg">
          <Play className="h-5 w-5" /> Speel mijn liedje
        </Button>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Speler
// ---------------------------------------------------------------------------

function SongPlayer({ song, onExit }: { song: Song; onExit: () => void }) {
  const accent = useSettingsStore((s) => s.metronomeAccent)
  const useCountIn = useSettingsStore((s) => s.countIn)
  const award = useAward()

  const [bpm, setBpm] = useState(song.tempo)
  const [metronome, setMetronome] = useState(true)
  const [withChords, setWithChords] = useState(true)
  const [loop, setLoop] = useState(true)

  const beatsPerBar = BEATS_PER_BAR[song.timeSignature]

  const onSongComplete = useCallback(() => {
    void award({
      type: 'song',
      title: `Meegespeeld: ${song.title}`,
      xp: XP_REWARDS.songPlayed,
      durationSec: Math.round(
        song.sections.reduce((n, s) => n + s.measures.reduce((b, m) => b + m.beats, 0), 0) *
          (60 / bpm),
      ),
      meta: { songId: song.id },
    })
  }, [award, song, bpm])

  const { isPlaying, currentMeasure, currentBeat, countingIn, countInLeft, measures, toggle, stop } =
    useSongPlayer({
      song,
      bpm,
      metronome,
      chords: withChords,
      accent,
      loop,
      countInBeats: useCountIn ? beatsPerBar : 0,
      onSongComplete,
    })

  const setBpmSafe = (v: number) => setBpm(clamp(Math.round(v), MIN_BPM, MAX_BPM))

  const idx = currentMeasure >= 0 ? currentMeasure : 0
  const currentChordName = measures[idx]?.chord ?? ''
  const nextChordName = measures[(idx + 1) % measures.length]?.chord ?? ''
  const currentShape = CHORD_BY_ID.get(currentChordName)
  const nextShape = CHORD_BY_ID.get(nextChordName)
  const activeBeats = measures[idx]?.beats ?? beatsPerBar

  // Maten gegroepeerd per sectie voor de weergave.
  const groups = useMemo(() => groupBySection(measures), [measures])

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onExit} className="-ml-2">
        <ArrowLeft className="h-4 w-4" /> Terug naar bibliotheek
      </Button>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">{song.title}</h2>
              <p className="text-sm text-muted-foreground">{song.artist}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {song.songKey && <Badge variant="secondary">Toon: {song.songKey}</Badge>}
              <Badge variant="muted">{song.timeSignature}</Badge>
              <Badge variant="muted">{bpm} BPM</Badge>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            {/* Huidig + volgend akkoord */}
            <div className="relative grid place-items-center rounded-xl bg-muted/40 p-4">
              {countingIn ? (
                <div className="grid h-full place-items-center py-10">
                  <span className="text-sm font-medium text-muted-foreground">Voortellen…</span>
                  <span className="text-6xl font-extrabold text-primary tabular-nums">
                    {countInLeft}
                  </span>
                </div>
              ) : (
                <div className="flex w-full flex-col items-center">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Nu
                  </span>
                  {currentShape ? (
                    <ChordDiagram chord={currentShape} className="w-40" showTuning={false} />
                  ) : (
                    <div className="grid h-40 w-40 place-items-center">
                      <span className="text-5xl font-extrabold">{currentChordName}</span>
                    </div>
                  )}

                  {/* Beat-stippen */}
                  <div className="mt-2 flex items-center gap-1.5">
                    {Array.from({ length: activeBeats }).map((_, b) => (
                      <span
                        key={b}
                        className={cn(
                          'h-2.5 w-2.5 rounded-full transition-colors',
                          isPlaying && currentBeat === b
                            ? 'bg-primary scale-125'
                            : 'bg-muted-foreground/30',
                        )}
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Straks:</span>
                    <span className="rounded-md bg-card px-2 py-0.5 font-semibold text-foreground">
                      {nextChordName}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Maten-schema */}
            <div className="space-y-4">
              {groups.map((group, gi) => (
                <div key={gi}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((m) => {
                      const isCurrent = m.index === currentMeasure
                      const known = CHORD_BY_ID.has(m.chord)
                      return (
                        <div
                          key={m.index}
                          className={cn(
                            'flex h-12 min-w-[3.5rem] items-center justify-center rounded-lg border px-3 text-base font-bold transition-all',
                            isCurrent
                              ? 'scale-105 border-primary bg-primary text-primary-foreground shadow-md'
                              : 'border-border bg-card',
                            !known && !isCurrent && 'border-dashed text-muted-foreground',
                          )}
                        >
                          {m.chord}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transport */}
          <div className="mt-6 flex items-center justify-center gap-3">
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
            <Button variant="outline" size="icon" onClick={stop} aria-label="Terug naar begin">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instellingen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Volume2 className="h-4 w-4" /> Afspeelopties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
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
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Toggle label="Akkoorden" hint="Aanslag op tel 1" checked={withChords} onChange={setWithChords} />
            <Toggle label="Metronoom" hint="Klik op elke tel" checked={metronome} onChange={setMetronome} />
            <Toggle label="Herhalen" hint="Eindeloos meespelen" checked={loop} onChange={setLoop} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (b: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div>
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function groupBySection(measures: FlatMeasure[]): { name: string; items: FlatMeasure[] }[] {
  const groups: { name: string; items: FlatMeasure[] }[] = []
  measures.forEach((m) => {
    if (m.sectionStart || groups.length === 0) {
      groups.push({ name: m.sectionName, items: [m] })
    } else {
      groups[groups.length - 1].items.push(m)
    }
  })
  return groups
}
