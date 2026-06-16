import { useEffect, useRef } from 'react'
import { SVGuitarChord } from 'svguitar'
import type { ChordShape } from '@/lib/types'
import { useResolvedTheme } from '@/hooks/useResolvedTheme'
import { cn } from '@/lib/utils'

interface ChordDiagramProps {
  chord: ChordShape
  /** Toon de vingernummers in de stippen. */
  showFingers?: boolean
  /** Toon de snaarnamen (E A D G B E) onderaan. */
  showTuning?: boolean
  className?: string
}

const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E']

/**
 * Rendert een akkoord-diagram als SVG via SVGuitar — volledig uit data, dus geen
 * afbeeldingen. Her-rendert bij wijziging van akkoord of thema (voor kleuren).
 */
export function ChordDiagram({
  chord,
  showFingers = true,
  showTuning = true,
  className,
}: ChordDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const theme = useResolvedTheme()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const dark = theme === 'dark'
    const fingerColor = dark ? '#a78bfa' : '#7c3aed'
    const lineColor = dark ? '#d4d4d8' : '#3f3f46'
    const textColor = dark ? '#e5e7eb' : '#27272a'

    // Hoogste fret bepaalt hoeveel frets we tonen (minimaal 4).
    const maxFret = chord.fingers.reduce((m, [, fret]) => {
      return typeof fret === 'number' ? Math.max(m, fret) : m
    }, 0)
    const barreMax = (chord.barres ?? []).reduce((m, b) => Math.max(m, b.fret), 0)
    const frets = Math.max(4, maxFret, barreMax)

    const chart = new SVGuitarChord(el)

    chart
      .configure({
        frets,
        position: chord.position ?? 1,
        strings: 6,
        tuning: showTuning ? STANDARD_TUNING : [],
        fingerColor,
        fingerTextColor: '#ffffff',
        fingerTextSize: 22,
        fretColor: lineColor,
        stringColor: lineColor,
        fretLabelColor: textColor,
        tuningsColor: textColor,
        nutColor: lineColor,
        backgroundColor: 'none',
        strokeWidth: 2,
        nutWidth: 12,
        fontFamily: 'Inter, system-ui, sans-serif',
        // Toegankelijkheid: beschrijvende titel binnen de SVG.
        svgTitle: `Akkoorddiagram voor ${chord.display}`,
      } as Parameters<SVGuitarChord['configure']>[0])
      .chord({
        fingers: chord.fingers.map(([string, fret, finger]) => {
          if (fret === 'x' || fret === 0 || !showFingers) return [string, fret]
          return [string, fret, finger]
        }),
        barres: (chord.barres ?? []).map((b) => ({
          fromString: b.fromString,
          toString: b.toString,
          fret: b.fret,
          text: showFingers ? b.text : undefined,
        })),
        position: chord.position ?? 1,
      })
      .draw()

    return () => {
      try {
        chart.remove()
      } catch {
        el.innerHTML = ''
      }
    }
  }, [chord, theme, showFingers, showTuning])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Akkoorddiagram voor ${chord.display}`}
      className={cn('[&_svg]:h-full [&_svg]:w-full', className)}
    />
  )
}
