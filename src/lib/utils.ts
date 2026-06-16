import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combineert Tailwind-klassen veilig (dedupe + conditioneel). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Maak een mm:ss-string van een aantal seconden. */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

/** Eenvoudige id-generator (voldoende voor lokale data). */
export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

/** Begrens een getal tussen min en max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
