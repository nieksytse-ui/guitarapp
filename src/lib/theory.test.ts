import { describe, expect, it } from 'vitest'
import {
  buildFretboard,
  chordInfo,
  chordNotesWithOctave,
  circleOfFifthsMajor,
  diatonicChords,
  fretNote,
  intervalBetween,
  scaleNotes,
} from './theory'

describe('fretboard', () => {
  it('open snaren kloppen met standaardstemming', () => {
    expect(fretNote('E2', 0)).toBe('E2')
    expect(fretNote('A2', 0)).toBe('A2')
  })

  it('berekent noten op frets correct', () => {
    // 5e fret van de lage E is een A.
    expect(fretNote('E2', 5)).toBe('A2')
    // 12e fret is een octaaf hoger.
    expect(fretNote('E2', 12)).toBe('E3')
    // 3e fret van de A-snaar is een C.
    expect(fretNote('A2', 3)).toBe('C3')
  })

  it('bouwt een rooster van 6 snaren', () => {
    const fb = buildFretboard(12)
    expect(fb).toHaveLength(6)
    expect(fb[0]).toHaveLength(13) // fret 0..12
    expect(fb[0][0].pc).toBe('E') // hoge e, open
  })
})

describe('toonladders', () => {
  it('C majeur heeft geen voortekens', () => {
    expect(scaleNotes('C', 'major')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })

  it('G majeur heeft F#', () => {
    expect(scaleNotes('G', 'major')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#'])
  })

  it('A mineur (natuurlijk) klopt', () => {
    expect(scaleNotes('A', 'minor')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  })
})

describe('akkoorden', () => {
  it('C majeur bestaat uit C E G', () => {
    expect(chordInfo('C').notes).toEqual(['C', 'E', 'G'])
  })

  it('Cmaj7 bestaat uit C E G B', () => {
    expect(chordInfo('Cmaj7').notes).toEqual(['C', 'E', 'G', 'B'])
  })

  it('Am bestaat uit A C E', () => {
    expect(chordInfo('Am').notes).toEqual(['A', 'C', 'E'])
  })

  it('akkoordnoten met octaaf voor afspelen', () => {
    expect(chordNotesWithOctave('C', 3)).toEqual(['C3', 'E3', 'G3'])
  })
})

describe('intervallen', () => {
  it('C naar E is een grote terts', () => {
    expect(intervalBetween('C', 'E')).toBe('3M')
  })

  it('C naar G is een reine kwint', () => {
    expect(intervalBetween('C', 'G')).toBe('5P')
  })
})

describe('toonsoorten', () => {
  it('cirkel van kwinten begint met C G D A …', () => {
    expect(circleOfFifthsMajor().slice(0, 4)).toEqual(['C', 'G', 'D', 'A'])
    expect(circleOfFifthsMajor()).toHaveLength(12)
  })

  it('diatonische akkoorden van C majeur', () => {
    const chords = diatonicChords('C').map((d) => d.chord)
    expect(chords).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'])
  })

  it('V-akkoord van G majeur is D', () => {
    const chords = diatonicChords('G')
    expect(chords[4].chord).toBe('D')
    expect(chords[4].degree).toBe('V')
  })
})
