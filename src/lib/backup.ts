// Back-up & herstel van alle lokale voortgang.
//
// Omdat FretFlow geen account of server gebruikt, kun je je voortgang hier als
// een .json-bestand downloaden en later (of op een ander apparaat) weer inladen.
// Dit combineert de IndexedDB-gegevens met de instellingen uit localStorage.

import * as db from '@/lib/db/database'
import type { BackupData } from '@/lib/db/database'

const SETTINGS_KEY = 'fretflow-settings'

/** Het volledige back-upbestand. */
export interface FretFlowBackup {
  app: 'fretflow'
  version: number
  exportedAt: string
  data: BackupData
  settings: Record<string, unknown> | null
}

/** Stelt een back-up samen uit IndexedDB + instellingen. */
export async function createBackup(): Promise<FretFlowBackup> {
  const data = await db.exportAllData()
  let settings: Record<string, unknown> | null = null
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) settings = JSON.parse(raw)
  } catch {
    // localStorage niet beschikbaar of corrupt — sla instellingen over.
  }
  return {
    app: 'fretflow',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
    settings,
  }
}

/** Biedt de back-up als download aan (fretflow-backup-JJJJ-MM-DD.json). */
export function downloadBackup(backup: FretFlowBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fretflow-backup-${backup.exportedAt.slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Minimale validatie of een onbekend object een FretFlow-back-up is. */
export function isValidBackup(x: unknown): x is FretFlowBackup {
  if (!x || typeof x !== 'object') return false
  const b = x as Record<string, unknown>
  return b.app === 'fretflow' && typeof b.data === 'object' && b.data !== null
}

/** Leest en valideert een gekozen back-upbestand. */
export async function readBackupFile(file: File): Promise<FretFlowBackup> {
  let parsed: unknown
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    throw new Error('Het bestand kon niet worden gelezen (geen geldige JSON).')
  }
  if (!isValidBackup(parsed)) {
    throw new Error('Dit lijkt geen geldig FretFlow-back-upbestand.')
  }
  return parsed
}

/** Zet een back-up terug: vervangt voortgang en (optioneel) instellingen. */
export async function restoreBackup(backup: FretFlowBackup): Promise<void> {
  await db.importAllData(backup.data)
  if (backup.settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(backup.settings))
    } catch {
      // Instellingen niet kunnen schrijven — voortgang is wel hersteld.
    }
  }
}

/** Korte samenvatting van wat er in een back-up zit (voor de bevestiging). */
export function summarizeBackup(backup: FretFlowBackup) {
  const d = backup.data
  return {
    activities: d.activities?.length ?? 0,
    records: d.records?.length ?? 0,
    templates: d.templates?.length ?? 0,
    patterns: d.customPatterns?.length ?? 0,
    chords: d.customChords?.length ?? 0,
  }
}
