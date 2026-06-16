import { useMemo } from 'react'
import { circleOfFifthsMajor, circleOfFifthsMinor } from '@/lib/theory'
import { cn } from '@/lib/utils'

interface CircleOfFifthsProps {
  /** Geselecteerde majeur-toonsoort (pitch class), bijv. "C". */
  selected?: string
  onSelect?: (majorKey: string) => void
  className?: string
}

const SIZE = 320
const C = SIZE / 2
const R_OUTER = 150
const R_MID = 96
const R_INNER = 54

function polar(r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) }
}

function ringSegment(rOuter: number, rInner: number, startDeg: number, endDeg: number) {
  const p1 = polar(rOuter, startDeg)
  const p2 = polar(rOuter, endDeg)
  const p3 = polar(rInner, endDeg)
  const p4 = polar(rInner, startDeg)
  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 0 0 ${p4.x} ${p4.y} Z`
}

/** Interactieve cirkel van kwinten met majeur (buiten) en relatieve mineur (binnen). */
export function CircleOfFifths({ selected = 'C', onSelect, className }: CircleOfFifthsProps) {
  const majors = useMemo(() => circleOfFifthsMajor(), [])
  const minors = useMemo(() => circleOfFifthsMinor(), [])

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={cn('mx-auto w-full max-w-sm', className)}
      role="img"
      aria-label="Cirkel van kwinten"
    >
      {majors.map((maj, i) => {
        const start = i * 30 - 15
        const end = i * 30 + 15
        const active = maj === selected
        const majPos = polar((R_OUTER + R_MID) / 2, i * 30)
        const minPos = polar((R_MID + R_INNER) / 2, i * 30)
        return (
          <g key={maj} className={onSelect ? 'cursor-pointer' : ''}>
            {/* Majeur-segment */}
            <path
              d={ringSegment(R_OUTER, R_MID, start, end)}
              onClick={() => onSelect?.(maj)}
              className={cn(
                'transition-colors',
                active ? 'fill-primary' : 'fill-card hover:fill-accent',
              )}
              stroke="hsl(var(--border))"
              strokeWidth={1.5}
            />
            <text
              x={majPos.x}
              y={majPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                'pointer-events-none text-[15px] font-bold',
                active ? 'fill-primary-foreground' : 'fill-foreground',
              )}
            >
              {maj}
            </text>

            {/* Mineur-segment */}
            <path
              d={ringSegment(R_MID, R_INNER, start, end)}
              onClick={() => onSelect?.(maj)}
              className={cn(
                'transition-colors',
                active ? 'fill-primary/30' : 'fill-muted hover:fill-accent',
              )}
              stroke="hsl(var(--border))"
              strokeWidth={1.5}
            />
            <text
              x={minPos.x}
              y={minPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="pointer-events-none text-[11px] font-semibold fill-muted-foreground"
            >
              {minors[i]}
            </text>
          </g>
        )
      })}

      {/* Middelpunt */}
      <circle cx={C} cy={C} r={R_INNER} className="fill-background" stroke="hsl(var(--border))" strokeWidth={1.5} />
      <text
        x={C}
        y={C - 6}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] font-medium"
      >
        cirkel van
      </text>
      <text x={C} y={C + 8} textAnchor="middle" className="fill-foreground text-[12px] font-bold">
        kwinten
      </text>
    </svg>
  )
}
