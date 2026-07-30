"use client";

import { useRef, useCallback } from "react";
import { createClick } from "@/lib/audio";
import type { SoundType } from "@/lib/audio";

export type RhythmFigure = "quarter" | "eighth" | "triplet" | "sixteenth" | "quintuplet" | "swing" | "dotted";

const FIGURE_DIVISIONS: Record<RhythmFigure, number> = {
  quarter: 1,
  eighth: 2,
  triplet: 3,
  sixteenth: 4,
  quintuplet: 5,
  swing: 2,
  dotted: 2,
};

export type TimeSignature = "4/4" | "3/4" | "6/8" | "2/4" | "5/4" | "7/8" | "9/8";

const BEATS_PER_BAR: Record<TimeSignature, number> = {
  "4/4": 4,
  "3/4": 3,
  "6/8": 2,
  "2/4": 2,
  "5/4": 5,
  "7/8": 7,
  "9/8": 3,
};

export function useMetronome() {
  const timerRef = useRef<number | null>(null);

  const start = useCallback((
    bpm: number,
    figure: RhythmFigure,
    callback: (beat: number, subdivision: number, totalSub: number) => void,
    soundType: SoundType = "normal",
    timeSignature: TimeSignature = "4/4",
  ) => {
    const divisions = FIGURE_DIVISIONS[figure];
    const beatsPerBar = BEATS_PER_BAR[timeSignature];
    const isSwing = figure === "swing";
    const isDotted = figure === "dotted";

    // Base ms per subdivision (regular)
    const baseMs = (60000 / bpm) / divisions;

    let count = 0;

    function scheduleNext() {
      const isAccent = count % divisions === 0;
      createClick(isAccent, soundType);

      const beat = Math.floor(count / divisions) % beatsPerBar;
      const sub = count % divisions;
      callback(beat, sub, divisions);

      count++;

      // Calculate delay for the *next* tick
      let delay: number;
      const posInPair = count % 2;
      if (isSwing) {
        // Swing: 2:1 ratio — first gets 2/3, second gets 1/3
        delay = posInPair === 0 ? baseMs * (4 / 3) : baseMs * (2 / 3);
      } else if (isDotted) {
        // Dotted (3:1 ratio) — first gets 3/4, second gets 1/4
        delay = posInPair === 0 ? baseMs * 1.5 : baseMs * 0.5;
      } else {
        delay = baseMs;
      }

      timerRef.current = window.setTimeout(scheduleNext, delay);
    }

    // First tick fires immediately (no delay)
    createClick(true, soundType);
    callback(0, 0, divisions);
    count = 1;

    // Schedule second tick with proper timing
    const firstDelay = isSwing ? baseMs * (4 / 3) : isDotted ? baseMs * 1.5 : baseMs;
    timerRef.current = window.setTimeout(scheduleNext, firstDelay);
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { start, stop };
}
