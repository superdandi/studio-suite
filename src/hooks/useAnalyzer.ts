"use client";

import { useRef, useCallback } from "react";
import { analyzeFrame, AnalysisResult } from "@/lib/analyzer";

export function useAnalyzer() {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sampleRateRef = useRef(44100);
  const rafRef = useRef<number | null>(null);
  const callbackRef = useRef<((result: AnalysisResult) => void) | null>(null);

  const start = useCallback((
    sourceNode: AudioNode,
    callback: (result: AnalysisResult) => void,
  ) => {
    const audioCtx = sourceNode.context as AudioContext;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    sourceNode.connect(analyser);

    analyserRef.current = analyser;
    sampleRateRef.current = audioCtx.sampleRate;
    callbackRef.current = callback;

    function analyze() {
      if (analyserRef.current) {
        const result = analyzeFrame(analyserRef.current, sampleRateRef.current);
        callbackRef.current?.(result);
      }
      rafRef.current = requestAnimationFrame(analyze);
    }

    analyze();
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  return { start, stop };
}
