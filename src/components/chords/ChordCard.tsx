import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { ChordShape } from '@/lib/types'
import { ChordDiagram } from '@/components/ChordDiagram'
import { Badge } from '@/components/ui/badge'
import { useAudio } from '@/hooks/useAudio'
import { strumChord } from '@/lib/audio/engine'
import { CHORD_TYPE_LABELS } from '@/data/chords'
import { cn } from '@/lib/utils'

interface ChordCardProps {
  chord: ChordShape
  onClick?: (chord: ChordShape) => void
  showType?: boolean
  className?: string
}

/** Compacte, klikbare akkoordkaart met diagram en snelle 'beluister'-knop. */
export function ChordCard({ chord, onClick, showType = true, className }: ChordCardProps) {
  const { ready } = useAudio()
  const [playing, setPlaying] = useState(false)

  const play = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await ready()
    setPlaying(true)
    strumChord(chord.notes, { duration: '2n' })
    setTimeout(() => setPlaying(false), 600)
  }

  return (
    <div
      onClick={() => onClick?.(chord)}
      className={cn(
        'group relative flex flex-col items-center rounded-xl border border-border/70 bg-card p-3 transition-all',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-soft',
        className,
      )}
    >
      <div className="mb-1 flex w-full items-center justify-between">
        <span className="font-bold">{chord.name}</span>
        <button
          onClick={play}
          aria-label={`Speel ${chord.display}`}
          className={cn(
            'grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary',
            playing && 'animate-pulse-beat text-primary',
          )}
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </div>

      <div className="h-36 w-full px-1">
        <ChordDiagram chord={chord} showTuning={false} />
      </div>

      {showType && (
        <Badge variant="muted" className="mt-2">
          {CHORD_TYPE_LABELS[chord.type]}
        </Badge>
      )}
    </div>
  )
}
