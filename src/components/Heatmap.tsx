import { useMemo } from 'react'
import { buildHeatmap, toDateKey } from '@/lib/xp'
import type { Activity } from '@/lib/types'
import { cn } from '@/lib/utils'

const WEEKS = 53
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const WEEKDAYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

function startOfWeekMonday(d: Date): Date {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7 // 0 = maandag
  date.setDate(date.getDate() - day)
  date.setHours(0, 0, 0, 0)
  return date
}

function intensityClass(xp: number): string {
  if (xp <= 0) return 'bg-muted/70'
  if (xp < 15) return 'bg-primary/30'
  if (xp < 35) return 'bg-primary/50'
  if (xp < 70) return 'bg-primary/75'
  return 'bg-primary'
}

/** GitHub-contributions-stijl kalender op basis van XP per dag. */
export function Heatmap({ activities }: { activities: Activity[] }) {
  const map = useMemo(() => buildHeatmap(activities), [activities])

  const { weeks, monthLabels, todayKey } = useMemo(() => {
    const today = new Date()
    const todayKey = toDateKey(today)
    const startWeek = startOfWeekMonday(today)
    startWeek.setDate(startWeek.getDate() - (WEEKS - 1) * 7)

    const weeks: Date[][] = []
    const monthLabels: { col: number; label: string }[] = []
    let lastMonth = -1

    for (let w = 0; w < WEEKS; w++) {
      const col: Date[] = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(startWeek)
        date.setDate(startWeek.getDate() + w * 7 + d)
        col.push(date)
      }
      const m = col[0].getMonth()
      if (m !== lastMonth) {
        monthLabels.push({ col: w, label: MONTHS[m] })
        lastMonth = m
      }
      weeks.push(col)
    }
    return { weeks, monthLabels, todayKey }
  }, [])

  const monthByCol = new Map(monthLabels.map((m) => [m.col, m.label]))

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="inline-flex flex-col gap-1.5">
        {/* Maandlabels */}
        <div className="flex gap-1 pl-7">
          {weeks.map((_, w) => (
            <div key={w} className="w-3 text-[10px] text-muted-foreground">
              {monthByCol.get(w) ?? ''}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Weekdaglabels */}
          <div className="flex flex-col gap-1 pr-1 text-[10px] text-muted-foreground">
            {WEEKDAYS.map((wd, i) => (
              <div key={wd} className="flex h-3 items-center">
                {i % 2 === 0 ? wd : ''}
              </div>
            ))}
          </div>

          {/* Weken */}
          {weeks.map((week, w) => (
            <div key={w} className="flex flex-col gap-1">
              {week.map((day) => {
                const key = toDateKey(day)
                const entry = map.get(key)
                const isFuture = key > todayKey
                const xp = entry?.xp ?? 0
                return (
                  <div
                    key={key}
                    title={
                      isFuture
                        ? ''
                        : `${key} · ${entry?.count ?? 0} activiteit(en) · ${xp} XP`
                    }
                    className={cn(
                      'h-3 w-3 rounded-[3px] ring-1 ring-inset ring-black/5 transition-colors dark:ring-white/5',
                      isFuture ? 'bg-transparent ring-transparent' : intensityClass(xp),
                      key === todayKey && 'ring-2 ring-primary',
                    )}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px] text-muted-foreground">
          <span>minder</span>
          <span className="h-3 w-3 rounded-[3px] bg-muted/70" />
          <span className="h-3 w-3 rounded-[3px] bg-primary/30" />
          <span className="h-3 w-3 rounded-[3px] bg-primary/50" />
          <span className="h-3 w-3 rounded-[3px] bg-primary/75" />
          <span className="h-3 w-3 rounded-[3px] bg-primary" />
          <span>meer</span>
        </div>
      </div>
    </div>
  )
}
