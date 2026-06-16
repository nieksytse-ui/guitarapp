import { cn } from '@/lib/utils'

interface CircularTimerProps {
  /** Resterende seconden. */
  remaining: number
  /** Totale duur in seconden. */
  total: number
  size?: number
  className?: string
  children?: React.ReactNode
}

/** Ronde afteltimer met een aflopende ring (SVG). */
export function CircularTimer({
  remaining,
  total,
  size = 200,
  className,
  children,
}: CircularTimerProps) {
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0
  const offset = circumference * (1 - ratio)
  const urgent = remaining <= 10

  return (
    <div className={cn('relative grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={urgent ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}
