import type { Song } from '@/lib/types'

// Ingebouwde oefenliedjes — uitsluitend traditionele / public-domain nummers,
// met vereenvoudigde akkoordschema's om mee te oefenen. Bewust modulair: een
// gelicenseerde song-bron kan later als extra `source` worden toegevoegd zonder
// de meespeel-logica te wijzigen. (Geen copyrighted nummers hardcoden.)

export const SONGS: Song[] = [
  {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    artist: 'Traditioneel',
    songKey: 'G',
    tempo: 80,
    timeSignature: '3/4',
    source: 'public-domain',
    builtIn: true,
    sections: [
      {
        name: 'Vers',
        measures: [
          { chord: 'G', beats: 3 },
          { chord: 'C', beats: 3 },
          { chord: 'G', beats: 3 },
          { chord: 'D', beats: 3 },
          { chord: 'G', beats: 3 },
          { chord: 'C', beats: 3 },
          { chord: 'G', beats: 3 },
          { chord: 'D', beats: 3 },
          { chord: 'G', beats: 3 },
          { chord: 'Em', beats: 3 },
          { chord: 'D', beats: 3 },
          { chord: 'G', beats: 3 },
        ],
      },
    ],
  },
  {
    id: 'house-rising-sun',
    title: 'House of the Rising Sun',
    artist: 'Traditioneel',
    songKey: 'Am',
    tempo: 76,
    timeSignature: '4/4',
    source: 'traditioneel',
    builtIn: true,
    sections: [
      {
        name: 'Vers',
        measures: [
          { chord: 'Am', beats: 4 },
          { chord: 'C', beats: 4 },
          { chord: 'D', beats: 4 },
          { chord: 'F', beats: 4 },
          { chord: 'Am', beats: 4 },
          { chord: 'C', beats: 4 },
          { chord: 'E', beats: 4 },
          { chord: 'E', beats: 4 },
        ],
      },
    ],
  },
  {
    id: 'drunken-sailor',
    title: 'Drunken Sailor',
    artist: 'Traditioneel (sea shanty)',
    songKey: 'Dm',
    tempo: 120,
    timeSignature: '4/4',
    source: 'traditioneel',
    builtIn: true,
    sections: [
      {
        name: 'Vers',
        measures: [
          { chord: 'Dm', beats: 4 },
          { chord: 'C', beats: 4 },
          { chord: 'Dm', beats: 4 },
          { chord: 'C', beats: 4 },
          { chord: 'Dm', beats: 4 },
          { chord: 'C', beats: 4 },
          { chord: 'Dm', beats: 4 },
          { chord: 'Dm', beats: 4 },
        ],
      },
    ],
  },
  {
    id: 'oh-susanna',
    title: 'Oh! Susanna',
    artist: 'Traditioneel',
    songKey: 'C',
    tempo: 104,
    timeSignature: '4/4',
    source: 'public-domain',
    builtIn: true,
    sections: [
      {
        name: 'Vers',
        measures: [
          { chord: 'C', beats: 4 },
          { chord: 'F', beats: 4 },
          { chord: 'C', beats: 4 },
          { chord: 'G', beats: 4 },
          { chord: 'C', beats: 4 },
          { chord: 'F', beats: 4 },
          { chord: 'C', beats: 2 },
          { chord: 'G', beats: 2 },
          { chord: 'C', beats: 4 },
        ],
      },
    ],
  },
]

export const SONG_BY_ID = new Map(SONGS.map((s) => [s.id, s]))
