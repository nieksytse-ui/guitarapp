import { Note } from 'tonal'
import { chordNotesWithOctave } from '@/lib/theory'

export interface EarInterval {
  semitones: number
  label: string
}

/** Intervallen voor de gehoortraining, oplopend in halve tonen. */
export const EAR_INTERVALS: EarInterval[] = [
  { semitones: 1, label: 'Kleine secunde' },
  { semitones: 2, label: 'Grote secunde' },
  { semitones: 3, label: 'Kleine terts' },
  { semitones: 4, label: 'Grote terts' },
  { semitones: 5, label: 'Reine kwart' },
  { semitones: 6, label: 'Tritonus' },
  { semitones: 7, label: 'Reine kwint' },
  { semitones: 8, label: 'Kleine sext' },
  { semitones: 9, label: 'Grote sext' },
  { semitones: 10, label: 'Kleine septiem' },
  { semitones: 11, label: 'Grote septiem' },
  { semitones: 12, label: 'Octaaf' },
]

export interface EarChordType {
  suffix: string
  label: string
}

/** Akkoordtypes voor de gehoortraining. */
export const EAR_CHORD_TYPES: EarChordType[] = [
  { suffix: '', label: 'Majeur' },
  { suffix: 'm', label: 'Mineur' },
  { suffix: '7', label: 'Dominant 7' },
  { suffix: 'maj7', label: 'Majeur 7' },
  { suffix: 'm7', label: 'Mineur 7' },
  { suffix: 'dim', label: 'Verminderd' },
  { suffix: 'aug', label: 'Overmatig' },
  { suffix: 'sus4', label: 'Sus4' },
]

/** Moeilijkheidspresets bepalen welke opties standaard meedoen. */
export const INTERVAL_PRESETS = {
  makkelijk: [4, 7, 12], // grote terts, kwint, octaaf
  gemiddeld: [2, 3, 4, 5, 7, 9, 12],
  moeilijk: EAR_INTERVALS.map((i) => i.semitones),
}

export const CHORD_PRESETS = {
  makkelijk: ['', 'm'],
  gemiddeld: ['', 'm', '7', 'dim'],
  moeilijk: EAR_CHORD_TYPES.map((c) => c.suffix),
}

const ROOTS = ['C', 'D', 'E', 'F', 'G', 'A']

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export interface IntervalQuestion {
  kind: 'interval'
  rootNote: string
  semitones: number
  label: string
  notes: [string, string]
}

export function makeIntervalQuestion(allowed: number[]): IntervalQuestion {
  const root = randomOf(ROOTS)
  const octave = randomOf([3, 4])
  const rootNote = `${root}${octave}`
  const semitones = randomOf(allowed)
  const target = Note.fromMidi((Note.midi(rootNote) ?? 60) + semitones)
  const found = EAR_INTERVALS.find((i) => i.semitones === semitones)
  return {
    kind: 'interval',
    rootNote,
    semitones,
    label: found?.label ?? `${semitones} halve tonen`,
    notes: [rootNote, target],
  }
}

export interface ChordQuestion {
  kind: 'chord'
  root: string
  suffix: string
  label: string
  notes: string[]
}

export function makeChordQuestion(allowed: string[]): ChordQuestion {
  const root = randomOf(ROOTS)
  const suffix = randomOf(allowed)
  const label = EAR_CHORD_TYPES.find((c) => c.suffix === suffix)?.label ?? 'Akkoord'
  return {
    kind: 'chord',
    root,
    suffix,
    label,
    notes: chordNotesWithOctave(`${root}${suffix}`, 3),
  }
}
