"use client";

import { useCallback } from "react";
import { getAudioContext } from "@/lib/audio";
import { NOTE_NAMES, type NoteName, type ScaleType, getScaleNotes } from "@/lib/music-theory";

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
  const playScale = useCallback((root: NoteName, scaleType: ScaleType) => {
    const notes = getScaleNotes(root, scaleType);
    const ctx = getAudioContext();
    const rootIdx = NOTE_NAMES.indexOf(root);

    notes.forEach((noteName, i) => {
      const noteIdx = NOTE_NAMES.indexOf(noteName);
      let midi = 60 + noteIdx - rootIdx;
      while (midi < 48) midi += 12;
      while (midi > 84) midi -= 12;
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      playNoteFn(freq, 0.25, "sine", 0.3, ctx.currentTime + 0.1 + i * 0.3);
    });
  }, []);

  const playNote = useCallback((noteName: NoteName, octave: number) => {
    const midi = NOTE_NAMES.indexOf(noteName) + (octave + 1) * 12;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    playNoteFn(freq, 0.5, "sine", 0.3);
  }, []);

  return { playScale, playNote };
}
