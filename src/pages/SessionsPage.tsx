import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ListChecks,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  SkipForward,
  Trash2,
} from 'lucide-react'
import type { BlockModule, SessionBlock, SessionTemplate } from '@/lib/types'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CircularTimer } from '@/components/CircularTimer'
import { useAward } from '@/hooks/useAward'
import { toast } from '@/store/useToastStore'
import { XP_REWARDS } from '@/lib/xp'
import { cn, uid } from '@/lib/utils'
import { click, initAudio, Tone } from '@/lib/audio/engine'
import { BLOCK_MODULES, BLOCK_MODULE_META, BUILTIN_TEMPLATES } from '@/data/sessionTemplates'
import {
  deleteTemplate as dbDeleteTemplate,
  getAllTemplates,
  putTemplate,
} from '@/lib/db/database'

function totalSeconds(blocks: SessionBlock[]): number {
  return blocks.reduce((n, b) => n + b.durationSec, 0)
}

function formatMMSS(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDuration(sec: number): string {
  const m = Math.round(sec / 60)
  return `${m} min`
}

export default function SessionsPage() {
  const [custom, setCustom] = useState<SessionTemplate[]>([])
  const [running, setRunning] = useState<SessionTemplate | null>(null)

  const reloadCustom = useCallback(async () => {
    setCustom(await getAllTemplates())
  }, [])

  useEffect(() => {
    void reloadCustom()
  }, [reloadCustom])

  if (running) {
    return <SessionRunner template={running} onExit={() => setRunning(null)} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Oefensessies"
        description="Stel je oefentijd slim in: blokken met een timer leiden je door de modules. Kies een sjabloon of bouw je eigen."
        icon={<ListChecks className="h-5 w-5" />}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Kant-en-klaar
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {BUILTIN_TEMPLATES.map((t) => (
            <TemplateCard key={t.id} template={t} onStart={() => setRunning(t)} />
          ))}
        </div>
      </section>

      {custom.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Mijn sessies
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {custom.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onStart={() => setRunning(t)}
                onDelete={async () => {
                  await dbDeleteTemplate(t.id)
                  await reloadCustom()
                }}
              />
            ))}
          </div>
        </section>
      )}

      <SessionBuilder onStart={setRunning} onSaved={reloadCustom} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sjabloonkaart
// ---------------------------------------------------------------------------

function TemplateCard({
  template,
  onStart,
  onDelete,
}: {
  template: SessionTemplate
  onStart: () => void
  onDelete?: () => void
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{template.name}</CardTitle>
          <Badge variant="muted">{formatDuration(totalSeconds(template.blocks))}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <ol className="space-y-1.5">
          {template.blocks.map((b, i) => {
            const meta = BLOCK_MODULE_META[b.module]
            const Icon = meta.icon
            return (
              <li key={b.id} className="flex items-center gap-2 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{b.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDuration(b.durationSec)}
                </span>
              </li>
            )
          })}
        </ol>
        <div className="mt-auto flex gap-2 pt-1">
          <Button onClick={onStart} className="flex-1">
            <Play className="h-4 w-4" /> Start
          </Button>
          {onDelete && (
            <Button variant="outline" size="icon" onClick={onDelete} aria-label="Verwijder sessie">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Sessie-builder
// ---------------------------------------------------------------------------

function newBlock(module: BlockModule = 'chord-change'): SessionBlock {
  return { id: uid(), module, title: BLOCK_MODULE_META[module].label, durationSec: 300 }
}

function SessionBuilder({
  onStart,
  onSaved,
}: {
  onStart: (t: SessionTemplate) => void
  onSaved: () => Promise<void> | void
}) {
  const [name, setName] = useState('Mijn sessie')
  const [blocks, setBlocks] = useState<SessionBlock[]>(() => [
    newBlock('chord-change'),
    newBlock('strumming'),
  ])

  const update = (id: string, patch: Partial<SessionBlock>) =>
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)))

  const remove = (id: string) => setBlocks((bs) => bs.filter((b) => b.id !== id))

  const move = (index: number, dir: -1 | 1) =>
    setBlocks((bs) => {
      const next = [...bs]
      const j = index + dir
      if (j < 0 || j >= next.length) return bs
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })

  const build = (): SessionTemplate => ({
    id: uid(),
    name: name.trim() || 'Mijn sessie',
    blocks,
  })

  const save = async () => {
    if (blocks.length === 0) return
    await putTemplate(build())
    await onSaved()
    toast({
      title: 'Sessie opgeslagen',
      description: `"${name.trim() || 'Mijn sessie'}" staat bij Mijn sessies.`,
      variant: 'success',
    })
  }

  const total = totalSeconds(blocks)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Plus className="h-4 w-4 text-primary" /> Eigen sessie samenstellen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="session-name">Naam</Label>
          <Input
            id="session-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="space-y-3">
          {blocks.map((b, i) => {
            const minutes = Math.max(1, Math.round(b.durationSec / 60))
            return (
              <div
                key={b.id}
                className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">#{i + 1}</span>
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Omhoog"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => move(i, 1)}
                      disabled={i === blocks.length - 1}
                      aria-label="Omlaag"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="min-w-[150px] flex-1 space-y-1">
                  <Label className="text-xs">Module</Label>
                  <Select
                    value={b.module}
                    onValueChange={(v) =>
                      update(b.id, {
                        module: v as BlockModule,
                        title: BLOCK_MODULE_META[v as BlockModule].label,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOCK_MODULES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {BLOCK_MODULE_META[m].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[150px] flex-[2] space-y-1">
                  <Label className="text-xs">Omschrijving</Label>
                  <Input value={b.title} onChange={(e) => update(b.id, { title: e.target.value })} />
                </div>

                <div className="w-24 space-y-1">
                  <Label className="text-xs">Minuten</Label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={minutes}
                    onChange={(e) =>
                      update(b.id, {
                        durationSec: Math.min(60, Math.max(1, Number(e.target.value) || 1)) * 60,
                      })
                    }
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(b.id)}
                  aria-label="Verwijder blok"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>

        <Button variant="outline" onClick={() => setBlocks((bs) => [...bs, newBlock()])}>
          <Plus className="h-4 w-4" /> Blok toevoegen
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">
            Totaal: <strong className="text-foreground">{formatDuration(total)}</strong> ·{' '}
            {blocks.length} blok{blocks.length === 1 ? '' : 'ken'}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={save} disabled={blocks.length === 0}>
              <Save className="h-4 w-4" /> Opslaan
            </Button>
            <Button onClick={() => onStart(build())} disabled={blocks.length === 0}>
              <Play className="h-4 w-4" /> Start nu
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Sessie afspelen (timer per blok)
// ---------------------------------------------------------------------------

function SessionRunner({ template, onExit }: { template: SessionTemplate; onExit: () => void }) {
  const award = useAward()
  const blocks = template.blocks

  const [index, setIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(blocks[0]?.durationSec ?? 0)
  const [status, setStatus] = useState<'running' | 'paused' | 'done'>('running')
  const awarded = useRef<Set<string>>(new Set())

  const block = blocks[index]
  const meta = block ? BLOCK_MODULE_META[block.module] : undefined

  // Audio klaarzetten voor de overgangs-tik.
  useEffect(() => {
    void initAudio()
  }, [])

  const advance = useCallback(() => {
    setStatus((curStatus) => {
      if (curStatus === 'done') return curStatus

      // Beloon het zojuist afgeronde blok (één keer).
      const finished = blocks[index]
      if (finished && !awarded.current.has(finished.id)) {
        awarded.current.add(finished.id)
        void award({
          type: 'session',
          title: `Sessieblok: ${finished.title}`,
          xp: XP_REWARDS.sessionBlock,
          durationSec: finished.durationSec,
          meta: { module: finished.module, template: template.name },
        })
      }

      if (index < blocks.length - 1) {
        const next = index + 1
        setIndex(next)
        setSecondsLeft(blocks[next].durationSec)
        if (Tone.getContext().state === 'running') click(Tone.now() + 0.02, true)
        return 'running'
      }

      // Laatste blok afgerond → sessie compleet.
      if (!awarded.current.has('__complete__')) {
        awarded.current.add('__complete__')
        void award({
          type: 'session',
          title: `Sessie voltooid: ${template.name}`,
          xp: XP_REWARDS.sessionComplete,
          durationSec: 0,
          meta: { template: template.name, blocks: blocks.length },
        })
      }
      return 'done'
    })
  }, [award, blocks, index, template.name])

  // Houd de laatste advance vast voor de timer-afhandeling.
  const advanceRef = useRef(advance)
  useEffect(() => {
    advanceRef.current = advance
  }, [advance])

  // Aftellen.
  useEffect(() => {
    if (status !== 'running') return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [status, index])

  // Naar het volgende blok zodra de tijd op is.
  useEffect(() => {
    if (status === 'running' && secondsLeft === 0) advanceRef.current()
  }, [secondsLeft, status])

  const restart = () => {
    awarded.current = new Set()
    setIndex(0)
    setSecondsLeft(blocks[0]?.durationSec ?? 0)
    setStatus('running')
  }

  const openModule = () => {
    if (!meta?.route) return
    // Open de oefening in een nieuw tabblad zodat de sessietimer blijft lopen.
    window.open(`${window.location.origin}${window.location.pathname}#${meta.route}`, '_blank')
  }

  const elapsedBlocks = status === 'done' ? blocks.length : index
  const overallPct = Math.round((elapsedBlocks / blocks.length) * 100)

  if (status === 'done') {
    const earned = blocks.length * XP_REWARDS.sessionBlock + XP_REWARDS.sessionComplete
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={onExit} className="-ml-2">
          <ArrowLeft className="h-4 w-4" /> Terug naar sessies
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Check className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Sessie voltooid! 🎉</h2>
              <p className="mt-1 text-muted-foreground">
                Je hebt "{template.name}" helemaal doorlopen.
              </p>
            </div>
            <Badge variant="amber" className="text-sm">
              +{earned} XP verdiend
            </Badge>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" onClick={restart}>
                <RotateCcw className="h-4 w-4" /> Opnieuw
              </Button>
              <Button onClick={onExit}>Klaar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const Icon = meta?.icon ?? ListChecks

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit} className="-ml-2">
          <ArrowLeft className="h-4 w-4" /> Stop sessie
        </Button>
        <span className="text-sm text-muted-foreground">
          Blok {index + 1} / {blocks.length}
        </span>
      </div>

      <Progress value={overallPct} />

      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br text-white',
                meta?.accent,
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="text-center sm:text-left">
              <Badge variant="secondary">{meta?.label}</Badge>
            </div>
          </div>

          <h2 className="text-center text-2xl font-extrabold tracking-tight">{block?.title}</h2>
          {block?.note && (
            <p className="-mt-3 max-w-md text-center text-sm text-muted-foreground">{block.note}</p>
          )}

          <CircularTimer remaining={secondsLeft} total={block?.durationSec ?? 1}>
            <div className="text-center">
              <div className="text-4xl font-extrabold tabular-nums">{formatMMSS(secondsLeft)}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {status === 'paused' ? 'gepauzeerd' : 'resterend'}
              </div>
            </div>
          </CircularTimer>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              size="lg"
              onClick={() => setStatus((s) => (s === 'running' ? 'paused' : 'running'))}
            >
              {status === 'running' ? (
                <>
                  <Pause className="h-5 w-5" /> Pauze
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" /> Hervat
                </>
              )}
            </Button>

            {meta?.route && (
              <Button variant="outline" onClick={openModule}>
                <ExternalLink className="h-4 w-4" /> Open oefening
              </Button>
            )}

            <Button variant="outline" onClick={() => advance()}>
              {index < blocks.length - 1 ? (
                <>
                  <SkipForward className="h-4 w-4" /> Volgende
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Afronden
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bloklijst met voortgang */}
      <Card>
        <CardContent className="py-4">
          <ol className="space-y-1">
            {blocks.map((b, i) => {
              const done = i < index
              const current = i === index
              const Bi = BLOCK_MODULE_META[b.module].icon
              return (
                <li
                  key={b.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
                    current && 'bg-primary/10 font-semibold',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px]',
                      done
                        ? 'bg-emerald-500 text-white'
                        : current
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <Bi className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{b.title}</span>
                  {current && <ArrowRight className="h-4 w-4 text-primary" />}
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDuration(b.durationSec)}
                  </span>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
