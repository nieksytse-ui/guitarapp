// Centrale TypeScript-types voor FretFlow.

// ---------------------------------------------------------------------------
// Voortgang, XP & activiteiten
// ---------------------------------------------------------------------------

export type ActivityType =
  | 'strumming'
  | 'chord-practice'
  | 'chord-change'
  | 'theory-quiz'
  | 'ear-training'
  | 'session'
  | 'song'

export interface Activity {
  id?: number
  type: ActivityType
  title: string
  xp: number
  durationSec: number
  /** ISO-timestamp van afronding. */
  date: string
  meta?: Record<string, unknown>
}

export interface ChordChangeRecord {
  /** Bijv. "C-G" (alfabetisch genormaliseerd). */
  combo: string
  chords: string[]
  best: number
  history: { date: string; count: number }[]
}

// ---------------------------------------------------------------------------
// Akkoorden (SVGuitar-compatibel)
// ---------------------------------------------------------------------------

export type ChordType =
  | 'major'
  | 'minor'
  | '7'
  | 'maj7'
  | 'min7'
  | 'sus2'
  | 'sus4'
  | 'dim'
  | 'aug'
  | 'add9'
  | 'power'

export type Difficulty = 'beginner' | 'gemiddeld' | 'gevorderd'

/** [snaar (1=hoge e .. 6=lage E), fret of 'x' (mute), optioneel vingernummer]. */
export type FingerPosition = [number, number | 'x', string?]

export interface Barre {
  fromString: number
  toString: number
  fret: number
  text?: string
}

export interface ChordShape {
  id: string
  /** Korte naam, bijv. "C", "Am", "G7". */
  name: string
  /** Nette weergavenaam, bijv. "C majeur". */
  display: string
  root: string
  type: ChordType
  difficulty: Difficulty
  /** Basisfret van het diagram (1 = vanaf de nut). */
  position: number
  fingers: FingerPosition[]
  barres?: Barre[]
  /** Noten in wetenschappelijke toonhoogte voor weergave/afspelen, bijv. ["C3","E3","G3"]. */
  notes: string[]
  builtIn?: boolean
}

// ---------------------------------------------------------------------------
// Strumming-patronen
// ---------------------------------------------------------------------------

export type TimeSignature = '4/4' | '3/4' | '6/8'

/** D = down, U = up, X = mute/percussief, '-' = rust (geen aanslag). */
export type StrumCell = 'D' | 'U' | 'X' | '-'

export interface StrummingPattern {
  id: string
  name: string
  timeSignature: TimeSignature
  /** Eén cel per achtste noot (of per achtste in 6/8). Lengte = aantal subdivisies. */
  cells: StrumCell[]
  /** Indexen die een accent krijgen (standaard tel 1). */
  accents?: number[]
  description?: string
  difficulty?: Difficulty
  builtIn?: boolean
}

// ---------------------------------------------------------------------------
// Oefensessies
// ---------------------------------------------------------------------------

export type BlockModule =
  | 'chord-change'
  | 'strumming'
  | 'chords'
  | 'song'
  | 'theory'
  | 'ear-training'
  | 'free'

export interface SessionBlock {
  id: string
  module: BlockModule
  title: string
  durationSec: number
  note?: string
}

export interface SessionTemplate {
  id: string
  name: string
  blocks: SessionBlock[]
  builtIn?: boolean
}

// ---------------------------------------------------------------------------
// Liedjes (meespelen)
// ---------------------------------------------------------------------------

export interface SongMeasure {
  chord: string
  /** Aantal tellen dat dit akkoord duurt. */
  beats: number
}

export interface SongSection {
  name: string
  measures: SongMeasure[]
}

export interface Song {
  id: string
  title: string
  artist: string
  /** Toonsoort, bijv. "G". */
  songKey?: string
  tempo: number
  timeSignature: TimeSignature
  source: 'public-domain' | 'traditioneel' | 'eigen'
  sections: SongSection[]
  builtIn?: boolean
}
