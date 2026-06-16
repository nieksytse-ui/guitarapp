import { create } from 'zustand'
import { uid } from '@/lib/utils'

export type ToastVariant = 'default' | 'xp' | 'success' | 'error'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  xp?: number
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => string
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = uid('toast')
    set((s) => ({ toasts: [...s.toasts, { duration: 3200, variant: 'default', ...t, id }] }))
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

/** Snelle helper om overal een toast te tonen. */
export function toast(t: Omit<Toast, 'id'>): string {
  return useToastStore.getState().push(t)
}

/** Vrolijke XP-melding. */
export function xpToast(amount: number, title = 'Lekker bezig!'): string {
  return toast({ title, xp: amount, variant: 'xp' })
}
