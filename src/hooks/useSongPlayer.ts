import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Tone, click, initAudio, strumChordAt } from '@/lib/audio/engine'
import { CHORD_BY_ID } from '@/data/chords'
import type { Song } from '@/lib/types'

/** Eén maat, losgekoppeld van secties, met absolute index binnen de song. */
export interface FlatMeasure {
  index: number
  chord: string
  beats: number
  sectionName: string
  /** True bij de eerste maat van een nieuwe sectie (voor labels in de UI). */
  sectionStart: boolean
}

/** Eén tel op de tijdlijn — gebruikt om events vooruit te plannen. */
interface BeatSlot {
  measureIndex: number
  chord: string
  beatInMeasure: number
  isDownbeat: boolean
}

/** Vlakt secties → maten af, met absolute index en sectie-markeringen. */
export function flattenSong(song: Song): FlatMeasure[] {
  const out: FlatMeasure[] = []
  song.sections.forEach((section) => {
    section.measures.forEach((m, i) => {
      out.push({
        index: out.length,
        chord: m.chord,
        beats: m.beats,
        sectionName: section.name,
        sectionStart: i === 0,
      })
    })
  })
  return out
}

function buildBeatTimeline(measures: FlatMeasure[]): BeatSlot[] {
  const beats: BeatSlot[] = []
  measures.forEach((m, measureIndex) => {
    for (let b = 0; b < m.beats; b++) {
      beats.push({
        measureIndex,
        chord: m.chord,
        beatInMeasure: b,
        isDownbeat: b === 0,
      })
    }
  })
  return beats
}

/** Klinkende noten voor een akkoordnaam, of leeg als onbekend. */
function notesForChord(chord: string): string[] {
  return CHORD_BY_ID.get(chord)?.notes ?? []
}

interface UseSongPlayerOptions {
  song: Song
  bpm: number
  /** Metronoomklik op elke tel. */
  metronome: boolean
  /** Akkoorden meespelen (aanslag op tel 1 van elke maat). */
  chords: boolean
  /** Accent op tel 1. */
  accent: boolean
  /** Herhaal de song eindeloos (standaard) of stop na één keer. */
  loop?: boolean
  /** Aantal voortel-tikken vóór de start (0 = geen). */
  countInBeats?: number
  /** Aangeroepen bij elke maatwissel (met de nieuwe maatindex). */
  onMeasureChange?: (measureIndex: number) => void
  /** Aangeroepen telkens als de song één keer volledig is doorlopen. */
  onSongComplete?: () => void
}

/**
 * Speelt een liedje mee af: loopt maat-voor-maat door het akkoordschema met
 * sample-accurate timing (Tone.Transport), klikt de metronoom en slaat het
 * akkoord aan op tel 1. De visuele "playhead" (huidige maat/tel) wordt via
 * Tone.Draw op exact dezelfde audio-tijd bijgewerkt, zodat beeld en geluid
 * strak synchroon blijven — net als in de strumming-trainer.
 */
export function useSongPlayer({
  song,
  bpm,
  metronome,
  chords,
  accent,
  loop = true,
  countInBeats = 0,
  onMeasureChange,
  onSongComplete,
}: UseSongPlayerOptions) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMeasure, setCurrentMeasure] = useState(-1)
  const [currentBeat, setCurrentBeat] = useState(-1)
  const [countingIn, setCountingIn] = useState(false)
  const [countInLeft, setCountInLeft] = useState(0)

  const measures = useMemo(() => flattenSong(song), [song])
  const beats = useMemo(() => buildBeatTimeline(measures), [measures])

  const posRef = useRef(0)
  const countRef = useRef(0)
  const phaseRef = useRef<'countin' | 'play'>('play')
  const eventIdRef = useRef<number | null>(null)

  // Actuele config in een ref zodat de geplande callback altijd de nieuwste
  // waarden ziet zonder het transport-event opnieuw op te bouwen.
  const cfg = useRef({ beats, metronome, chords, accent, loop, countInBeats, onMeasureChange, onSongComplete })
  useEffect(() => {
    cfg.current = { beats, metronome, chords, accent, loop, countInBeats, onMeasureChange, onSongComplete }
  }, [beats, metronome, chords, accent, loop, countInBeats, onMeasureChange, onSongComplete])

  // BPM live bijwerken tijdens het spelen.
  useEffect(() => {
    Tone.getTransport().bpm.value = bpm
  }, [bpm])

  const stop = useCallback(() => {
    const transport = Tone.getTransport()
    if (eventIdRef.current !== null) {
      transport.clear(eventIdRef.current)
      eventIdRef.current = null
    }
    transport.stop()
    transport.cancel(0)
    posRef.current = 0
    countRef.current = 0
    phaseRef.current = 'play'
    setIsPlaying(false)
    setCurrentMeasure(-1)
    setCurrentBeat(-1)
    setCountingIn(false)
    setCountInLeft(0)
  }, [])

  const start = useCallback(async () => {
    await initAudio()
    const transport = Tone.getTransport()
    const draw = Tone.getDraw()

    if (eventIdRef.current !== null) transport.clear(eventIdRef.current)
    transport.cancel(0)
    transport.bpm.value = bpm

    posRef.current = 0
    countRef.current = 0
    phaseRef.current = cfg.current.countInBeats > 0 ? 'countin' : 'play'

    if (phaseRef.current === 'countin') {
      setCountingIn(true)
      setCountInLeft(cfg.current.countInBeats)
    }

    const id = transport.scheduleRepeat((time) => {
      const c = cfg.current

      // --- Voortel-fase ----------------------------------------------------
      if (phaseRef.current === 'countin') {
        click(time, true)
        const left = c.countInBeats - countRef.current
        draw.schedule(() => setCountInLeft(Math.max(0, left)), time)
        countRef.current += 1
        if (countRef.current >= c.countInBeats) {
          phaseRef.current = 'play'
          posRef.current = 0
          draw.schedule(() => {
            setCountingIn(false)
            setCountInLeft(0)
          }, time)
        }
        return
      }

      // --- Speel-fase ------------------------------------------------------
      const len = c.beats.length
      if (len === 0) return
      const i = posRef.current % len
      const beat = c.beats[i]

      if (c.metronome) click(time, c.accent && beat.isDownbeat)
      if (c.chords && beat.isDownbeat) {
        const notes = notesForChord(beat.chord)
        if (notes.length) strumChordAt(notes, time, { duration: '2n' })
      }

      const isLastBeat = i === len - 1
      draw.schedule(() => {
        setCurrentMeasure(beat.measureIndex)
        setCurrentBeat(beat.beatInMeasure)
        if (beat.isDownbeat) c.onMeasureChange?.(beat.measureIndex)
        if (isLastBeat) c.onSongComplete?.()
      }, time)

      posRef.current += 1

      // Stoppen aan het einde wanneer er niet geloopt wordt.
      if (isLastBeat && !c.loop) {
        const dur = Tone.Time('4n').toSeconds()
        transport.scheduleOnce(() => {
          draw.schedule(() => stop(), time + dur)
        }, time + dur)
      }
    }, '4n')

    eventIdRef.current = id
    transport.start()
    setIsPlaying(true)
  }, [bpm, stop])

  const toggle = useCallback(() => {
    if (isPlaying) stop()
    else void start()
  }, [isPlaying, start, stop])

  // Netjes stoppen bij unmount.
  useEffect(() => () => stop(), [stop])

  return {
    isPlaying,
    currentMeasure,
    currentBeat,
    countingIn,
    countInLeft,
    measures,
    start,
    stop,
    toggle,
  }
}
