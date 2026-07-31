"use client";

import { useRef, useCallback } from "react";
import { getAudioContext } from "@/lib/audio";
import { NOTE_NAMES, type NoteName, type ScaleType, getScaleNotes } from "@/lib/music-theory";

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
    const notes = getScaleNotes(root, scaleType);
    const rootIdx = NOTE_NAMES.indexOf(root);

    const freqs = notes.map((noteName) => {
      const noteIdx = NOTE_NAMES.indexOf(noteName);
      let midi = 60 + noteIdx - rootIdx;
      while (midi < 48) midi += 12;
      while (midi > 84) midi -= 12;
      return 440 * Math.pow(2, (midi - 69) / 12);
    });

    const sequence: number[] =
      mode === "asc" ? freqs : [...freqs, ...freqs.slice(0, -1).reverse()];

    let i = 0;

    function scheduleNext() {
      playNoteFn(sequence[i], 0.25, "sine", 0.3);
      i = (i + 1) % sequence.length;
      timerRef.current = window.setTimeout(scheduleNext, 300);
    }

    playNoteFn(sequence[0], 0.25, "sine", 0.3);
    i = 1;
    timerRef.current = window.setTimeout(scheduleNext, 300);
  }, [stopScale]);

  const playNote = useCallback((noteName: NoteName, octave: number) => {
    const midi = NOTE_NAMES.indexOf(noteName) + (octave + 1) * 12;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    playNoteFn(freq, 0.5, "sine", 0.3);
  }, []);

  return { playScale, stopScale, playNote };
}
