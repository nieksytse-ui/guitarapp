import { useMemo, useState } from 'react'
import { Dumbbell, Library, Music, Search, X } from 'lucide-react'
import type { ChordShape, ChordType, Difficulty } from '@/lib/types'
import { PageHeader } from '@/components/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChordCard } from '@/components/chords/ChordCard'
import { ChordDetailDialog } from '@/components/chords/ChordDetailDialog'
import { ChordTrainer } from '@/components/chords/ChordTrainer'
import { CHORDS, CHORD_TYPE_LABELS, DIFFICULTY_LABELS } from '@/data/chords'

const ALL = 'all'

export default function ChordsPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<ChordType | typeof ALL>(ALL)
  const [difficulty, setDifficulty] = useState<Difficulty | typeof ALL>(ALL)
  const [selected, setSelected] = useState<ChordShape | null>(null)
  const [open, setOpen] = useState(false)

  const typesInData = useMemo(
    () => Array.from(new Set(CHORDS.map((c) => c.type))),
    [],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CHORDS.filter((c) => {
      if (type !== ALL && c.type !== type) return false
      if (difficulty !== ALL && c.difficulty !== difficulty) return false
      if (q && !c.name.toLowerCase().includes(q) && !c.display.toLowerCase().includes(q))
        return false
      return true
    })
  }, [query, type, difficulty])

  const openChord = (chord: ChordShape) => {
    setSelected(chord)
    setOpen(true)
  }

  const hasFilters = query || type !== ALL || difficulty !== ALL
  const clearFilters = () => {
    setQuery('')
    setType(ALL)
    setDifficulty(ALL)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Akkoorden"
        description="Blader door akkoorden of train je vingerzetting op de hals."
        icon={<Music className="h-5 w-5" />}
      />

      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">
            <Library className="h-4 w-4" /> Bibliotheek
          </TabsTrigger>
          <TabsTrigger value="trainer">
            <Dumbbell className="h-4 w-4" /> Trainer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek op naam (bijv. Am, G7, sus)…"
                className="pl-9"
                aria-label="Zoek akkoorden"
              />
            </div>

            <Select value={type} onValueChange={(v) => setType(v as ChordType | typeof ALL)}>
              <SelectTrigger className="w-full sm:w-44" aria-label="Filter op type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Alle types</SelectItem>
                {typesInData.map((t) => (
                  <SelectItem key={t} value={t}>
                    {CHORD_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as Difficulty | typeof ALL)}
            >
              <SelectTrigger className="w-full sm:w-40" aria-label="Filter op moeilijkheid">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Alle niveaus</SelectItem>
                <SelectItem value="beginner">{DIFFICULTY_LABELS.beginner}</SelectItem>
                <SelectItem value="gemiddeld">{DIFFICULTY_LABELS.gemiddeld}</SelectItem>
                <SelectItem value="gevorderd">{DIFFICULTY_LABELS.gevorderd}</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters} aria-label="Wis filters">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {filtered.length} akkoord{filtered.length === 1 ? '' : 'en'} gevonden
          </p>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              Geen akkoorden gevonden. Pas je zoekterm of filters aan.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((chord) => (
                <ChordCard key={chord.id} chord={chord} onClick={openChord} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trainer">
          <ChordTrainer />
        </TabsContent>
      </Tabs>

      <ChordDetailDialog chord={selected} open={open} onOpenChange={setOpen} />
    </div>
  )
}
