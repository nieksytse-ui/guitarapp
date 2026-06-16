import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
