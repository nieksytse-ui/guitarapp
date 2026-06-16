import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Repeat, RotateCcw, Timer, Trophy } from 'lucide-react'
import type { ChordShape } from '@/lib/types'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ChordDiagram } from '@/components/ChordDiagram'
import { CircularTimer } from '@/components/CircularTimer'
import { LineChart, type LinePoint } from '@/components/LineChart'
import { CHORDS, CHORD_BY_ID } from '@/data/chords'
import { useProgressStore, comboKey } from '@/store/useProgressStore'
import { useAward } from '@/hooks/useAward'
import { XP_REWARDS } from '@/lib/xp'
import { toast } from '@/store/useToastStore'
import { cn } from '@/lib/utils'

type Phase = 'setup' | 'running' | 'input' | 'result'
const ROUND_SECONDS = 60

// Veelgebruikte akkoorden bovenaan voor snelle selectie.
const PICKABLE = CHORDS.filter((c) =>
  ['G', 'C', 'D', 'A', 'E', 'Em', 'Am', 'Dm', 'F', 'Bm', 'G7', 'C7', 'D7', 'A7', 'E7', 'Cadd9', 'Dsus4', 'Asus2'].includes(
    c.id,
  ),
)

export default function ChordChangePage() {
  const records = useProgressStore((s) => s.records)
  const submitChordChange = useProgressStore((s) => s.submitChordChange)
  const award = useAward()

  const [phase, setPhase] = useState<Phase>('setup')
  const [selectedIds, setSelectedIds] = useState<string[]>(['G', 'C'])
  const [remaining, setRemaining] = useState(ROUND_SECONDS)
  const [liveCount, setLiveCount] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [inputCount, setInputCount] = useState(0)
  const [result, setResult] = useState<{ count: number; isRecord: boolean; best: number } | null>(
    null,
  )

  const selected = useMemo(
    () => selectedIds.map((id) => CHORD_BY_ID.get(id)).filter(Boolean) as ChordShape[],
    [selectedIds],
  )

  const currentCombo = comboKey(selectedIds)
  const existingRecord = records[currentCombo]

  const toggleChord = (id: string) => {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : ids.length < 4 ? [...ids, id] : ids,
    )
  }

  // --- Timer tijdens de ronde ----------------------------------------------
  useEffect(() => {
    if (phase !== 'running') return
    if (remaining <= 0) {
      setInputCount(liveCount)
      setPhase('input')
      return
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, remaining, liveCount])

  const registerChange = useCallback(() => {
    setLiveCount((c) => c + 1)
    setActiveIndex((i) => (i + 1) % Math.max(1, selectedIds.length))
  }, [selectedIds.length])

  // Spatiebalk / Enter = wissel tellen tijdens de ronde.
  useEffect(() => {
    if (phase !== 'running') return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        registerChange()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, registerChange])

  const startRound = () => {
    if (selected.length < 2) return
    setRemaining(ROUND_SECONDS)
    setLiveCount(0)
    setActiveIndex(0)
    setPhase('running')
  }

  const stopEarly = () => {
    setInputCount(liveCount)
    setPhase('input')
  }

  const saveResult = async () => {
    const count = Math.max(0, Math.round(inputCount))
    const { isRecord, record } = await submitChordChange(selectedIds, count)
    setResult({ count, isRecord, best: record.best })
    await award({
      type: 'chord-change',
      title: `Wissels: ${selectedIds.join(' ↔ ')}`,
      xp: XP_REWARDS.chordChangeRound + (isRecord ? XP_REWARDS.chordChangeRecordBonus : 0),
      durationSec: ROUND_SECONDS,
      meta: { combo: currentCombo, count },
    })
    if (isRecord) {
      toast({ title: 'Nieuw record! 🎉', description: `${count} wissels in 60 seconden`, variant: 'success' })
    }
    setPhase('result')
  }

  const historyPoints: LinePoint[] = useMemo(() => {
    const rec = records[currentCombo]
    if (!rec) return []
    return rec.history.map((h) => ({
      label: new Date(h.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
      value: h.count,
    }))
  }, [records, currentCombo])

  // Lijst met bestaande records (gesorteerd op beste score).
  const recordList = useMemo(
    () => Object.values(records).sort((a, b) => b.best - a.best),
    [records],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Akkoordwissel-trainer"
        description="Kies 2 tot 4 akkoorden en wissel zo vaak mogelijk in 60 seconden. Tel mee met spatie of de knop."
        icon={<Repeat className="h-5 w-5" />}
      />

      {/* SETUP */}
      {phase === 'setup' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kies je akkoorden ({selected.length}/4)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {PICKABLE.map((c) => {
                  const on = selectedIds.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleChord(c.id)}
                      className={cn(
                        'min-w-14 rounded-lg border-2 px-3 py-2 text-sm font-bold transition-all',
                        on
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50',
                      )}
                    >
                      {c.name}
                    </button>
                  )
                })}
              </div>

              {selected.length >= 2 ? (
                <div className="flex flex-wrap items-center gap-4 rounded-xl bg-muted/40 p-4">
                  {selected.map((c) => (
                    <div key={c.id} className="h-28 w-24">
                      <ChordDiagram chord={c} showTuning={false} showFingers />
                    </div>
                  ))}
                  {existingRecord && (
                    <div className="ml-auto text-right">
                      <p className="text-xs text-muted-foreground">Jouw record</p>
                      <p className="text-2xl font-extrabold text-amber-foreground dark:text-amber">
                        {existingRecord.best}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Kies minstens 2 akkoorden om te starten.</p>
              )}

              <Button size="lg" onClick={startRound} disabled={selected.length < 2} className="w-full sm:w-auto">
                <Timer className="h-5 w-5" /> Start 60 seconden
              </Button>
            </CardContent>
          </Card>

          {recordList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4" /> Persoonlijke records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border/60">
                  {recordList.slice(0, 8).map((r) => (
                    <li key={r.combo} className="flex items-center justify-between py-2">
                      <span className="font-medium">{r.chords.join(' ↔ ')}</span>
                      <Badge variant="amber">{r.best} wissels</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* RUNNING */}
      {phase === 'running' && (
        <Card>
          <CardContent className="flex flex-col items-center gap-6 p-6">
            <CircularTimer remaining={remaining} total={ROUND_SECONDS}>
              <div className="text-center">
                <p className="text-5xl font-extrabold tabular-nums">{remaining}</p>
                <p className="text-xs text-muted-foreground">seconden</p>
              </div>
            </CircularTimer>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {selected.map((c, i) => (
                <div
                  key={c.id}
                  className={cn(
                    'rounded-xl border-2 p-2 transition-all',
                    activeIndex === i
                      ? 'scale-105 border-primary bg-primary/10 shadow-soft'
                      : 'border-transparent opacity-70',
                  )}
                >
                  <div className="h-28 w-24">
                    <ChordDiagram chord={c} showTuning={false} showFingers />
                  </div>
                  <p className="mt-1 text-center text-sm font-bold">{c.name}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Getelde wissels</p>
              <p className="text-4xl font-extrabold text-primary tabular-nums">{liveCount}</p>
            </div>

            <Button size="lg" onClick={registerChange} className="h-16 w-full max-w-sm text-lg">
              Wissel! <span className="ml-2 text-sm opacity-80">(of spatie)</span>
            </Button>
            <Button variant="ghost" onClick={stopEarly}>
              Eerder stoppen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* INPUT */}
      {phase === 'input' && (
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-base">Hoeveel wissels heb je gehaald?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-center text-sm text-muted-foreground">
              We telden <span className="font-semibold text-foreground">{liveCount}</span> tikken.
              Pas het getal aan als dat nodig is.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setInputCount((c) => Math.max(0, c - 1))}
              >
                −
              </Button>
              <Input
                type="number"
                min={0}
                value={inputCount}
                onChange={(e) => setInputCount(Number(e.target.value))}
                className="h-14 w-28 text-center text-2xl font-bold"
              />
              <Button variant="outline" size="icon" onClick={() => setInputCount((c) => c + 1)}>
                +
              </Button>
            </div>
            <Button size="lg" onClick={saveResult} className="w-full">
              Opslaan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* RESULT */}
      {phase === 'result' && result && (
        <div className="space-y-6">
          <Card className={cn('mx-auto max-w-md', result.isRecord && 'border-amber/50')}>
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              {result.isRecord && <Trophy className="h-10 w-10 text-amber" />}
              <p className="text-sm text-muted-foreground">
                {result.isRecord ? 'Nieuw persoonlijk record!' : 'Goed gedaan!'}
              </p>
              <p className="text-6xl font-extrabold text-primary">{result.count}</p>
              <p className="text-sm text-muted-foreground">
                wissels tussen {selected.map((c) => c.name).join(' ↔ ')}
              </p>
              {!result.isRecord && (
                <Badge variant="muted">Jouw record: {result.best}</Badge>
              )}
              <div className="mt-2 flex gap-2">
                <Button onClick={startRound}>
                  <RotateCcw className="h-4 w-4" /> Nog een ronde
                </Button>
                <Button variant="outline" onClick={() => setPhase('setup')}>
                  Andere akkoorden
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Voortgang over tijd</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={historyPoints} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
