"use client";

import { useRef, useCallback, useMemo } from "react";
import { getAudioContext } from "@/lib/audio";
import {
  midiToFrequency,
  NOTE_NAMES,
  type NoteName,
  type ScaleType,
  getScaleMidiSequence,
} from "@/lib/music-theory";
import type { Piece } from "@/lib/pieces";

export type ScalePlayMode = "asc" | "ascdesc";

function playNoteFn(freq: number, duration: number, type: OscillatorType, volume: number, startTime?: number) {
  const ctx = getAudioContext();
  const now = startTime ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.02);
  gain.gain.linearRampToValueAtTime(0, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

export function useScalePlayer() {
  const timerRef = useRef<number | null>(null);

  const stopScale = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const playScale = useCallback((root: NoteName, scaleType: ScaleType, mode: ScalePlayMode = "asc") => {
    stopScale();
    const freqs = getScaleMidiSequence(root, scaleType, mode).map(midiToFrequency);

    let i = 0;

    function scheduleNext() {
      playNoteFn(freqs[i], 0.25, "sine", 0.3);
      i = (i + 1) % freqs.length;
      timerRef.current = window.setTimeout(scheduleNext, 300);
    }

    playNoteFn(freqs[0], 0.25, "sine", 0.3);
    i = 1;
    timerRef.current = window.setTimeout(scheduleNext, 300);
  }, [stopScale]);

  const playNote = useCallback((noteName: NoteName, octave: number) => {
    const midi = NOTE_NAMES.indexOf(noteName) + (octave + 1) * 12;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    playNoteFn(freq, 0.5, "sine", 0.3);
  }, []);

  const playPiece = useCallback((piece: Piece, onNote: (midi: number | null) => void) => {
    stopScale();
    const beatMs = 60000 / piece.tempo;

    let i = 0;

    function scheduleNext() {
      const note = piece.notes[i];
      if (note.midi !== null) {
        const freq = midiToFrequency(note.midi);
        playNoteFn(freq, Math.min(0.6, note.beats * beatMs * 0.001), "sine", 0.3);
      }
      onNote(note.midi);
      i = (i + 1) % piece.notes.length;
      timerRef.current = window.setTimeout(scheduleNext, note.beats * beatMs);
    }

    const first = piece.notes[0];
    if (first.midi !== null) {
      playNoteFn(midiToFrequency(first.midi), Math.min(0.6, first.beats * beatMs * 0.001), "sine", 0.3);
    }
    onNote(first.midi);
    i = 1;
    timerRef.current = window.setTimeout(scheduleNext, first.beats * beatMs);
  }, [stopScale]);

  return useMemo(
    () => ({ playScale, stopScale, playNote, playPiece }),
    [playScale, stopScale, playNote, playPiece],
  );
}
