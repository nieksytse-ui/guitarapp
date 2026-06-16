import { useState } from 'react'
import { Guitar, Music, Volume2 } from 'lucide-react'
import type { ChordShape } from '@/lib/types'
import { ChordDiagram } from '@/components/ChordDiagram'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAudio } from '@/hooks/useAudio'
import { playChord, strumChord } from '@/lib/audio/engine'
import { useAward } from '@/hooks/useAward'
import { XP_REWARDS } from '@/lib/xp'
import { CHORD_TYPE_LABELS, DIFFICULTY_LABELS } from '@/data/chords'

interface ChordDetailDialogProps {
  chord: ChordShape | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Detailweergave van één akkoord: groot diagram, noten en afspeelopties. */
export function ChordDetailDialog({ chord, open, onOpenChange }: ChordDetailDialogProps) {
  const { ready } = useAudio()
  const award = useAward()
  const [practiced, setPracticed] = useState(false)

  if (!chord) return null

  const handleStrum = async (up = false) => {
    await ready()
    strumChord(chord.notes, { up, duration: '2n' })
    markPracticed()
  }

  const handleBlock = async () => {
    await ready()
    playChord(chord.notes, '1n')
    markPracticed()
  }

  // Geef eenmalig per opening een beetje XP voor het oefenen/beluisteren.
  const markPracticed = () => {
    if (practiced) return
    setPracticed(true)
    void award({
      type: 'chord-practice',
      title: `${chord.name} geoefend`,
      xp: XP_REWARDS.chordPracticed,
      durationSec: 20,
      meta: { chord: chord.id },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setPracticed(false)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl font-extrabold">{chord.name}</span>
            <span className="text-base font-normal text-muted-foreground">{chord.display}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Badge>{CHORD_TYPE_LABELS[chord.type]}</Badge>
          <Badge variant="secondary">{DIFFICULTY_LABELS[chord.difficulty]}</Badge>
          <Badge variant="muted">grondtoon {chord.root}</Badge>
        </div>

        <div className="mx-auto h-64 w-full max-w-[280px]">
          <ChordDiagram chord={chord} />
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">Noten</p>
          <div className="flex flex-wrap gap-1.5">
            {chord.notes.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="rounded-md bg-secondary px-2 py-1 text-sm font-semibold"
              >
                {n.replace(/\d+$/, '')}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={() => handleStrum(false)}>
            <Guitar className="h-4 w-4" /> ↓ Aanslag
          </Button>
          <Button variant="outline" onClick={() => handleStrum(true)}>
            <Guitar className="h-4 w-4" /> ↑ Aanslag
          </Button>
          <Button variant="outline" onClick={handleBlock}>
            <Volume2 className="h-4 w-4" /> Akkoord
          </Button>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Music className="h-3.5 w-3.5" /> Tip: vergelijk de ↓ en ↑ aanslag met het volledige akkoord.
        </p>
      </DialogContent>
    </Dialog>
  )
}
