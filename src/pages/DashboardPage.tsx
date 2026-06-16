import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Flame,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Heatmap } from '@/components/Heatmap'
import { modules } from '@/config/navigation'
import { useProgressStore } from '@/store/useProgressStore'
import {
  buildHeatmap,
  computeLongestStreak,
  computeStreak,
  getLevelInfo,
  toDateKey,
  totalXpOf,
} from '@/lib/xp'
import { cn, formatTime } from '@/lib/utils'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 6) return 'Goedenacht'
  if (h < 12) return 'Goedemorgen'
  if (h < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

function rankTitle(level: number): string {
  if (level >= 12) return 'Gitaarheld'
  if (level >= 8) return 'Gevorderd'
  if (level >= 5) return 'Leerling-gevorderd'
  if (level >= 3) return 'Leerling'
  return 'Beginner'
}

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn('grid h-10 w-10 place-items-center rounded-xl', accent ?? 'bg-primary/10 text-primary')}>
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const activities = useProgressStore((s) => s.activities)

  const totalXp = totalXpOf(activities)
  const info = getLevelInfo(totalXp)
  const streak = computeStreak(activities.map((a) => toDateKey(a.date)))
  const longest = computeLongestStreak(activities.map((a) => toDateKey(a.date)))
  const heatmap = buildHeatmap(activities)
  const todayXp = heatmap.get(toDateKey(new Date()))?.xp ?? 0
  const totalMinutes = Math.round(activities.reduce((s, a) => s + a.durationSec, 0) / 60)

  const achievements = [
    { id: 'first', label: 'Eerste stap', icon: <Star className="h-4 w-4" />, earned: activities.length > 0 },
    { id: 'streak3', label: '3-daagse streak', icon: <Flame className="h-4 w-4" />, earned: longest >= 3 },
    { id: 'streak7', label: 'Weekstreak', icon: <Flame className="h-4 w-4" />, earned: longest >= 7 },
    { id: 'lvl5', label: 'Level 5', icon: <Trophy className="h-4 w-4" />, earned: info.level >= 5 },
    { id: 'xp1000', label: '1000 XP', icon: <Zap className="h-4 w-4" />, earned: totalXp >= 1000 },
  ]

  const recent = [...activities].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Hero */}
      <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/15 via-card to-amber/10">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{greeting()} 👋</p>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Klaar om te oefenen?
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Level {info.level} · {rankTitle(info.level)}
              </Badge>
              <Badge variant="amber" className="gap-1">
                <Flame className="h-3.5 w-3.5 text-amber" /> {streak} dag{streak === 1 ? '' : 'en'} streak
              </Badge>
              {todayXp > 0 && (
                <Badge variant="success" className="gap-1">
                  +{todayXp} XP vandaag
                </Badge>
              )}
            </div>
          </div>

          <div className="w-full max-w-xs shrink-0 rounded-2xl bg-card/70 p-4 backdrop-blur">
            <div className="mb-1 flex items-end justify-between">
              <span className="text-sm font-semibold">Level {info.level}</span>
              <span className="text-xs text-muted-foreground">{totalXp} XP totaal</span>
            </div>
            <Progress value={info.ratio * 100} />
            <p className="mt-2 text-xs text-muted-foreground">
              Nog <span className="font-semibold text-foreground">{info.remaining} XP</span> tot level{' '}
              {info.level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stat-tegels */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile icon={<Zap className="h-5 w-5" />} label="Totale XP" value={`${totalXp}`} />
        <StatTile
          icon={<Flame className="h-5 w-5" />}
          label="Huidige streak"
          value={`${streak} dag${streak === 1 ? '' : 'en'}`}
          accent="bg-amber/15 text-amber"
        />
        <StatTile
          icon={<Clock className="h-5 w-5" />}
          label="Geoefend"
          value={formatTime(totalMinutes * 60)}
          accent="bg-emerald-500/15 text-emerald-500"
        />
        <StatTile
          icon={<Target className="h-5 w-5" />}
          label="Activiteiten"
          value={`${activities.length}`}
          accent="bg-sky-500/15 text-sky-500"
        />
      </div>

      {/* Modules */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Oefenmodules</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link key={m.to} to={m.to} className="group">
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-soft">
                <CardContent className="flex h-full items-start gap-4 p-5">
                  <div
                    className={cn(
                      'grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-soft',
                      m.accent,
                    )}
                  >
                    <m.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold">{m.label}</h3>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kalender */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" /> Oefenkalender
            </CardTitle>
            <span className="text-xs text-muted-foreground">Langste streak: {longest} dagen</span>
          </CardHeader>
          <CardContent>
            <Heatmap activities={activities} />
          </CardContent>
        </Card>

        {/* Prestaties + recent */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4" /> Prestaties
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {achievements.map((a) => (
                <span
                  key={a.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
                    a.earned
                      ? 'bg-amber/15 text-amber-foreground dark:text-amber'
                      : 'bg-muted text-muted-foreground opacity-60',
                  )}
                  title={a.earned ? 'Behaald!' : 'Nog te behalen'}
                >
                  {a.icon}
                  {a.label}
                </span>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent</CardTitle>
            </CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nog niets geoefend. Kies een module en verdien je eerste XP! 🚀
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {recent.map((a, i) => (
                    <li key={a.id ?? i} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{a.title}</span>
                      <span className="shrink-0 font-semibold text-primary">+{a.xp}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
