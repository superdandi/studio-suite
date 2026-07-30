"use client";

import { useState, useCallback, useRef } from "react";
import ToolContainer from "@/components/ToolContainer";
import IntervalCircle from "./IntervalCircle";
import { playInterval } from "@/lib/audio";
import { INTERVALS } from "@/lib/music-theory";

type EarMode = "explore" | "practice" | "challenge-10s" | "challenge-3s";

export default function EarPanel() {
  const [mode, setMode] = useState<EarMode>("explore");
  const [selectedInterval, setSelectedInterval] = useState<number | null>(null);
  const [currentInterval, setCurrentInterval] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const startTimer = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const playRandomInterval = useCallback(() => {
    const baseNote = Math.floor(Math.random() * 12);
    const semitones = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12][Math.floor(Math.random() * 12)];
    const baseFreq = 440 * Math.pow(2, ((baseNote + 69) - 69) / 12);
    const targetFreq = 440 * Math.pow(2, ((baseNote + semitones + 69) - 69) / 12);

    playInterval(baseFreq, targetFreq, 1.5, "sine");
    setCurrentInterval(semitones);
    setSelectedInterval(null);
    setMessage("");

    if (mode === "challenge-10s") startTimer(10);
    else if (mode === "challenge-3s") startTimer(3);
  }, [mode, startTimer]);

  const handleAnswer = useCallback((semitones: number) => {
    if (mode === "explore") {
      setSelectedInterval(semitones);
      setMessage(INTERVALS[semitones]?.name || "");
      return;
    }

    if (currentInterval === null) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = semitones === currentInterval;
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    setMessage(isCorrect
      ? `✓ Correcto! ${INTERVALS[currentInterval]?.name}`
      : `✗ Era ${INTERVALS[currentInterval]?.name}`);
    setCurrentInterval(null);
    setTimeLeft(null);
  }, [mode, currentInterval]);

  return (
    <ToolContainer title="Ear" icon="👂">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { value: "explore", label: "Explorar" },
            { value: "practice", label: "Práctica" },
            { value: "challenge-10s", label: "Reto 10s" },
            { value: "challenge-3s", label: "Reto 3s" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setMode(value as EarMode); setCurrentInterval(null); setMessage(""); }}
              className={`px-4 py-2 rounded border text-sm transition-all ${
                mode === value
                  ? "border-[#ff00ff] text-[#ff00ff] bg-[#ff00ff]/10"
                  : "border-[#2a2a4a] text-[#8888aa] hover:border-[#ff00ff]/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {(mode === "practice" || mode.startsWith("challenge")) && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={playRandomInterval}
              className="px-6 py-3 rounded font-bold text-sm tracking-wider border border-[#00ffff]/50 text-[#00ffff] bg-[#00ffff]/10 hover:bg-[#00ffff]/20 transition-all"
            >
              ▶ NUEVO INTERVALO
            </button>
            {timeLeft !== null && (
              <span className={`text-2xl font-mono font-bold ${timeLeft <= 3 ? "text-red-400" : "text-[#ffaa00]"}`}>
                {timeLeft}s
              </span>
            )}
            <span className="text-sm text-[#8888aa]">
              {score.correct}/{score.total}
            </span>
          </div>
        )}

        {message && (
          <div className={`text-center text-lg font-bold font-mono ${
            message.startsWith("✓") ? "text-[#00dd88]" : message.startsWith("✗") ? "text-[#ff00ff]" : "text-[#00ffff]"
          }`}>
            {message}
          </div>
        )}

        <div className="flex justify-center">
          <IntervalCircle
            selectedInterval={selectedInterval}
            currentInterval={currentInterval}
            onIntervalClick={handleAnswer}
          />
        </div>

        {mode === "explore" && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {INTERVALS.filter((_, i) => i > 0).map((interval) => (
              <button
                key={interval.semitones}
                onClick={() => {
                  handleAnswer(interval.semitones);
                  const baseNote = Math.floor(Math.random() * 12);
                  const baseFreq = 440 * Math.pow(2, (baseNote - 9) / 12);
                  const targetFreq = 440 * Math.pow(2, ((baseNote + interval.semitones) - 9) / 12);
                  playInterval(baseFreq, targetFreq, 1, "sine");
                }}
                className={`px-2 py-2 rounded border text-xs transition-all ${
                  selectedInterval === interval.semitones
                    ? "border-[#00ffff] text-[#00ffff] bg-[#00ffff]/10"
                    : "border-[#2a2a4a] text-[#8888aa] hover:border-[#00ffff]/50"
                }`}
              >
                <span className="block font-mono">{interval.short}</span>
                <span className="block text-[10px]">{interval.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </ToolContainer>
  );
}
