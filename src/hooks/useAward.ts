import { useProgressStore } from '@/store/useProgressStore'
import { xpToast } from '@/store/useToastStore'
import type { Activity } from '@/lib/types'

type AwardInput = Omit<Activity, 'id' | 'date'> & { date?: string; silent?: boolean }

/**
 * Logt een voltooide activiteit én toont (optioneel) een XP-melding.
 * Gebruikt door alle oefenmodules zodat XP/streaks consistent worden bijgewerkt.
 */
export function useAward() {
  const logActivity = useProgressStore((s) => s.logActivity)

  return async ({ silent, ...activity }: AwardInput) => {
    const result = await logActivity(activity)
    if (!silent && activity.xp > 0) {
      xpToast(activity.xp, activity.title)
    }
    return result
  }
}
