import { Flame } from 'lucide-react'
import { useProgressStore } from '@/store/useProgressStore'
import { computeStreak, getLevelInfo, toDateKey, totalXpOf } from '@/lib/xp'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

/** Compacte XP/level/streak-weergave voor de sidebar. */
export function XpLevelCard({ className }: { className?: string }) {
  const activities = useProgressStore((s) => s.activities)
  const info = getLevelInfo(totalXpOf(activities))
  const streak = computeStreak(activities.map((a) => toDateKey(a.date)))

  return (
    <div className={cn('rounded-xl border border-border/70 bg-card/60 p-3', className)}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            {info.level}
          </span>
          <span className="text-sm font-semibold">Level {info.level}</span>
        </div>
        <span className="flex items-center gap-1 text-sm font-semibold text-amber-foreground dark:text-amber">
          <Flame className="h-4 w-4 text-amber" />
          {streak}
        </span>
      </div>
      <Progress value={info.ratio * 100} className="h-2" />
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Nog {info.remaining} XP tot level {info.level + 1}
      </p>
    </div>
  )
}
