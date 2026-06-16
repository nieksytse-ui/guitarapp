import { useState } from 'react'
import { ArrowLeft, BookOpen, ChevronRight, GraduationCap } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TheoryInteractive } from '@/components/theory/TheoryInteractive'
import { Quiz } from '@/components/theory/Quiz'
import { THEORY_STAGES, type TheoryStage } from '@/data/theoryStages'
import { useAward } from '@/hooks/useAward'
import { XP_REWARDS } from '@/lib/xp'
import { cn } from '@/lib/utils'

const LEVEL_VARIANT = {
  beginner: 'success',
  gemiddeld: 'amber',
  gevorderd: 'secondary',
} as const

export default function TheoryPage() {
  const [stage, setStage] = useState<TheoryStage | null>(null)
  const award = useAward()

  if (stage) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setStage(null)} className="-ml-2">
          <ArrowLeft className="h-4 w-4" /> Alle onderwerpen
        </Button>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant={LEVEL_VARIANT[stage.level]}>{stage.level}</Badge>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{stage.title}</h1>
          <p className="mt-1 text-muted-foreground">{stage.subtitle}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uitleg</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stage.intro.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Probeer het zelf</CardTitle>
          </CardHeader>
          <CardContent>
            <TheoryInteractive kind={stage.interactive} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4" /> Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Quiz
              questions={stage.quiz}
              onCorrect={() =>
                void award({
                  type: 'theory-quiz',
                  title: `Theorie: ${stage.title}`,
                  xp: XP_REWARDS.theoryQuizCorrect,
                  durationSec: 15,
                  silent: true,
                  meta: { stage: stage.id },
                })
              }
              onComplete={(score, total) =>
                void award({
                  type: 'theory-quiz',
                  title: `Quiz afgerond: ${stage.title}`,
                  xp: XP_REWARDS.theoryStageComplete,
                  durationSec: 30,
                  meta: { stage: stage.id, score, total },
                })
              }
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Muziektheorie"
        description="Van noten op de hals tot de cirkel van kwinten — met interactieve visualisaties en quizzes."
        icon={<BookOpen className="h-5 w-5" />}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {THEORY_STAGES.map((s, i) => (
          <button key={s.id} onClick={() => setStage(s)} className="group text-left">
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <CardContent className="flex items-start gap-4 p-5">
                <div
                  className={cn(
                    'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg font-extrabold',
                    'bg-primary/10 text-primary',
                  )}
                >
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{s.title}</h3>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{s.subtitle}</p>
                  <Badge variant={LEVEL_VARIANT[s.level]} className="mt-2">
                    {s.level}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
