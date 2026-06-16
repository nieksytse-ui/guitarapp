import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Sparkles, XCircle } from 'lucide-react'
import { useToastStore, type Toast } from '@/store/useToastStore'
import { cn } from '@/lib/utils'

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss)

  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), toast.duration ?? 3200)
    return () => clearTimeout(t)
  }, [toast.id, toast.duration, dismiss])

  const icon =
    toast.variant === 'xp' ? (
      <Sparkles className="h-5 w-5 text-amber" />
    ) : toast.variant === 'success' ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    ) : toast.variant === 'error' ? (
      <XCircle className="h-5 w-5 text-destructive" />
    ) : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      onClick={() => dismiss(toast.id)}
      className={cn(
        'pointer-events-auto flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-glow backdrop-blur',
      )}
    >
      {icon}
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground">{toast.description}</p>
        )}
      </div>
      {typeof toast.xp === 'number' && (
        <span className="ml-2 shrink-0 rounded-full bg-amber/15 px-2.5 py-1 text-sm font-bold text-amber-foreground dark:text-amber">
          +{toast.xp} XP
        </span>
      )}
    </motion.div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  )
}
