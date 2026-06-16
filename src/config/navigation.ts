import {
  BookOpen,
  Ear,
  Guitar,
  LayoutDashboard,
  ListChecks,
  Music,
  Music2,
  Repeat,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavModule {
  to: string
  label: string
  icon: LucideIcon
  description: string
  /** Tailwind-gradient voor de module-kaart/icoon. */
  accent: string
}

/** De oefenmodules — getoond op het dashboard en in de navigatie. */
export const modules: NavModule[] = [
  {
    to: '/akkoorden',
    label: 'Akkoorden',
    icon: Music,
    description: 'Blader door akkoorden met diagram, vingerzetting en geluid.',
    accent: 'from-violet-500 to-indigo-600',
  },
  {
    to: '/strumming',
    label: 'Strumming',
    icon: Guitar,
    description: 'Train ritmes met meelopende pijlen en een metronoom.',
    accent: 'from-amber-400 to-orange-500',
  },
  {
    to: '/wissels',
    label: 'Wisseltrainer',
    icon: Repeat,
    description: 'Oefen vloeiende akkoordwissels tegen de klok.',
    accent: 'from-rose-500 to-pink-600',
  },
  {
    to: '/theorie',
    label: 'Theorie',
    icon: BookOpen,
    description: 'Snap noten, intervallen, toonladders en akkoordopbouw.',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    to: '/gehoor',
    label: 'Gehoortraining',
    icon: Ear,
    description: 'Herken intervallen en akkoorden puur op gehoor.',
    accent: 'from-sky-500 to-blue-600',
  },
  {
    to: '/sessies',
    label: 'Sessies',
    icon: ListChecks,
    description: 'Stel je eigen oefensessie samen uit blokken.',
    accent: 'from-fuchsia-500 to-purple-600',
  },
  {
    to: '/liedjes',
    label: 'Liedjes',
    icon: Music2,
    description: "Speel mee met akkoordschema's en een backing-beat.",
    accent: 'from-lime-500 to-green-600',
  },
]

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

/** Volledige navigatie (dashboard + modules + instellingen). */
export const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  ...modules.map(({ to, label, icon }) => ({ to, label, icon })),
  { to: '/instellingen', label: 'Instellingen', icon: Settings },
]
