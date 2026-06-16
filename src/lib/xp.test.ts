import { describe, expect, it } from 'vitest'
import {
  buildHeatmap,
  computeLongestStreak,
  computeStreak,
  getLevelInfo,
  levelFromXp,
  toDateKey,
  totalXpOf,
  xpForLevel,
} from './xp'
import type { Activity } from './types'

describe('levels', () => {
  it('level 1 begint op 0 XP', () => {
    expect(xpForLevel(1)).toBe(0)
    expect(levelFromXp(0)).toBe(1)
    expect(levelFromXp(99)).toBe(1)
  })

  it('elk level kost oplopend meer XP', () => {
    // level 1->2 = 100, 2->3 = 150, 3->4 = 200
    expect(xpForLevel(2)).toBe(100)
    expect(xpForLevel(3)).toBe(250)
    expect(xpForLevel(4)).toBe(450)
  })

  it('levelFromXp komt overeen met de drempels', () => {
    expect(levelFromXp(100)).toBe(2)
    expect(levelFromXp(249)).toBe(2)
    expect(levelFromXp(250)).toBe(3)
  })

  it('getLevelInfo geeft correcte voortgang binnen een level', () => {
    const info = getLevelInfo(175) // level 2, 75 van 150 binnen level
    expect(info.level).toBe(2)
    expect(info.intoLevel).toBe(75)
    expect(info.levelSpan).toBe(150)
    expect(info.ratio).toBeCloseTo(0.5)
    expect(info.remaining).toBe(75)
  })
})

describe('streaks', () => {
  it('lege geschiedenis = 0', () => {
    expect(computeStreak([], '2026-06-15')).toBe(0)
  })

  it('telt aaneengesloten dagen tot vandaag', () => {
    const days = ['2026-06-13', '2026-06-14', '2026-06-15']
    expect(computeStreak(days, '2026-06-15')).toBe(3)
  })

  it('telt door als gisteren wel maar vandaag (nog) niet geoefend is', () => {
    const days = ['2026-06-13', '2026-06-14']
    expect(computeStreak(days, '2026-06-15')).toBe(2)
  })

  it('breekt af bij een gat', () => {
    const days = ['2026-06-10', '2026-06-14', '2026-06-15']
    expect(computeStreak(days, '2026-06-15')).toBe(2)
  })

  it('reset naar 0 na twee gemiste dagen', () => {
    const days = ['2026-06-12']
    expect(computeStreak(days, '2026-06-15')).toBe(0)
  })

  it('langste streak ooit', () => {
    const days = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-10', '2026-06-11']
    expect(computeLongestStreak(days)).toBe(3)
  })
})

describe('aggregaties', () => {
  const activities: Activity[] = [
    { type: 'strumming', title: 'a', xp: 15, durationSec: 60, date: '2026-06-15T10:00:00.000Z' },
    { type: 'chord-change', title: 'b', xp: 20, durationSec: 60, date: '2026-06-15T11:00:00.000Z' },
    { type: 'ear-training', title: 'c', xp: 5, durationSec: 30, date: '2026-06-14T09:00:00.000Z' },
  ]

  it('telt totale XP op', () => {
    expect(totalXpOf(activities)).toBe(40)
  })

  it('bouwt een heatmap per dag', () => {
    const map = buildHeatmap(activities)
    const today = toDateKey('2026-06-15T10:00:00.000Z')
    expect(map.get(today)?.count).toBe(2)
    expect(map.get(today)?.xp).toBe(35)
  })
})
