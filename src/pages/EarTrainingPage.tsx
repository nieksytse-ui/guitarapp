import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Ear, Play, RotateCcw, X } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAudio } from '@/hooks/useAudio'
import { playChord, playSequence } from '@/lib/audio/engine'
import { useAward } from '@/hooks/useAward'
import { XP_REWARDS } from '@/lib/xp'
import {
  CHORD_PRESETS,
  EAR_CHORD_TYPES,
  EAR_INTERVALS,
  INTERVAL_PRESETS,
  makeChordQuestion,
  makeIntervalQuestion,
  type ChordQuestion,
  type IntervalQuestion,
} from '@/lib/earTraining'
import { cn } from '@/lib/utils'

type Mode = 'interval' | 'chord'
type Difficulty = 'makkelijk' | 'gemiddeld' | 'moeilijk'
type Question = IntervalQuestion | ChordQuestion

export default function EarTrainingPage() {
  const { ready } = useAudio()
  const award = useAward()

  const [mode, setMode] = useState<Mode>('interval')
  const [difficulty, setDifficulty] = useState<Difficulty>('makkelijk')
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [streak, setStreak] = useState(0)

  // Antwoordopties op basis van modus + moeilijkheid.
  const intervalOptions = EAR_INTERVALS.filter((i) =>
    INTERVAL_PRESETS[difficulty].includes(i.semitones),
  )
  const chordOptions = EAR_CHORD_TYPES.filter((c) => CHORD_PRESETS[difficulty].includes(c.suffix))

  const playQuestion = useCallback(async (q: Question) => {
    await ready()
    if (q.kind === 'interval') {
      playSequence(q.notes, { interval: 0.55, duration: '4n' })
    } else {
      playChord(q.notes, '1n')
    }
  }, [ready])

  const nextQuestion = useCallback(async () => {
    const q =
      mode === 'interval'
        ? makeIntervalQuestion(INTERVAL_PRESETS[difficulty])
        : makeChordQuestion(CHORD_PRESETS[difficulty])
    setQuestion(q)
    setAnswer(null)
    await playQuestion(q)
  }, [mode, difficulty, playQuestion])

  // Reset de sessie wanneer modus of moeilijkheid verandert.
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setQuestion(null)
    setAnswer(null)
    setScore(0)
    setTotal(0)
    setStreak(0)
  }, [mode, difficulty])

  const choose = (label: string) => {
    if (answer !== null || !question) return
    setAnswer(label)
    setTotal((t) => t + 1)
    const correct = label === question.label
    if (correct) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      void award({
        type: 'ear-training',
        title: 'Gehoortraining: goed!',
        xp: XP_REWARDS.earCorrect,
        durationSec: 10,
        silent: true,
        meta: { mode, difficulty },
      })
    } else {
      setStreak(0)
    }
  }

  const isCorrect = (label: string) => question && label === question.label
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gehoortraining"
        description="Herken intervallen en akkoorden op gehoor. Stel de moeilijkheid in en bouw een reeks goede antwoorden op."
        icon={<Ear className="h-5 w-5" />}
      />

      {/* Instellingen */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList>
              <TabsTrigger value="interval">Intervallen</TabsTrigger>
              <TabsTrigger value="chord">Akkoorden</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex overflow-hidden rounded-lg border border-border">
            {(['makkelijk', 'gemiddeld', 'moeilijk'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  'px-3 py-2 text-sm font-medium capitalize transition-colors',
                  difficulty === d ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-primary">{score}/{total}</p>
            <p className="text-xs text-muted-foreground">goed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">nauwkeurigheid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-amber-foreground dark:text-amber">{streak}</p>
            <p className="text-xs text-muted-foreground">reeks</p>
          </CardContent>
        </Card>
      </div>

      {/* Speelvlak */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {mode === 'interval' ? 'Welk interval hoor je?' : 'Welk akkoord hoor je?'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {!question ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-sm text-muted-foreground">
                Klik op start om je eerste {mode === 'interval' ? 'interval' : 'akkoord'} te horen.
              </p>
              <Button size="lg" onClick={nextQuestion}>
                <Play className="h-5 w-5" /> Start
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => playQuestion(question)}>
                  <Play className="h-4 w-4" /> Speel nogmaals
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(mode === 'interval' ? intervalOptions : chordOptions).map((opt) => {
                  const label = opt.label
                  const reveal = answer !== null
                  const correct = isCorrect(label)
                  const chosen = answer === label
                  return (
                    <button
                      key={label}
                      onClick={() => choose(label)}
                      disabled={reveal}
                      className={cn(
                        'flex items-center justify-between rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all',
                        !reveal && 'border-border hover:border-primary/60 hover:bg-accent',
                        reveal && correct && 'border-emerald-500 bg-emerald-500/10',
                        reveal && chosen && !correct && 'border-destructive bg-destructive/10',
                        reveal && !correct && !chosen && 'opacity-50',
                      )}
                    >
                      {label}
                      {reveal && correct && <Check className="h-4 w-4 text-emerald-500" />}
                      {reveal && chosen && !correct && <X className="h-4 w-4 text-destructive" />}
                    </button>
                  )
                })}
              </div>

              {answer !== null && (
                <div className="flex flex-col items-center gap-3 border-t border-border/60 pt-4">
                  <Badge variant={answer === question.label ? 'success' : 'muted'}>
                    {answer === question.label
                      ? 'Correct!'
                      : `Het juiste antwoord was: ${question.label}`}
                  </Badge>
                  <Button onClick={nextQuestion}>
                    <RotateCcw className="h-4 w-4" /> Volgende
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
