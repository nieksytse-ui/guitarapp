// Lichte IndexedDB-wrapper via `idb`. Bewaart alle voortgang lokaal — geen backend nodig.
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type {
  Activity,
  ChordChangeRecord,
  ChordShape,
  SessionTemplate,
  StrummingPattern,
} from '@/lib/types'

interface FretFlowDB extends DBSchema {
  activities: {
    key: number
    value: Activity
    indexes: { 'by-date': string; 'by-type': string }
  }
  records: {
    key: string
    value: ChordChangeRecord
  }
  templates: {
    key: string
    value: SessionTemplate
  }
  customPatterns: {
    key: string
    value: StrummingPattern
  }
  customChords: {
    key: string
    value: ChordShape
  }
}

const DB_NAME = 'fretflow'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<FretFlowDB>> | null = null

/** Is IndexedDB beschikbaar in deze omgeving? */
function hasIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined'
}

function getDB(): Promise<IDBPDatabase<FretFlowDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FretFlowDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const activities = db.createObjectStore('activities', {
          keyPath: 'id',
          autoIncrement: true,
        })
        activities.createIndex('by-date', 'date')
        activities.createIndex('by-type', 'type')

        db.createObjectStore('records', { keyPath: 'combo' })
        db.createObjectStore('templates', { keyPath: 'id' })
        db.createObjectStore('customPatterns', { keyPath: 'id' })
        db.createObjectStore('customChords', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

// --- Activiteiten ----------------------------------------------------------

export async function addActivity(activity: Activity): Promise<number> {
  if (!hasIndexedDB()) return -1
  const db = await getDB()
  return db.add('activities', activity)
}

export async function getAllActivities(): Promise<Activity[]> {
  if (!hasIndexedDB()) return []
  const db = await getDB()
  return db.getAllFromIndex('activities', 'by-date')
}

// --- Akkoordwissel-records -------------------------------------------------

export async function putRecord(record: ChordChangeRecord): Promise<void> {
  if (!hasIndexedDB()) return
  const db = await getDB()
  await db.put('records', record)
}

export async function getAllRecords(): Promise<ChordChangeRecord[]> {
  if (!hasIndexedDB()) return []
  const db = await getDB()
  return db.getAll('records')
}

// --- Sessie-templates ------------------------------------------------------

export async function putTemplate(template: SessionTemplate): Promise<void> {
  if (!hasIndexedDB()) return
  const db = await getDB()
  await db.put('templates', template)
}

export async function getAllTemplates(): Promise<SessionTemplate[]> {
  if (!hasIndexedDB()) return []
  const db = await getDB()
  return db.getAll('templates')
}

export async function deleteTemplate(id: string): Promise<void> {
  if (!hasIndexedDB()) return
  const db = await getDB()
  await db.delete('templates', id)
}

// --- Eigen strumming-patronen ---------------------------------------------

export async function putCustomPattern(pattern: StrummingPattern): Promise<void> {
  if (!hasIndexedDB()) return
  const db = await getDB()
  await db.put('customPatterns', pattern)
}

export async function getAllCustomPatterns(): Promise<StrummingPattern[]> {
  if (!hasIndexedDB()) return []
  const db = await getDB()
  return db.getAll('customPatterns')
}

export async function deleteCustomPattern(id: string): Promise<void> {
  if (!hasIndexedDB()) return
  const db = await getDB()
  await db.delete('customPatterns', id)
}

// --- Eigen akkoorden -------------------------------------------------------

export async function putCustomChord(chord: ChordShape): Promise<void> {
  if (!hasIndexedDB()) return
  const db = await getDB()
  await db.put('customChords', chord)
}

export async function getAllCustomChords(): Promise<ChordShape[]> {
  if (!hasIndexedDB()) return []
  const db = await getDB()
  return db.getAll('customChords')
}

export async function deleteCustomChord(id: string): Promise<void> {
  if (!hasIndexedDB()) return
  const db = await getDB()
  await db.delete('customChords', id)
}

// --- Onderhoud -------------------------------------------------------------

/** Wist alle lokale voortgang (gebruikt door instellingen → "reset"). */
export async function clearAllData(): Promise<void> {
  if (!hasIndexedDB()) return
  const db = await getDB()
  await Promise.all([
    db.clear('activities'),
    db.clear('records'),
    db.clear('templates'),
    db.clear('customPatterns'),
    db.clear('customChords'),
  ])
}

// --- Back-up / herstel -----------------------------------------------------

/** Alle IndexedDB-gegevens in één object (voor export). */
export interface BackupData {
  activities: Activity[]
  records: ChordChangeRecord[]
  templates: SessionTemplate[]
  customPatterns: StrummingPattern[]
  customChords: ChordShape[]
}

/** Haalt alle lokale gegevens op om te exporteren naar een back-upbestand. */
export async function exportAllData(): Promise<BackupData> {
  const [activities, records, templates, customPatterns, customChords] = await Promise.all([
    getAllActivities(),
    getAllRecords(),
    getAllTemplates(),
    getAllCustomPatterns(),
    getAllCustomChords(),
  ])
  return { activities, records, templates, customPatterns, customChords }
}

/**
 * Zet een back-up terug. Vervangt (replace) alle bestaande gegevens, zodat het
 * resultaat exact overeenkomt met het back-upbestand.
 */
export async function importAllData(data: Partial<BackupData>): Promise<void> {
  if (!hasIndexedDB()) throw new Error('IndexedDB is niet beschikbaar in deze browser.')
  const db = await getDB()
  await clearAllData()
  const tasks: Promise<unknown>[] = []
  for (const a of data.activities ?? []) tasks.push(db.put('activities', a))
  for (const r of data.records ?? []) tasks.push(db.put('records', r))
  for (const t of data.templates ?? []) tasks.push(db.put('templates', t))
  for (const p of data.customPatterns ?? []) tasks.push(db.put('customPatterns', p))
  for (const c of data.customChords ?? []) tasks.push(db.put('customChords', c))
  await Promise.all(tasks)
}
