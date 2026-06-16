// Centrale audio-engine op basis van Tone.js.
//
// Belangrijk over timing: Tone.js gebruikt een eigen audio-klok die los staat
// van JavaScript's setTimeout/setInterval. Voor sample-accurate timing (metronoom,
// strumming) plannen we events vooruit met Tone.Transport en Tone.Draw. Browsers
// vereisen een user-gesture voordat audio mag starten — vandaar de expliciete
// `start()` die we koppelen aan een klik/knop.

import * as Tone from 'tone'

let initialized = false
let masterVolume: Tone.Volume | null = null

// Een warme "plucked string" voor akkoorden en losse noten.
let pluck: Tone.PluckSynth | null = null
let pluckPoly: Tone.PolySynth | null = null

// Korte, droge klikken voor de metronoom (hoog = accent, laag = normaal).
let clickHi: Tone.MembraneSynth | null = null
let clickLo: Tone.MembraneSynth | null = null

/** Zet (eenmalig) de audio-graph op. Veilig om vaker aan te roepen. */
export async function initAudio(): Promise<void> {
  if (initialized) {
    // Hervat een eventueel onderbroken context (bv. na tab-wissel).
    if (Tone.getContext().state !== 'running') {
      await Tone.start()
    }
    return
  }

  await Tone.start()

  masterVolume = new Tone.Volume(volumeToDb(0.8)).toDestination()

  // PolySynth met FM voor akkoorden die wat voller klinken dan losse plucks.
  pluckPoly = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.9, sustain: 0.05, release: 1.2 },
  }).connect(masterVolume)
  pluckPoly.volume.value = -8

  // Losse pluck voor arpeggio's / enkele snaren.
  pluck = new Tone.PluckSynth({
    attackNoise: 1,
    dampening: 4000,
    resonance: 0.9,
  }).connect(masterVolume)

  clickHi = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.12, sustain: 0 },
  }).connect(masterVolume)

  clickLo = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
  }).connect(masterVolume)

  initialized = true
}

/** Lineair volume (0..1) → decibel, met stilte bij 0. */
function volumeToDb(v: number): number {
  if (v <= 0) return -Infinity
  // -36 dB .. 0 dB voelt natuurlijk aan voor een UI-slider.
  return 36 * (v - 1)
}

/** Stel het hoofdvolume in (0..1). */
export function setMasterVolume(v: number): void {
  if (masterVolume) masterVolume.volume.rampTo(volumeToDb(v), 0.05)
}

/** Speel een akkoord (lijst noten zoals ["C3","E3","G3"]). */
export function playChord(notes: string[], duration: Tone.Unit.Time = '2n'): void {
  if (!pluckPoly) return
  pluckPoly.triggerAttackRelease(notes, duration)
}

/** Speel een akkoord als snelle aanslag (arpeggio van laag naar hoog). */
export function strumChord(
  notes: string[],
  opts: { up?: boolean; spread?: number; duration?: Tone.Unit.Time } = {},
): void {
  if (!pluck) return
  const { up = false, spread = 0.028, duration = '4n' } = opts
  const ordered = up ? [...notes].reverse() : notes
  const now = Tone.now()
  ordered.forEach((note, i) => {
    pluck!.triggerAttackRelease(note, duration, now + i * spread)
  })
}

/**
 * Speel een akkoord-aanslag op een exacte transport-tijd (voor de strumming-
 * trainer). Een kleine `spread` tussen de noten geeft het natuurlijke
 * "aanslag"-gevoel; bij een up-stroke draaien we de volgorde om.
 */
export function strumChordAt(
  notes: string[],
  time: number,
  opts: { up?: boolean; spread?: number; duration?: Tone.Unit.Time; velocity?: number } = {},
): void {
  if (!pluckPoly) return
  const { up = false, spread = 0.022, duration = '4n', velocity = 0.7 } = opts
  const ordered = up ? [...notes].reverse() : notes
  ordered.forEach((note, i) => {
    pluckPoly!.triggerAttackRelease(note, duration, time + i * spread, velocity)
  })
}

/** Doffe, percussieve "chunk" (gedempte aanslag) op een exacte tijd. */
export function mutedStrumAt(time: number): void {
  if (!clickLo) return
  clickLo.triggerAttackRelease('C2', '64n', time, 0.35)
}

/** Speel één losse noot. */
export function playNote(note: string, duration: Tone.Unit.Time = '8n', time?: number): void {
  if (!pluckPoly) return
  pluckPoly.triggerAttackRelease(note, duration, time)
}

/** Speel een reeks noten na elkaar (voor gehoortraining/melodie). */
export function playSequence(
  notes: string[],
  opts: { interval?: number; duration?: Tone.Unit.Time } = {},
): void {
  if (!pluckPoly) return
  const { interval = 0.6, duration = '4n' } = opts
  const now = Tone.now()
  notes.forEach((note, i) => {
    pluckPoly!.triggerAttackRelease(note, duration, now + i * interval)
  })
}

/** Een metronoomtik; accent = hogere, hardere klik. */
export function click(time: number, accent = false): void {
  const synth = accent ? clickHi : clickLo
  if (!synth) return
  synth.triggerAttackRelease(accent ? 'C3' : 'G2', '32n', time, accent ? 1 : 0.7)
}

/** Directe toegang tot de Tone-namespace voor geavanceerde planning. */
export { Tone }

/** Is de audio-context actief? */
export function isAudioReady(): boolean {
  return initialized && Tone.getContext().state === 'running'
}
