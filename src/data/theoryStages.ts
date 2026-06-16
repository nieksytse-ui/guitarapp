export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type InteractiveKind =
  | 'fretboard-notes'
  | 'intervals'
  | 'scale'
  | 'chord-builder'
  | 'circle'

export interface TheoryStage {
  id: string
  title: string
  subtitle: string
  level: 'beginner' | 'gemiddeld' | 'gevorderd'
  intro: string[]
  interactive: InteractiveKind
  quiz: QuizQuestion[]
}

// Alle content is gecontroleerd met Tonal.js-berekeningen (zie theory.test.ts).
export const THEORY_STAGES: TheoryStage[] = [
  {
    id: 'notes',
    title: 'Noten op de hals',
    subtitle: 'Leer de gitaarhals kennen',
    level: 'beginner',
    intro: [
      'De zes open snaren van een gitaar zijn (van laag naar hoog): E – A – D – G – B – E.',
      'Elke fret verhoogt de toon met een halve toon. Op de 12e fret klinkt dezelfde noot als de open snaar, maar een octaaf hoger.',
      'Tip: de 5e fret van een snaar klinkt meestal gelijk aan de volgende open snaar (behalve op de G-snaar, daar is het de 4e fret).',
    ],
    interactive: 'fretboard-notes',
    quiz: [
      {
        question: 'Welke noot speel je op de 5e fret van de lage E-snaar?',
        options: ['G', 'A', 'B', 'D'],
        correctIndex: 1,
        explanation: 'Vijf halve tonen boven E is A — daarom stem je de A-snaar vaak hieraan.',
      },
      {
        question: 'Op welke fret van de A-snaar vind je een C?',
        options: ['2e fret', '3e fret', '5e fret', '7e fret'],
        correctIndex: 1,
        explanation: 'A → A# → B → C is drie halve tonen, dus de 3e fret.',
      },
      {
        question: 'De 12e fret klinkt ten opzichte van de open snaar een…',
        options: ['kwint hoger', 'octaaf hoger', 'kwart hoger', 'terts hoger'],
        correctIndex: 1,
        explanation: 'Twaalf halve tonen vormen samen precies een octaaf.',
      },
    ],
  },
  {
    id: 'intervals',
    title: 'Intervallen',
    subtitle: 'De afstand tussen twee noten',
    level: 'beginner',
    intro: [
      'Een interval is de afstand tussen twee noten, gemeten in halve tonen.',
      'Belangrijke intervallen: kleine terts (3), grote terts (4), reine kwart (5), reine kwint (7) en octaaf (12).',
      'Intervallen zijn de bouwstenen van akkoorden en melodieën. Leer ze herkennen en je hoort muziek met andere oren.',
    ],
    interactive: 'intervals',
    quiz: [
      {
        question: 'Hoeveel halve tonen zitten er in een reine kwint?',
        options: ['5', '6', '7', '8'],
        correctIndex: 2,
        explanation: 'Een reine kwint (bijv. C → G) is 7 halve tonen.',
      },
      {
        question: 'Het interval van C naar E is een…',
        options: ['kleine terts', 'grote terts', 'reine kwart', 'kwint'],
        correctIndex: 1,
        explanation: 'C → E is 4 halve tonen: een grote terts.',
      },
      {
        question: 'Een octaaf bestaat uit hoeveel halve tonen?',
        options: ['8', '10', '11', '12'],
        correctIndex: 3,
        explanation: 'Een octaaf omvat alle 12 halve tonen.',
      },
    ],
  },
  {
    id: 'scales',
    title: 'Toonladders',
    subtitle: 'Majeur en mineur',
    level: 'gemiddeld',
    intro: [
      'De majeur toonladder volgt het patroon van hele (H) en halve (h) afstanden: H-H-h-H-H-H-h.',
      'C majeur gebruikt alle witte toetsen: C D E F G A B — geen kruisen of mollen.',
      'De natuurlijke mineur toonladder deelt dezelfde noten als zijn relatieve majeur. A mineur = C majeur, maar begint op A.',
    ],
    interactive: 'scale',
    quiz: [
      {
        question: 'Hoeveel verschillende noten heeft een majeur toonladder (zonder de octaaf)?',
        options: ['5', '6', '7', '8'],
        correctIndex: 2,
        explanation: 'Een majeur toonladder heeft 7 noten voordat je weer bij de grondtoon komt.',
      },
      {
        question: 'Welke noot heeft G majeur die C majeur niet heeft?',
        options: ['F#', 'C#', 'Bb', 'G#'],
        correctIndex: 0,
        explanation: 'G majeur is G A B C D E F# — de F is verhoogd naar F#.',
      },
      {
        question: 'A natuurlijke mineur bevat dezelfde noten als welke majeur toonladder?',
        options: ['G majeur', 'C majeur', 'D majeur', 'F majeur'],
        correctIndex: 1,
        explanation: 'A mineur is de relatieve mineur van C majeur: dezelfde noten, andere grondtoon.',
      },
    ],
  },
  {
    id: 'chords',
    title: 'Akkoordopbouw',
    subtitle: 'Drieklanken en septiemakkoorden',
    level: 'gemiddeld',
    intro: [
      'Een drieklank stapel je in tertsen: grondtoon + terts + kwint.',
      'Majeur = grote terts + kleine terts (C-E-G). Mineur = kleine terts + grote terts (A-C-E).',
      'Voeg je nog een terts toe, dan krijg je een septiemakkoord, zoals Cmaj7 (C-E-G-B) of G7 (G-B-D-F).',
    ],
    interactive: 'chord-builder',
    quiz: [
      {
        question: 'Een majeur drieklank bestaat uit grondtoon, … en kwint.',
        options: ['kleine terts', 'grote terts', 'kwart', 'secunde'],
        correctIndex: 1,
        explanation: 'Majeur begint met een grote terts boven de grondtoon.',
      },
      {
        question: 'Welke noten zitten in een C majeur akkoord?',
        options: ['C E G', 'C F A', 'C Eb G', 'C E A'],
        correctIndex: 0,
        explanation: 'C majeur = C (grondtoon), E (grote terts), G (kwint).',
      },
      {
        question: 'Welke noot voeg je toe aan C majeur om Cmaj7 te maken?',
        options: ['A', 'Bb', 'B', 'D'],
        correctIndex: 2,
        explanation: 'Cmaj7 voegt de grote septiem B toe: C-E-G-B.',
      },
    ],
  },
  {
    id: 'keys',
    title: 'Toonsoorten & cadensen',
    subtitle: 'De cirkel van kwinten',
    level: 'gevorderd',
    intro: [
      'In elke toonsoort horen zeven diatonische akkoorden. In majeur zijn dat: I ii iii IV V vi vii°.',
      'De I-, IV- en V-akkoorden zijn majeur en vormen de ruggengraat van talloze liedjes (denk aan een I-IV-V).',
      'De cirkel van kwinten ordent alle toonsoorten. Naburige toonsoorten delen veel noten en klinken daarom verwant.',
    ],
    interactive: 'circle',
    quiz: [
      {
        question: 'Wat is het V-akkoord (dominant) in C majeur?',
        options: ['F', 'G', 'Am', 'Dm'],
        correctIndex: 1,
        explanation: 'De vijfde trap van C majeur is G — het dominant-akkoord.',
      },
      {
        question: 'De relatieve mineur van C majeur is…',
        options: ['A mineur', 'E mineur', 'D mineur', 'G mineur'],
        correctIndex: 0,
        explanation: 'A mineur deelt alle noten met C majeur.',
      },
      {
        question: 'Een I-IV-V in G majeur bestaat uit de akkoorden…',
        options: ['G C D', 'G Bm D', 'G Am C', 'G C Em'],
        correctIndex: 0,
        explanation: 'In G majeur: I = G, IV = C, V = D.',
      },
    ],
  },
]
