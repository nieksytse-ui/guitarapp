// Pure types, constanten en helpers voor de akkoord-hals-trainer.
// Bewust losgekoppeld van de componenten zodat React Fast Refresh blijft werken
// (een module met JSX-componenten zou anders ook non-component exports bevatten).

import type { ChordShape } from '@/lib/types'

/** Het actieve "gereedschap" waarmee je op de hals tikt. */
export type Tool = 'mute' | 'open' | 'erase' | 'f1' | 'f2' | 'f3' | 'f4'

/** Wat de gebruiker per snaar heeft ingevoerd. */
export type InputString =
  | { kind: 'mute' }
  | { kind: 'open' }
  | { kind: 'finger'; fret: number; finger: number }

/** Het verwachte (juiste) antwoord per snaar. */
export type ExpectedString =
  | { kind: 'mute' }
  | { kind: 'open' }
  | { kind: 'finger'; fret: number; finger?: number }

export type InputMap = Map<number, InputString>

// Snaren van boven naar beneden: 1 = hoge e … 6 = lage E (TAB-conventie).
export const STRINGS = [1, 2, 3, 4, 5, 6] as const

export const STRING_LABELS: Record<number, string> = {
  1: 'e',
  2: 'B',
  3: 'G',
  4: 'D',
  5: 'A',
  6: 'E',
}

export const FINGER_LABELS: Record<number, string> = {
  1: 'Wijsvinger',
  2: 'Middelvinger',
  3: 'Ringvinger',
  4: 'Pink',
}

export const FINGER_COLORS: Record<number, string> = {
  1: 'bg-sky-500',
  2: 'bg-violet-500',
  3: 'bg-amber-500',
  4: 'bg-rose-500',
}

/** Zet de vingerdata van een akkoord om naar het verwachte antwoord per snaar. */
export function buildExpected(chord: ChordShape): Map<number, ExpectedString> {
  const m = new Map<number, ExpectedString>()
  for (const [string, fret, finger] of chord.fingers) {
    if (fret === 'x') m.set(string, { kind: 'mute' })
    else if (fret === 0) m.set(string, { kind: 'open' })
    else m.set(string, { kind: 'finger', fret, finger: finger ? Number(finger) : undefined })
  }
  return m
}

/** Hoogste fret die in het akkoord voorkomt (voor de breedte van de hals). */
export function maxFretOf(expected: Map<number, ExpectedString>): number {
  let max = 0
  for (const v of expected.values()) if (v.kind === 'finger') max = Math.max(max, v.fret)
  return max
}

/** Klopt de invoer voor één snaar met het verwachte antwoord? */
export function isStringCorrect(
  expected: ExpectedString | undefined,
  user: InputString | undefined,
): boolean {
  if (!expected) return !user
  if (expected.kind === 'mute') return user?.kind === 'mute'
  if (expected.kind === 'open') return user?.kind === 'open'
  return (
    user?.kind === 'finger' &&
    user.fret === expected.fret &&
    (expected.finger == null || user.finger === expected.finger)
  )
}
