// Muziektheorie-helpers. Alle berekeningen lopen via Tonal.js zodat de
// theorie-content gefact-checkt en consistent is.

import { Chord, Interval, Note, Scale } from 'tonal'

/** Chromatische toonladder met voorkeur voor kruisen (#). */
export const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * Standaard gitaarstemming, van hoge e (snaar 1) naar lage E (snaar 6).
 * Deze volgorde matcht een fretboard-weergave van boven naar beneden.
 */
export const GUITAR_TUNING_HIGH_TO_LOW = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2']

export interface FretCell {
  /** Noot met octaaf, bijv. "G3". */
  note: string
  /** Noot zonder octaaf (pitch class), bijv. "G". */
  pc: string
  string: number
  fret: number
}

/** De noot op een bepaalde snaar/fret, berekend via MIDI (altijd correct). */
export function fretNote(openNote: string, fret: number): string {
  const midi = Note.midi(openNote)
  if (midi == null) return openNote
  return Note.fromMidi(midi + fret)
}

/** Bouw een 2D-rooster van de hals: rij per snaar, kolom per fret (0..fretCount). */
export function buildFretboard(
  fretCount = 12,
  tuning: string[] = GUITAR_TUNING_HIGH_TO_LOW,
): FretCell[][] {
  return tuning.map((open, stringIdx) => {
    const row: FretCell[] = []
    for (let fret = 0; fret <= fretCount; fret++) {
      const note = fretNote(open, fret)
      row.push({
        note,
        pc: Note.pitchClass(note),
        string: stringIdx + 1,
        fret,
      })
    }
    return row
  })
}

/** Pitch classes van een toonladder, bijv. scaleNotes('C', 'major'). */
export function scaleNotes(tonic: string, type: string): string[] {
  return Scale.get(`${tonic} ${type}`).notes
}

/**
 * Zet een reeks pitch classes om naar noten met oplopende octaven, zodat ze als
 * stijgende toonladder/melodie afgespeeld kunnen worden.
 */
export function ascendingOctaves(pcs: string[], startOctave = 4): string[] {
  const out: string[] = []
  let octave = startOctave
  let prevMidi = -Infinity
  for (const pc of pcs) {
    let note = `${pc}${octave}`
    let midi = Note.midi(note)
    if (midi != null && midi <= prevMidi) {
      octave++
      note = `${pc}${octave}`
      midi = Note.midi(note)
    }
    out.push(note)
    if (midi != null) prevMidi = midi
  }
  return out
}

/** Pitch classes (en intervallen) van een akkoord op basis van symbool. */
export function chordInfo(symbol: string): { notes: string[]; intervals: string[]; name: string } {
  const c = Chord.get(symbol)
  return { notes: c.notes, intervals: c.intervals, name: c.name }
}

/** Akkoordnoten met octaaf vanaf een grondtoon-octaaf (voor afspelen). */
export function chordNotesWithOctave(symbol: string, octave = 3): string[] {
  const c = Chord.get(symbol)
  if (!c.tonic || c.notes.length === 0) return []
  const root = `${c.tonic}${octave}`
  return c.intervals.map((iv) => Note.transpose(root, iv))
}

/** Naam van het interval tussen twee noten, bijv. "3M" (grote terts). */
export function intervalBetween(from: string, to: string): string {
  return Interval.distance(from, to)
}

/** Nederlandse naam van een interval-aantal halve tonen. */
export const SEMITONE_INTERVAL_NAMES: Record<number, string> = {
  0: 'Prime (unisono)',
  1: 'Kleine secunde',
  2: 'Grote secunde',
  3: 'Kleine terts',
  4: 'Grote terts',
  5: 'Reine kwart',
  6: 'Tritonus',
  7: 'Reine kwint',
  8: 'Kleine sext',
  9: 'Grote sext',
  10: 'Kleine septiem',
  11: 'Grote septiem',
  12: 'Octaaf',
}

/** De cirkel van kwinten (majeur), met start op C, met de wijzers mee. */
export function circleOfFifthsMajor(): string[] {
  const out: string[] = []
  let note = 'C'
  for (let i = 0; i < 12; i++) {
    out.push(Note.pitchClass(note))
    note = Note.transpose(note, '5P')
  }
  return out
}

/** De relatieve mineur-toonsoorten die bij elke majeur op de cirkel horen. */
export function circleOfFifthsMinor(): string[] {
  return circleOfFifthsMajor().map((maj) => Note.pitchClass(Note.transpose(`${maj}4`, '-3m')) + 'm')
}

export interface ScaleDegreeChord {
  degree: string
  chord: string
  quality: 'majeur' | 'mineur' | 'verminderd'
}

/** Diatonische akkoorden van een majeur-toonsoort (I ii iii IV V vi vii°). */
export function diatonicChords(tonic: string): ScaleDegreeChord[] {
  const notes = scaleNotes(tonic, 'major')
  const numerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
  const qualities: ScaleDegreeChord['quality'][] = [
    'majeur',
    'mineur',
    'mineur',
    'majeur',
    'majeur',
    'mineur',
    'verminderd',
  ]
  const suffix = ['', 'm', 'm', '', '', 'm', 'dim']
  return notes.map((n, i) => ({
    degree: numerals[i],
    chord: `${n}${suffix[i]}`,
    quality: qualities[i],
  }))
}

/** Aantal kruisen/mollen (voortekens) van een majeur-toonsoort. */
export function keySignatureCount(tonic: string): { sharps: number; flats: number } {
  const notes = scaleNotes(tonic, 'major')
  let sharps = 0
  let flats = 0
  for (const n of notes) {
    if (n.includes('#')) sharps++
    if (n.includes('b')) flats++
  }
  return { sharps, flats }
}
