import { create } from 'zustand'
import type { Activity, ChordChangeRecord } from '@/lib/types'
import * as db from '@/lib/db/database'
import {
  buildHeatmap,
  computeLongestStreak,
  computeStreak,
  getLevelInfo,
  toDateKey,
  totalXpOf,
  type HeatmapEntry,
  type LevelInfo,
} from '@/lib/xp'

type NewActivity = Omit<Activity, 'id' | 'date'> & { date?: string }

interface ProgressState {
  loaded: boolean
  activities: Activity[]
  records: Record<string, ChordChangeRecord>

  /** Laadt alle voortgang uit IndexedDB (eenmalig bij opstarten). */
  load: () => Promise<void>
  /** Herlaadt alle voortgang uit IndexedDB (bv. na het herstellen van een back-up). */
  reload: () => Promise<void>
  /** Logt een voltooide activiteit (kent XP toe en bewaart hem). */
  logActivity: (input: NewActivity) => Promise<Activity>
  /** Verwerkt een akkoordwissel-resultaat en houdt het record bij. */
  submitChordChange: (chords: string[], count: number) => Promise<{ record: ChordChangeRecord; isRecord: boolean }>
  /** Wist alle voortgang. */
  reset: () => Promise<void>
}

/** Normaliseer een akkoordcombinatie naar een stabiele sleutel. */
export function comboKey(chords: string[]): string {
  return [...chords].map((c) => c.trim()).sort().join('-')
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  loaded: false,
  activities: [],
  records: {},

  load: async () => {
    if (get().loaded) return
    try {
      const [activities, records] = await Promise.all([
        db.getAllActivities(),
        db.getAllRecords(),
      ])
      const recordMap: Record<string, ChordChangeRecord> = {}
      for (const r of records) recordMap[r.combo] = r
      set({ activities, records: recordMap, loaded: true })
    } catch (err) {
      // Bijv. privémodus zonder IndexedDB: ga verder met lege, in-memory state.
      console.warn('Kon voortgang niet laden uit IndexedDB:', err)
      set({ loaded: true })
    }
  },

  reload: async () => {
    try {
      const [activities, records] = await Promise.all([
        db.getAllActivities(),
        db.getAllRecords(),
      ])
      const recordMap: Record<string, ChordChangeRecord> = {}
      for (const r of records) recordMap[r.combo] = r
      set({ activities, records: recordMap, loaded: true })
    } catch (err) {
      console.warn('Kon voortgang niet herladen uit IndexedDB:', err)
    }
  },

  logActivity: async (input) => {
    const activity: Activity = {
      ...input,
      date: input.date ?? new Date().toISOString(),
    }
    try {
      const id = await db.addActivity(activity)
      if (id >= 0) activity.id = id
    } catch (err) {
      console.warn('Kon activiteit niet opslaan:', err)
    }
    set((state) => ({ activities: [...state.activities, activity] }))
    return activity
  },

  submitChordChange: async (chords, count) => {
    const combo = comboKey(chords)
    const existing = get().records[combo]
    const today = new Date().toISOString()
    const isRecord = !existing || count > existing.best

    const record: ChordChangeRecord = existing
      ? {
          ...existing,
          best: Math.max(existing.best, count),
          history: [...existing.history, { date: today, count }],
        }
      : {
          combo,
          chords: [...chords],
          best: count,
          history: [{ date: today, count }],
        }

    try {
      await db.putRecord(record)
    } catch (err) {
      console.warn('Kon record niet opslaan:', err)
    }
    set((state) => ({ records: { ...state.records, [combo]: record } }))
    return { record, isRecord }
  },

  reset: async () => {
    try {
      await db.clearAllData()
    } catch (err) {
      console.warn('Kon data niet wissen:', err)
    }
    set({ activities: [], records: {} })
  },
}))

// ---------------------------------------------------------------------------
// Selectors / afgeleide waarden
// ---------------------------------------------------------------------------

export function selectTotalXp(activities: Activity[]): number {
  return totalXpOf(activities)
}

export function selectLevelInfo(activities: Activity[]): LevelInfo {
  return getLevelInfo(totalXpOf(activities))
}

export function selectStreak(activities: Activity[]): number {
  return computeStreak(activities.map((a) => toDateKey(a.date)))
}

export function selectLongestStreak(activities: Activity[]): number {
  return computeLongestStreak(activities.map((a) => toDateKey(a.date)))
}

export function selectHeatmap(activities: Activity[]): Map<string, HeatmapEntry> {
  return buildHeatmap(activities)
}

export function selectXpByType(activities: Activity[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const a of activities) out[a.type] = (out[a.type] ?? 0) + a.xp
  return out
}
