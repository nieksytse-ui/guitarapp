import type { StrummingPattern, TimeSignature } from '@/lib/types'

// Veelgebruikte strumming-patronen. Eén cel per achtste noot:
//   D = down, U = up, X = gedempte "chunk", '-' = geen aanslag (laat klinken).
// 4/4 → 8 cellen (1 & 2 & 3 & 4 &), 3/4 → 6 cellen, 6/8 → 6 cellen.
//
// Hieronder staan 20 kant-en-klare 4/4-patronen, oplopend van beginner naar
// gevorderd, gevolgd door een paar 3/4- en 6/8-extra's. Elk patroon is direct
// speelbaar in de strumming-trainer.

export const STRUMMING_PATTERNS: StrummingPattern[] = [
  // --- 4/4 · Beginner ------------------------------------------------------
  {
    id: 'quarters',
    name: 'Kwartslagen',
    timeSignature: '4/4',
    cells: ['D', '-', 'D', '-', 'D', '-', 'D', '-'],
    accents: [0],
    difficulty: 'beginner',
    description: 'Eén neerwaartse aanslag per tel. Perfect om te starten.',
    builtIn: true,
  },
  {
    id: 'half-notes',
    name: 'Halve noten',
    timeSignature: '4/4',
    cells: ['D', '-', '-', '-', 'D', '-', '-', '-'],
    accents: [0],
    difficulty: 'beginner',
    description: 'Aanslag op tel 1 en 3 — rustig en ruim, ideaal voor ballads.',
    builtIn: true,
  },
  {
    id: 'all-down-eighths',
    name: 'Achtsten omlaag',
    timeSignature: '4/4',
    cells: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'],
    accents: [0],
    difficulty: 'beginner',
    description: 'Acht stevige neerwaartse aanslagen. Strak en drijvend; houd je tempo gelijk.',
    builtIn: true,
  },
  {
    id: 'eighths',
    name: 'Achtsten (down-up)',
    timeSignature: '4/4',
    cells: ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'],
    accents: [0],
    difficulty: 'beginner',
    description: 'Constant down-up. Houd je pols losjes en gelijkmatig.',
    builtIn: true,
  },
  {
    id: 'upbeat-ballad',
    name: 'Opmaat-ballade',
    timeSignature: '4/4',
    cells: ['D', '-', '-', 'U', 'D', '-', '-', 'U'],
    accents: [0],
    difficulty: 'beginner',
    description: 'Aanslag op 1 en 3 met een opmaat erbij. Zacht, wiegend gevoel.',
    builtIn: true,
  },

  // --- 4/4 · Gemiddeld -----------------------------------------------------
  {
    id: 'pop-old-faithful',
    name: 'Pop · "old faithful"',
    timeSignature: '4/4',
    cells: ['D', '-', 'D', 'U', '-', 'U', 'D', 'U'],
    accents: [0],
    difficulty: 'gemiddeld',
    description: 'Het meest gebruikte popritme. Werkt onder ontelbaar veel liedjes.',
    builtIn: true,
  },
  {
    id: 'folk',
    name: 'Folk doorlopend',
    timeSignature: '4/4',
    cells: ['D', '-', 'D', 'U', 'D', 'U', 'D', 'U'],
    accents: [0],
    difficulty: 'gemiddeld',
    description: 'Stevige folk/country-begeleiding met doorlopende achtsten.',
    builtIn: true,
  },
  {
    id: 'boom-chick',
    name: 'Boom-chick (country)',
    timeSignature: '4/4',
    cells: ['D', '-', 'D', 'U', 'D', '-', 'D', 'U'],
    accents: [0],
    difficulty: 'gemiddeld',
    description: 'Afwisseling van bas-aanslag en akkoord — typisch country en folk.',
    builtIn: true,
  },
  {
    id: 'soft-pop',
    name: 'Soft pop',
    timeSignature: '4/4',
    cells: ['D', '-', 'D', '-', '-', 'U', 'D', 'U'],
    accents: [0],
    difficulty: 'gemiddeld',
    description: 'Rustige variant met lucht; mooi voor coupletten.',
    builtIn: true,
  },
  {
    id: 'three-against-four',
    name: 'Drie-tegen-vier',
    timeSignature: '4/4',
    cells: ['D', '-', 'D', 'U', '-', 'U', 'D', '-'],
    accents: [0],
    difficulty: 'gemiddeld',
    description: 'Speelse syncope die net naast de tel valt.',
    builtIn: true,
  },
  {
    id: 'anticipation',
    name: 'Anticipatie (push)',
    timeSignature: '4/4',
    cells: ['D', 'U', '-', 'U', 'D', 'U', 'D', 'U'],
    accents: [0],
    difficulty: 'gemiddeld',
    description: 'Begint met een up-stroke voor een vooruitduwend gevoel.',
    builtIn: true,
  },
  {
    id: 'driving-rock',
    name: 'Drijvende rock',
    timeSignature: '4/4',
    cells: ['D', 'D', 'U', 'U', 'D', 'D', 'U', 'U'],
    accents: [0],
    difficulty: 'gemiddeld',
    description: 'Twee downs, twee ups — krachtig en rollend.',
    builtIn: true,
  },
  {
    id: 'syncopated-pop',
    name: 'Syncope-pop',
    timeSignature: '4/4',
    cells: ['D', '-', 'D', 'U', 'D', 'U', '-', 'U'],
    accents: [0],
    difficulty: 'gemiddeld',
    description: 'Laat tel 4 weg voor een verrassend, modern accent.',
    builtIn: true,
  },
  {
    id: 'offbeat-pop',
    name: 'Tegentel-pop',
    timeSignature: '4/4',
    cells: ['-', 'U', 'D', 'U', '-', 'U', 'D', 'U'],
    accents: [0],
    difficulty: 'gemiddeld',
    description: 'Nadruk op de tegentellen; lekker dansbaar.',
    builtIn: true,
  },
  {
    id: 'island',
    name: 'Island / reggae (offbeat)',
    timeSignature: '4/4',
    cells: ['-', 'U', '-', 'U', '-', 'U', '-', 'U'],
    accents: [0],
    difficulty: 'gemiddeld',
    description: 'Alleen opwaartse aanslagen op de tegentellen — luchtig en swingend.',
    builtIn: true,
  },

  // --- 4/4 · Gevorderd -----------------------------------------------------
  {
    id: 'chunk-funk',
    name: 'Funk met chunks',
    timeSignature: '4/4',
    cells: ['D', 'X', 'D', 'U', 'X', 'U', 'D', 'X'],
    accents: [0],
    difficulty: 'gevorderd',
    description: 'Gedempte X-aanslagen geven een percussieve, funky groove.',
    builtIn: true,
  },
  {
    id: 'funk-offbeat',
    name: 'Funk-tegenslag',
    timeSignature: '4/4',
    cells: ['X', 'U', 'D', 'U', 'X', 'U', 'D', 'U'],
    accents: [0],
    difficulty: 'gevorderd',
    description: 'Chunks op de tel, akkoord op de tegenslag — strakke funk.',
    builtIn: true,
  },
  {
    id: 'reggae-chunk',
    name: 'Reggae-chunk (ska)',
    timeSignature: '4/4',
    cells: ['X', '-', 'X', 'U', 'X', '-', 'X', 'U'],
    accents: [0],
    difficulty: 'gevorderd',
    description: 'Korte, gedempte chunks met een opmaat — ska- en reggae-feel.',
    builtIn: true,
  },
  {
    id: 'sixteenth-feel',
    name: '16e-feel groove',
    timeSignature: '4/4',
    cells: ['D', 'U', 'X', 'U', 'D', 'U', 'X', 'U'],
    accents: [0],
    difficulty: 'gevorderd',
    description: 'Snelle down-up met chunks; suggereert zestienden.',
    builtIn: true,
  },
  {
    id: 'rumba',
    name: 'Rumba',
    timeSignature: '4/4',
    cells: ['D', '-', 'D', 'U', 'X', 'U', 'D', '-'],
    accents: [0],
    difficulty: 'gevorderd',
    description: 'Spaans/rumba-ritme met een percussieve veeg.',
    builtIn: true,
  },

  // --- 3/4 & 6/8 · extra's -------------------------------------------------
  {
    id: 'waltz',
    name: 'Wals',
    timeSignature: '3/4',
    cells: ['D', '-', 'D', '-', 'D', '-'],
    accents: [0],
    difficulty: 'beginner',
    description: 'Drie tellen per maat — denk aan een wals (1-2-3).',
    builtIn: true,
  },
  {
    id: 'waltz-updown',
    name: 'Wals met down-up',
    timeSignature: '3/4',
    cells: ['D', '-', 'D', 'U', 'D', 'U'],
    accents: [0],
    difficulty: 'gemiddeld',
    description: 'Walsritme met wat extra beweging op tel 2 en 3.',
    builtIn: true,
  },
  {
    id: 'six-eight',
    name: '6/8 ballad',
    timeSignature: '6/8',
    cells: ['D', '-', 'U', 'D', '-', 'U'],
    accents: [0, 3],
    difficulty: 'gemiddeld',
    description: 'Wiegend 6/8-gevoel met accenten op tel 1 en 4.',
    builtIn: true,
  },
]

export const STRUMMING_BY_ID = new Map(STRUMMING_PATTERNS.map((p) => [p.id, p]))

/** Aantal cellen (achtsten) per maatsoort. */
export function cellsPerBar(ts: TimeSignature): number {
  switch (ts) {
    case '3/4':
      return 6
    case '6/8':
      return 6
    case '4/4':
    default:
      return 8
  }
}

/** Telaanduiding onder elke cel, bijv. 1 & 2 & 3 & 4 &. */
export function countLabels(ts: TimeSignature): string[] {
  switch (ts) {
    case '3/4':
      return ['1', '&', '2', '&', '3', '&']
    case '6/8':
      return ['1', '2', '3', '4', '5', '6']
    case '4/4':
    default:
      return ['1', '&', '2', '&', '3', '&', '4', '&']
  }
}

/**
 * Indexen waarop de metronoom een tik geeft (de "hoofdtellen").
 * In 4/4/3/4 zijn dat de hele tellen; in 6/8 de twee gepunteerde tellen.
 */
export function beatIndices(ts: TimeSignature): number[] {
  switch (ts) {
    case '3/4':
      return [0, 2, 4]
    case '6/8':
      return [0, 3]
    case '4/4':
    default:
      return [0, 2, 4, 6]
  }
}

/** Maak een leeg patroon van de juiste lengte (voor de eigen-patroon-editor). */
export function emptyPattern(ts: TimeSignature): StrummingPattern['cells'] {
  return Array.from({ length: cellsPerBar(ts) }, () => '-' as const)
}
