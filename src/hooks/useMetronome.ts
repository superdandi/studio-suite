"use client";

import { useRef, useCallback } from "react";
import { createClick } from "@/lib/audio";
import type { AccentLevel, SoundType } from "@/lib/audio";

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

const EIGHTHS_PER_BAR: Record<TimeSignature, number> = {
  "2/4": 4,
  "3/4": 6,
  "4/4": 8,
  "5/4": 10,
  "6/8": 6,
  "7/8": 7,
  "9/8": 9,
};

const DISPLAY_BEATS: Record<TimeSignature, number> = {
  "2/4": 2,
  "3/4": 3,
  "4/4": 4,
  "5/4": 5,
  "6/8": 2,
  "7/8": 7,
  "9/8": 3,
};

const ACCENT_PATTERNS: Record<TimeSignature, AccentLevel[]> = {
  "2/4": [2, 0, 0, 0],
  "3/4": [2, 0, 0, 0, 0, 0],
  "4/4": [2, 0, 0, 0, 1, 0, 0, 0],
  "5/4": [2, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  "6/8": [2, 0, 0, 1, 0, 0],
  "7/8": [2, 0, 1, 0, 1, 0, 0],
  "9/8": [2, 0, 0, 1, 0, 0, 1, 0, 0],
};

export function useMetronome() {
  const timerRef = useRef<number | null>(null);

  const start = useCallback((
    bpm: number,
    figure: RhythmFigure,
    callback: (beat: number, subdivision: number, totalSub: number) => void,
    soundType: SoundType = "normal",
    timeSignature: TimeSignature = "4/4",
    volume: number = 0.75,
  ) => {
    const divisions = FIGURE_DIVISIONS[figure];
    const eighthsPerBar = EIGHTHS_PER_BAR[timeSignature];
    const pattern = ACCENT_PATTERNS[timeSignature];
    const isSwing = figure === "swing";
    const isDotted = figure === "dotted";

    const baseMs = (60000 / bpm) / divisions;

    let count = 0;

    function scheduleNext() {
      const eighthPos = Math.floor((count * 2) / divisions);
      const barEighth = eighthPos % eighthsPerBar;
      const isBeatStart = count % divisions === 0;
      const accentLevel: AccentLevel = isBeatStart ? pattern[barEighth] : 0;
      createClick(accentLevel, soundType, volume);

      const quarterBeat = Math.floor(count / divisions) % DISPLAY_BEATS[timeSignature];
      const sub = count % divisions;
      callback(quarterBeat, sub, divisions);

      count++;

      let delay: number;
      const posInPair = count % 2;
      if (isSwing) {
        delay = posInPair === 0 ? baseMs * (4 / 3) : baseMs * (2 / 3);
      } else if (isDotted) {
        delay = posInPair === 0 ? baseMs * 1.5 : baseMs * 0.5;
      } else {
        delay = baseMs;
      }

      timerRef.current = window.setTimeout(scheduleNext, delay);
    }

    createClick(2, soundType, volume);
    callback(0, 0, divisions);
    count = 1;

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
