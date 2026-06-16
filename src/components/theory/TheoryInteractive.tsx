import { useMemo, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { Note } from 'tonal'
import type { InteractiveKind } from '@/data/theoryStages'
import { Fretboard } from '@/components/theory/Fretboard'
import { PianoKeyboard } from '@/components/theory/PianoKeyboard'
import { CircleOfFifths } from '@/components/theory/CircleOfFifths'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAudio } from '@/hooks/useAudio'
import { playChord, playNote, playSequence } from '@/lib/audio/engine'
import {
  ascendingOctaves,
  chordInfo,
  chordNotesWithOctave,
  diatonicChords,
  scaleNotes,
  SEMITONE_INTERVAL_NAMES,
} from '@/lib/theory'
import { cn } from '@/lib/utils'

const ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

/** Kleine knoppenrij om een grondtoon te kiezen. */
function RootPicker({
  value,
  onChange,
  options = ROOTS,
}: {
  value: string
  onChange: (v: string) => void
  options?: string[]
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={cn(
            'h-9 w-9 rounded-lg border-2 text-sm font-bold transition-all',
            value === r ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50',
          )}
        >
          {r}
        </button>
      ))}
    </div>
  )
}

export function TheoryInteractive({ kind }: { kind: InteractiveKind }) {
  switch (kind) {
    case 'fretboard-notes':
      return <NotesExplorer />
    case 'intervals':
      return <IntervalExplorer />
    case 'scale':
      return <ScaleExplorer />
    case 'chord-builder':
      return <ChordBuilder />
    case 'circle':
      return <KeyExplorer />
  }
}

// --- Noten op de hals ------------------------------------------------------
function NotesExplorer() {
  const { ready } = useAudio()
  const [note, setNote] = useState('A')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Licht een noot op:</span>
        <RootPicker value={note} onChange={setNote} options={['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']} />
      </div>
      <Fretboard highlight={[note]} root={note} />
      <p className="text-sm text-muted-foreground">
        Zie je hoe dezelfde noot op meerdere plekken voorkomt? Dat zijn dezelfde tonen in verschillende octaven.
      </p>
      <Button
        variant="outline"
        onClick={async () => {
          await ready()
          playNote(`${note}3`, '4n')
        }}
      >
        <Volume2 className="h-4 w-4" /> Beluister {note}
      </Button>
    </div>
  )
}

// --- Intervallen -----------------------------------------------------------
const INTERVAL_CHOICES = [
  { semitones: 3, iv: '3m' },
  { semitones: 4, iv: '3M' },
  { semitones: 5, iv: '4P' },
  { semitones: 7, iv: '5P' },
  { semitones: 12, iv: '8P' },
]

function IntervalExplorer() {
  const { ready } = useAudio()
  const [root, setRoot] = useState('C')
  const [semitones, setSemitones] = useState(7)

  const rootNote = `${root}4`
  const targetNote = useMemo(() => Note.fromMidi((Note.midi(rootNote) ?? 60) + semitones), [rootNote, semitones])
  const targetPc = Note.pitchClass(targetNote)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Grondtoon:</span>
        <RootPicker value={root} onChange={setRoot} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {INTERVAL_CHOICES.map((c) => (
          <button
            key={c.semitones}
            onClick={() => setSemitones(c.semitones)}
            className={cn(
              'rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all',
              semitones === c.semitones
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50',
            )}
          >
            {SEMITONE_INTERVAL_NAMES[c.semitones]}
          </button>
        ))}
      </div>

      <PianoKeyboard highlight={[root, targetPc]} root={root} octaves={1} />

      <div className="flex items-center gap-2">
        <Badge>{root}</Badge>
        <span className="text-muted-foreground">→</span>
        <Badge variant="amber">{targetPc}</Badge>
        <span className="text-sm text-muted-foreground">
          = {SEMITONE_INTERVAL_NAMES[semitones]} ({semitones} halve tonen)
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={async () => {
            await ready()
            playSequence([rootNote, targetNote], { interval: 0.5 })
          }}
        >
          <Volume2 className="h-4 w-4" /> Na elkaar
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await ready()
            playChord([rootNote, targetNote], '2n')
          }}
        >
          <Volume2 className="h-4 w-4" /> Tegelijk
        </Button>
      </div>
    </div>
  )
}

// --- Toonladders -----------------------------------------------------------
function ScaleExplorer() {
  const { ready } = useAudio()
  const [root, setRoot] = useState('C')
  const [type, setType] = useState<'major' | 'minor'>('major')

  const pcs = useMemo(() => scaleNotes(root, type), [root, type])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <RootPicker value={root} onChange={setRoot} />
        <div className="flex overflow-hidden rounded-lg border border-border">
          {(['major', 'minor'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                type === t ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
              )}
            >
              {t === 'major' ? 'majeur' : 'mineur'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {pcs.map((n) => (
          <Badge key={n} variant={n === root ? 'amber' : 'secondary'}>
            {n}
          </Badge>
        ))}
      </div>

      <Fretboard highlight={pcs} root={root} />
      <PianoKeyboard highlight={pcs} root={root} octaves={1} />

      <Button
        variant="outline"
        onClick={async () => {
          await ready()
          const seq = ascendingOctaves([...pcs, root], 3)
          playSequence(seq, { interval: 0.32 })
        }}
      >
        <Volume2 className="h-4 w-4" /> Speel toonladder
      </Button>
    </div>
  )
}

// --- Akkoordopbouw ---------------------------------------------------------
const CHORD_QUALITIES = [
  { suffix: '', label: 'majeur' },
  { suffix: 'm', label: 'mineur' },
  { suffix: '7', label: 'dom7' },
  { suffix: 'maj7', label: 'maj7' },
  { suffix: 'm7', label: 'm7' },
]

function ChordBuilder() {
  const { ready } = useAudio()
  const [root, setRoot] = useState('C')
  const [suffix, setSuffix] = useState('')

  const symbol = `${root}${suffix}`
  const info = useMemo(() => chordInfo(symbol), [symbol])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <RootPicker value={root} onChange={setRoot} />
        <div className="flex flex-wrap gap-1.5">
          {CHORD_QUALITIES.map((q) => (
            <button
              key={q.suffix}
              onClick={() => setSuffix(q.suffix)}
              className={cn(
                'rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all',
                suffix === q.suffix
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50',
              )}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-2xl font-extrabold">{symbol}</span>
        <div className="flex flex-wrap gap-1.5">
          {info.notes.map((n, i) => (
            <Badge key={n} variant={i === 0 ? 'amber' : 'secondary'}>
              {n}
            </Badge>
          ))}
        </div>
      </div>

      <PianoKeyboard highlight={info.notes} root={root} octaves={2} />

      <p className="text-sm text-muted-foreground">
        Intervallen vanaf de grondtoon: {info.intervals.join(' · ')}
      </p>

      <Button
        variant="outline"
        onClick={async () => {
          await ready()
          const notes = chordNotesWithOctave(symbol, 3)
          if (notes.length) playChord(notes, '1n')
        }}
      >
        <Volume2 className="h-4 w-4" /> Beluister akkoord
      </Button>
    </div>
  )
}

// --- Toonsoorten -----------------------------------------------------------
function KeyExplorer() {
  const { ready } = useAudio()
  const [key, setKey] = useState('C')

  const chords = useMemo(() => diatonicChords(key), [key])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CircleOfFifths selected={key} onSelect={setKey} />

      <div className="space-y-3">
        <p className="text-sm font-medium">
          Diatonische akkoorden in <span className="font-bold">{key} majeur</span>:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {chords.map((c) => (
            <button
              key={c.degree}
              onClick={async () => {
                await ready()
                const notes = chordNotesWithOctave(c.chord, 3)
                if (notes.length) playChord(notes, '2n')
              }}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-accent"
            >
              <span>
                <span className="font-bold">{c.chord}</span>{' '}
                <span className="text-xs text-muted-foreground">{c.quality}</span>
              </span>
              <Badge variant="muted">{c.degree}</Badge>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Tik op een akkoord om het te beluisteren. De I, IV en V (majeur) vormen samen de basis van talloze nummers.
        </p>
      </div>
    </div>
  )
}
