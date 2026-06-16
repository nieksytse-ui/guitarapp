import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface LinePoint {
  label: string
  value: number
}

interface LineChartProps {
  data: LinePoint[]
  height?: number
  className?: string
  /** Toon het hoogste punt (record) extra geaccentueerd. */
  highlightMax?: boolean
}

/**
 * Eenvoudige, afhankelijkheidsvrije SVG-lijngrafiek met area-fill.
 * Gebruikt o.a. voor de voortgang van akkoordwissels over tijd.
 */
export function LineChart({ data, height = 160, className, highlightMax = true }: LineChartProps) {
  const width = 480
  const padding = { top: 16, right: 12, bottom: 24, left: 28 }

  const { points, areaPath, linePath, maxValue, maxIndex, yTicks } = useMemo(() => {
    const values = data.map((d) => d.value)
    const maxValue = Math.max(10, ...values)
    const maxIndex = values.indexOf(Math.max(...values))
    const innerW = width - padding.left - padding.right
    const innerH = height - padding.top - padding.bottom

    const x = (i: number) =>
      padding.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
    const y = (v: number) => padding.top + innerH - (v / maxValue) * innerH

    const points = data.map((d, i) => ({ x: x(i), y: y(d.value), ...d }))
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const areaPath =
      points.length > 0
        ? `${linePath} L${points[points.length - 1].x},${padding.top + innerH} L${points[0].x},${
            padding.top + innerH
          } Z`
        : ''

    const yTicks = [0, Math.round(maxValue / 2), maxValue].map((v) => ({ v, y: y(v) }))

    return { points, areaPath, linePath, maxValue, maxIndex, yTicks }
  }, [data, height])

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'grid place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground',
          className,
        )}
        style={{ height }}
      >
        Nog geen gegevens — voltooi een ronde om je voortgang te zien.
      </div>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('w-full', className)}
      role="img"
      aria-label="Grafiek van je akkoordwissels over tijd"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Rasterlijnen */}
      {yTicks.map((t) => (
        <g key={t.v}>
          <line
            x1={padding.left}
            y1={t.y}
            x2={width - padding.right}
            y2={t.y}
            stroke="hsl(var(--border))"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <text x={4} y={t.y + 4} fontSize={10} fill="hsl(var(--muted-foreground))">
            {t.v}
          </text>
        </g>
      ))}

      {areaPath && <path d={areaPath} fill="url(#lineFill)" />}
      <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} strokeLinejoin="round" />

      {points.map((p, i) => {
        const isMax = highlightMax && i === maxIndex && p.value === maxValue
        return (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={isMax ? 5 : 3.5}
              fill={isMax ? 'hsl(var(--amber))' : 'hsl(var(--primary))'}
              stroke="hsl(var(--card))"
              strokeWidth={2}
            />
            {isMax && (
              <text
                x={p.x}
                y={p.y - 10}
                fontSize={11}
                fontWeight={700}
                textAnchor="middle"
                fill="hsl(var(--amber))"
              >
                {p.value}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
