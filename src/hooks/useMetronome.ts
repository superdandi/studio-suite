"use client";

import { useRef, useCallback } from "react";
import { createClick } from "@/lib/audio";

export type RhythmFigure = "quarter" | "eighth" | "triplet" | "sixteenth";

const FIGURE_DIVISIONS: Record<RhythmFigure, number> = {
  quarter: 1,
  eighth: 2,
  triplet: 3,
  sixteenth: 4,
};

export function useMetronome() {
  const intervalRef = useRef<number | null>(null);
  const beatRef = useRef(0);
  const subdivisionsRef = useRef(1);
  const callbackRef = useRef<((beat: number, subdivision: number, totalSub: number) => void) | null>(null);

  const start = useCallback((
    bpm: number,
    figure: RhythmFigure,
    callback: (beat: number, subdivision: number, totalSub: number) => void,
  ) => {
    const divisions = FIGURE_DIVISIONS[figure];
    subdivisionsRef.current = divisions;
    callbackRef.current = callback;
    beatRef.current = 0;

    const intervalMs = (60000 / bpm) / divisions;

    // Schedule first click immediately
    createClick(true);
    callback(0, 0, divisions);

    let count = 0;
    intervalRef.current = window.setInterval(() => {
      count++;
      const isAccent = count % divisions === 0;
      createClick(isAccent);
      callbackRef.current?.(Math.floor(count / divisions), count % divisions, divisions);
    }, intervalMs);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { start, stop };
}
