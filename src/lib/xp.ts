// Pure, testbare logica voor XP, levels en streaks.
// Geen DOM- of React-afhankelijkheden, zodat dit eenvoudig te unit-testen is.

import type { Activity } from '@/lib/types'

/** XP-beloningen per activiteit. Eerlijk verdeeld: meer inspanning = meer XP. */
export const XP_REWARDS = {
  /** Per voltooide strumming-oefenronde. */
  strummingRound: 15,
  /** Per akkoord dat je oefent (beluisteren/inprenten). */
  chordPracticed: 6,
  /** Per voltooide 60-seconden akkoordwissel-ronde. */
  chordChangeRound: 20,
  /** Bonus bij een nieuw persoonlijk record. */
  chordChangeRecordBonus: 15,
  /** Per goed quiz-antwoord. */
  theoryQuizCorrect: 6,
  /** Bonus bij het afronden van een theorie-stage. */
  theoryStageComplete: 40,
  /** Per goed gehoortraining-antwoord. */
  earCorrect: 5,
  /** Per voltooid sessieblok. */
  sessionBlock: 12,
  /** Bonus bij het afronden van een hele sessie. */
  sessionComplete: 30,
  /** Per keer meespelen met een liedje. */
  songPlayed: 18,
} as const

const LEVEL_BASE = 100
const LEVEL_GROWTH = 50

/**
 * Cumulatieve XP die nodig is om een bepaald level te bereiken.
 * Level 1 = 0 XP. Elk volgend level kost steeds wat meer XP.
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  let total = 0
  for (let l = 1; l < level; l++) {
    total += LEVEL_BASE + (l - 1) * LEVEL_GROWTH
  }
  return total
}

/** Het level dat bij een bepaalde hoeveelheid XP hoort. */
export function levelFromXp(xp: number): number {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  return level
}

export interface LevelInfo {
  level: number
  /** XP-drempel voor het huidige level. */
  levelStartXp: number
  /** XP-drempel voor het volgende level. */
  nextLevelXp: number
  /** XP behaald binnen het huidige level. */
  intoLevel: number
  /** XP nodig om het huidige level te doorlopen. */
  levelSpan: number
  /** Voortgang binnen het level (0..1). */
  ratio: number
  /** XP nog te gaan tot het volgende level. */
  remaining: number
}

/** Volledige levelinformatie voor voortgangsbalken e.d. */
export function getLevelInfo(xp: number): LevelInfo {
  const level = levelFromXp(xp)
  const levelStartXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const levelSpan = nextLevelXp - levelStartXp
  const intoLevel = xp - levelStartXp
  return {
    level,
    levelStartXp,
    nextLevelXp,
    intoLevel,
    levelSpan,
    ratio: levelSpan > 0 ? intoLevel / levelSpan : 0,
    remaining: Math.max(0, nextLevelXp - xp),
  }
}

/** Lokale datumsleutel (YYYY-MM-DD) op basis van de lokale tijdzone. */
export function toDateKey(d: Date | string | number): string {
  const date = new Date(d)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Bereken de huidige streak (aaneengesloten oefendagen) die eindigt op vandaag
 * of gisteren. Heb je vandaag nog niet geoefend maar gisteren wel, dan telt de
 * streak nog door (je hebt vandaag nog kans).
 */
export function computeStreak(
  dateKeys: Iterable<string>,
  todayKey: string = toDateKey(new Date()),
): number {
  const set = new Set(dateKeys)
  if (set.size === 0) return 0

  const cursor = new Date(`${todayKey}T00:00:00`)
  if (!set.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1)
    if (!set.has(toDateKey(cursor))) return 0
  }

  let streak = 0
  while (set.has(toDateKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Langste streak ooit (voor statistieken/badges). */
export function computeLongestStreak(dateKeys: Iterable<string>): number {
  const keys = Array.from(new Set(dateKeys)).sort()
  if (keys.length === 0) return 0

  let longest = 1
  let current = 1
  for (let i = 1; i < keys.length; i++) {
    const prev = new Date(`${keys[i - 1]}T00:00:00`)
    prev.setDate(prev.getDate() + 1)
    if (toDateKey(prev) === keys[i]) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }
  return longest
}

/** Totale XP uit een lijst activiteiten. */
export function totalXpOf(activities: Activity[]): number {
  return activities.reduce((sum, a) => sum + a.xp, 0)
}

export interface HeatmapEntry {
  date: string
  count: number
  xp: number
}

/** Aggregatie per dag voor de kalender-heatmap. */
export function buildHeatmap(activities: Activity[]): Map<string, HeatmapEntry> {
  const map = new Map<string, HeatmapEntry>()
  for (const a of activities) {
    const key = toDateKey(a.date)
    const entry = map.get(key) ?? { date: key, count: 0, xp: 0 }
    entry.count += 1
    entry.xp += a.xp
    map.set(key, entry)
  }
  return map
}
