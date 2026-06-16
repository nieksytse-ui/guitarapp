import { useState } from 'react'
import { Check, ChevronRight, RotateCcw, Trophy, X } from 'lucide-react'
import type { QuizQuestion } from '@/data/theoryStages'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface QuizProps {
  questions: QuizQuestion[]
  onCorrect?: () => void
  onComplete?: (score: number, total: number) => void
}

/** Interactieve quiz: één vraag tegelijk, met directe feedback en uitleg. */
export function Quiz({ questions, onCorrect, onComplete }: QuizProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[index]
  const isLast = index === questions.length - 1

  const choose = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === q.correctIndex) {
      setScore((s) => s + 1)
      onCorrect?.()
    }
  }

  const next = () => {
    if (isLast) {
      setDone(true)
      onComplete?.(score, questions.length)
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
    }
  }

  const restart = () => {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setDone(false)
  }

  if (done) {
    const perfect = score === questions.length
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Trophy className={cn('h-10 w-10', perfect ? 'text-amber' : 'text-primary')} />
        <p className="text-lg font-bold">
          {score} / {questions.length} goed
        </p>
        <p className="text-sm text-muted-foreground">
          {perfect ? 'Perfect! Je beheerst deze stof.' : 'Goed bezig — herhaal gerust om te oefenen.'}
        </p>
        <Button variant="outline" onClick={restart}>
          <RotateCcw className="h-4 w-4" /> Opnieuw
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Vraag {index + 1} van {questions.length}
        </span>
        <span>Score: {score}</span>
      </div>
      <Progress value={((index + (selected !== null ? 1 : 0)) / questions.length) * 100} className="h-1.5" />

      <p className="text-base font-semibold">{q.question}</p>

      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex
          const isChosen = i === selected
          const reveal = selected !== null
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={reveal}
              className={cn(
                'flex items-center justify-between rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all',
                !reveal && 'border-border hover:border-primary/60 hover:bg-accent',
                reveal && isCorrect && 'border-emerald-500 bg-emerald-500/10',
                reveal && isChosen && !isCorrect && 'border-destructive bg-destructive/10',
                reveal && !isCorrect && !isChosen && 'border-border opacity-60',
              )}
            >
              {opt}
              {reveal && isCorrect && <Check className="h-4 w-4 text-emerald-500" />}
              {reveal && isChosen && !isCorrect && <X className="h-4 w-4 text-destructive" />}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <div className="animate-fade-in rounded-lg bg-muted/60 p-3 text-sm">
          <p className="text-muted-foreground">{q.explanation}</p>
          <Button onClick={next} className="mt-3" size="sm">
            {isLast ? 'Afronden' : 'Volgende'} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
