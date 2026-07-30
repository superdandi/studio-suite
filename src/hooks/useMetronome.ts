"use client";

import { useRef, useCallback } from "react";
import { createClick } from "@/lib/audio";
import type { SoundType } from "@/lib/audio";

export type RhythmFigure = "quarter" | "eighth" | "triplet" | "sixteenth" | "quintuplet" | "swing";

const FIGURE_DIVISIONS: Record<RhythmFigure, number> = {
  quarter: 1,
  eighth: 2,
  triplet: 3,
  sixteenth: 4,
  quintuplet: 5,
  swing: 2,
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
      if (isSwing) {
        // Swing timing: within each beat pair, first is 2/3 of sub-interval,
        // second is 1/3 — creates the classic long-short feel
        const posInPair = count % 2;
        delay = posInPair === 0 ? baseMs * (4 / 3) : baseMs * (2 / 3);
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
    const firstDelay = isSwing ? baseMs * (4 / 3) : baseMs;
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
