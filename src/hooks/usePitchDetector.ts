"use client";

import { useRef, useCallback } from "react";
import { yinPitchDetect } from "@/lib/tuner";
import { frequencyToNote } from "@/lib/music-theory";

export interface PitchResult {
  frequency: number;
  note: string;
  octave: number;
  midi: number;
  cents: number;
}

export function usePitchDetector() {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sampleRateRef = useRef(44100);
  const rafRef = useRef<number | null>(null);
  const callbackRef = useRef<((result: PitchResult | null) => void) | null>(null);

  const start = useCallback((
    sourceNode: AudioNode,
    sampleRate: number,
    callback: (result: PitchResult | null) => void,
  ) => {
    const audioCtx = (sourceNode.context || sourceNode.context) as AudioContext;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    sourceNode.connect(analyser);

    analyserRef.current = analyser;
    sampleRateRef.current = sampleRate;
    callbackRef.current = callback;

    const buffer = new Float32Array(analyser.fftSize);

    function detect() {
      analyser.getFloatTimeDomainData(buffer);

      const rms = Math.sqrt(buffer.reduce((sum, v) => sum + v * v, 0) / buffer.length);
      if (rms < 0.01) {
        callbackRef.current?.(null);
      } else {
        const freq = yinPitchDetect(buffer, sampleRateRef.current);
        if (freq && freq > 50 && freq < 2000) {
          const result = frequencyToNote(freq);
          callbackRef.current?.({
            frequency: freq,
            note: result.note,
            octave: result.octave,
            midi: result.midi,
            cents: Math.round(result.cents * 10) / 10,
          });
        } else {
          callbackRef.current?.(null);
        }
      }

      rafRef.current = requestAnimationFrame(detect);
    }

    detect();
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  return { start, stop };
}
