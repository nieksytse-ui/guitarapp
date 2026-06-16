import {
  BookOpen,
  Coffee,
  Ear,
  Guitar,
  Music,
  Music2,
  Repeat,
  type LucideIcon,
} from 'lucide-react'
import type { BlockModule, SessionTemplate } from '@/lib/types'

/** Presentatie + routekoppeling per blok-module (gebruikt in de sessie-builder). */
export const BLOCK_MODULE_META: Record<
  BlockModule,
  { label: string; icon: LucideIcon; route?: string; accent: string }
> = {
  'chord-change': {
    label: 'Akkoordwissels',
    icon: Repeat,
    route: '/wissels',
    accent: 'from-rose-500 to-pink-600',
  },
  strumming: {
    label: 'Strumming',
    icon: Guitar,
    route: '/strumming',
    accent: 'from-amber-400 to-orange-500',
  },
  chords: {
    label: 'Akkoorden',
    icon: Music,
    route: '/akkoorden',
    accent: 'from-violet-500 to-indigo-600',
  },
  song: {
    label: 'Meespelen',
    icon: Music2,
    route: '/liedjes',
    accent: 'from-lime-500 to-green-600',
  },
  theory: {
    label: 'Theorie',
    icon: BookOpen,
    route: '/theorie',
    accent: 'from-emerald-500 to-teal-600',
  },
  'ear-training': {
    label: 'Gehoortraining',
    icon: Ear,
    route: '/gehoor',
    accent: 'from-sky-500 to-blue-600',
  },
  free: {
    label: 'Vrij oefenen',
    icon: Coffee,
    accent: 'from-zinc-400 to-zinc-600',
  },
}

export const BLOCK_MODULES = Object.keys(BLOCK_MODULE_META) as BlockModule[]

const min = (m: number) => m * 60

/** Kant-en-klare oefensessies om direct mee te starten of als startpunt te bewerken. */
export const BUILTIN_TEMPLATES: SessionTemplate[] = [
  {
    id: 'builtin-warmup',
    name: 'Snelle warming-up',
    builtIn: true,
    blocks: [
      { id: 'w1', module: 'chord-change', title: 'Wissels losmaken', durationSec: min(4), note: 'Kies 2 lastige akkoorden.' },
      { id: 'w2', module: 'strumming', title: 'Ritme erin', durationSec: min(3) },
      { id: 'w3', module: 'song', title: 'Meespelen', durationSec: min(3) },
    ],
  },
  {
    id: 'builtin-complete',
    name: 'Complete oefensessie',
    builtIn: true,
    blocks: [
      { id: 'c1', module: 'chord-change', title: 'Akkoordwissels', durationSec: min(5) },
      { id: 'c2', module: 'strumming', title: 'Strumming-patronen', durationSec: min(8) },
      { id: 'c3', module: 'chords', title: 'Nieuw akkoord leren', durationSec: min(4) },
      { id: 'c4', module: 'theory', title: 'Theorie-stage', durationSec: min(5) },
      { id: 'c5', module: 'song', title: 'Liedje spelen', durationSec: min(8) },
    ],
  },
  {
    id: 'builtin-rhythm',
    name: 'Ritme & timing',
    builtIn: true,
    blocks: [
      { id: 'r1', module: 'strumming', title: 'Strumming-trainer', durationSec: min(10), note: 'Voer het tempo geleidelijk op.' },
      { id: 'r2', module: 'song', title: 'Meespelen op de beat', durationSec: min(10) },
    ],
  },
  {
    id: 'builtin-ear-theory',
    name: 'Gehoor & theorie',
    builtIn: true,
    blocks: [
      { id: 'e1', module: 'theory', title: 'Theorie verdiepen', durationSec: min(7) },
      { id: 'e2', module: 'ear-training', title: 'Gehoortraining', durationSec: min(8) },
    ],
  },
]
