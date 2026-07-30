"use client";

import { useState, useCallback, useEffect } from "react";
import ToolContainer from "@/components/ToolContainer";
import { useMetronome, type RhythmFigure, type TimeSignature } from "@/hooks/useMetronome";
import type { SoundType } from "@/lib/audio";

const TIME_SIGNATURES: TimeSignature[] = ["4/4", "3/4", "6/8", "2/4", "5/4", "7/8", "9/8"];

const RHYTHM_FIGURES: { value: RhythmFigure; label: string }[] = [
  { value: "quarter", label: "♩ Negra" },
  { value: "eighth", label: "♪ Corcheas" },
  { value: "triplet", label: "♪♪ Tresillos" },
  { value: "sixteenth", label: "♬ Semicorcheas" },
  { value: "quintuplet", label: "5:5 Quintillo" },
  { value: "swing", label: "♫ Swing" },
];

const SOUND_OPTIONS: { value: SoundType; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "808", label: "808" },
  { value: "flstudio", label: "FL Studio" },
  { value: "analog", label: "Analógico" },
];

export default function PulsePanel() {
  const [bpm, setBpm] = useState(120);
  const [figure, setFigure] = useState<RhythmFigure>("quarter");
  const [timeSignature, setTimeSignature] = useState<TimeSignature>("4/4");
  const [soundType, setSoundType] = useState<SoundType>("normal");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const metronome = useMetronome();

  const beatCallback = useCallback((beat: number) => {
    setCurrentBeat(beat);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setCurrentBeat(0);
      return;
    }
    setCurrentBeat(0);
    metronome.start(bpm, figure, beatCallback, soundType, timeSignature);
    return () => metronome.stop();
  }, [bpm, figure, isPlaying, soundType, timeSignature, metronome, beatCallback]);

  const handleStartStop = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const newTimes = [...tapTimes, now].slice(-5);
    setTapTimes(newTimes);
    if (newTimes.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < newTimes.length; i++) {
        intervals.push(newTimes[i] - newTimes[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avg > 200 && avg < 3000) {
        const newBpm = Math.round(60000 / avg);
        setBpm(Math.max(20, Math.min(300, newBpm)));
      }
    }
  }, [tapTimes]);

  return (
    <ToolContainer title="Pulse" icon="⚡">
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-8">
          <div
            className={`h-24 w-24 rounded-full border-2 transition-all duration-75 ${
              isPlaying
                ? "border-[#ff00ff] shadow-[0_0_30px_rgba(255,0,255,0.5)]"
                : "border-[#2a2a4a]"
            } ${isPlaying && currentBeat === 0 ? "bg-[#ff00ff]/20" : ""}`}
          >
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl font-bold font-mono text-[#ff00ff]">
                {bpm}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-[#8888aa]">BPM: {bpm}</label>
          <input
            type="range"
            min={20}
            max={300}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full accent-[#ff00ff]"
          />
          <div className="flex justify-between text-xs text-[#555]">
            <span>20</span>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Math.max(20, Math.min(300, Number(e.target.value))))}
              className="w-16 bg-[#1a1a2e] border border-[#2a2a4a] text-white text-center rounded text-sm"
            />
            <span>300</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-[#8888aa]">Figura rítmica</label>
          <div className="flex flex-wrap gap-2">
            {RHYTHM_FIGURES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFigure(value)}
                className={`px-4 py-2 rounded border text-sm transition-all ${
                  figure === value
                    ? "border-[#ff00ff] text-[#ff00ff] bg-[#ff00ff]/10"
                    : "border-[#2a2a4a] text-[#8888aa] hover:border-[#ff00ff]/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-[#8888aa]">Compás</label>
          <div className="flex flex-wrap gap-2">
            {TIME_SIGNATURES.map((ts) => (
              <button
                key={ts}
                onClick={() => setTimeSignature(ts)}
                className={`px-3 py-1 rounded border text-sm transition-all ${
                  timeSignature === ts
                    ? "border-[#00ffff] text-[#00ffff] bg-[#00ffff]/10"
                    : "border-[#2a2a4a] text-[#8888aa] hover:border-[#00ffff]/50"
                }`}
              >
                {ts}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-[#8888aa]">Sonido</label>
          <div className="flex flex-wrap gap-2">
            {SOUND_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSoundType(value)}
                className={`px-4 py-2 rounded border text-sm transition-all ${
                  soundType === value
                    ? "border-[#ffaa00] text-[#ffaa00] bg-[#ffaa00]/10"
                    : "border-[#2a2a4a] text-[#8888aa] hover:border-[#ffaa00]/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleStartStop}
            className={`flex-1 py-3 rounded font-bold text-sm tracking-wider transition-all ${
              isPlaying
                ? "bg-red-900/50 text-red-400 border border-red-800 hover:bg-red-900/70"
                : "bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff]/50 hover:bg-[#ff00ff]/30"
            }`}
          >
            {isPlaying ? "■ STOP" : "▶ START"}
          </button>
          <button
            onClick={handleTap}
            className="px-6 py-3 rounded font-bold text-sm tracking-wider border border-[#2a2a4a] text-[#00ffff] hover:border-[#00ffff]/50 transition-all"
          >
            TAP
          </button>
        </div>
      </div>
    </ToolContainer>
  );
}
