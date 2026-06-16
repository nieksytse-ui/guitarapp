import { useCallback, useEffect, useRef, useState } from 'react'
import { Tone, click, initAudio, mutedStrumAt, strumChordAt } from '@/lib/audio/engine'
import { beatIndices } from '@/data/strummingPatterns'
import type { StrummingPattern } from '@/lib/types'

interface UseStrummingPlayerOptions {
  pattern: StrummingPattern
  bpm: number
  /** Akkoordnoten die op D/U worden gespeeld (leeg = alleen metronoom). */
  chordNotes?: string[]
  metronome: boolean
  accent: boolean
  /** Callback telkens als een volledige maat is afgerond (voor XP/tellen). */
  onBarComplete?: () => void
}

/**
 * Speelt een strumming-patroon af met sample-accurate timing.
 *
 * Waarom Tone.Transport i.p.v. setInterval? De audio-klok van de browser loopt
 * onafhankelijk van JavaScript-timers. Door events vooruit te plannen op de
 * transport (`scheduleRepeat`) en de visuele playhead via `Tone.getDraw()` op
 * exact dezelfde audio-tijd te updaten, blijven beeld en geluid strak synchroon —
 * ook als de main-thread even druk is.
 */
export function useStrummingPlayer({
  pattern,
  bpm,
  chordNotes,
  metronome,
  accent,
  onBarComplete,
}: UseStrummingPlayerOptions) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)

  const stepRef = useRef(0)
  const eventIdRef = useRef<number | null>(null)

  // De laatste props in een ref, zodat de geplande callback altijd de actuele
  // waarden gebruikt zonder dat we het transport-event opnieuw hoeven op te bouwen.
  const cfg = useRef({ pattern, chordNotes, metronome, accent, onBarComplete })
  useEffect(() => {
    cfg.current = { pattern, chordNotes, metronome, accent, onBarComplete }
  }, [pattern, chordNotes, metronome, accent, onBarComplete])

  // BPM live bijwerken terwijl er gespeeld wordt.
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
    stepRef.current = 0
    setIsPlaying(false)
    setCurrentStep(-1)
  }, [])

  const start = useCallback(async () => {
    await initAudio()
    const transport = Tone.getTransport()
    const draw = Tone.getDraw()

    // Schoon eventueel vorig event op.
    if (eventIdRef.current !== null) transport.clear(eventIdRef.current)

    transport.bpm.value = bpm
    stepRef.current = 0

    const id = transport.scheduleRepeat((time) => {
      const { pattern, chordNotes, metronome, accent, onBarComplete } = cfg.current
      const len = pattern.cells.length
      const i = stepRef.current % len
      const cell = pattern.cells[i]

      // Metronoom op de hoofdtellen, accent op tel 1.
      if (metronome && beatIndices(pattern.timeSignature).includes(i)) {
        click(time, accent && i === 0)
      }

      // Aanslag van het (optionele) akkoord.
      if (chordNotes && chordNotes.length > 0) {
        if (cell === 'D') strumChordAt(chordNotes, time, { up: false })
        else if (cell === 'U') strumChordAt(chordNotes, time, { up: true })
        else if (cell === 'X') mutedStrumAt(time)
      } else if (cell === 'X') {
        mutedStrumAt(time)
      }

      // Visuele playhead exact op de audio-tijd updaten.
      const drawIndex = i
      const isLast = i === len - 1
      draw.schedule(() => {
        setCurrentStep(drawIndex)
        if (isLast) onBarComplete?.()
      }, time)

      stepRef.current += 1
    }, '8n')

    eventIdRef.current = id
    transport.start()
    setIsPlaying(true)
  }, [bpm])

  const toggle = useCallback(() => {
    if (isPlaying) stop()
    else void start()
  }, [isPlaying, start, stop])

  // Stop netjes bij unmount.
  useEffect(() => () => stop(), [stop])

  return { isPlaying, currentStep, start, stop, toggle }
}
