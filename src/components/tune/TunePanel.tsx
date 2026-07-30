"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ToolContainer from "@/components/ToolContainer";
import { useMicrophone } from "@/hooks/useMicrophone";
import { usePitchDetector, type PitchResult } from "@/hooks/usePitchDetector";
import { createReferenceTone, getAudioContext } from "@/lib/audio";
import { GUITAR_STRINGS, BASS_STRINGS } from "@/lib/music-theory";

type TunerMode = "chromatic" | "guitar" | "bass";

export default function TunePanel() {
  const [mode, setMode] = useState<TunerMode>("chromatic");
  const [pitch, setPitch] = useState<PitchResult | null>(null);
  const mic = useMicrophone();
  const detector = usePitchDetector();
  const sourceRef = useRef<AudioNode | null>(null);
  const isListening = mic.isActive;

  const toggleListening = useCallback(async () => {
    if (isListening) {
      detector.stop();
      mic.stop();
      setPitch(null);
    } else {
      await mic.start();
    }
  }, [isListening, detector, mic]);

  useEffect(() => {
    if (mic.stream && mic.isActive) {
      const ctx = getAudioContext();
      const source = ctx.createMediaStreamSource(mic.stream);
      sourceRef.current = source;
      detector.start(source, ctx.sampleRate, setPitch);
    }
  }, [mic.stream, mic.isActive, detector]);

  const playReference = useCallback((freq: number) => {
    createReferenceTone(freq);
  }, []);

  const centsToPercent = (cents: number): number => {
    return Math.max(0, Math.min(100, ((cents + 50) / 100) * 100));
  };

  const getCentsColor = (cents: number): string => {
    const abs = Math.abs(cents);
    if (abs < 5) return "text-[#00dd88]";
    if (abs < 10) return "text-[#ffaa00]";
    return "text-[#ff00ff]";
  };

  const _getTuningInfo = (midi: number): { stringIndex: number; stringName: string } | null => {
    if (mode === "chromatic") return null;
    const strings = mode === "guitar" ? GUITAR_STRINGS : BASS_STRINGS;
    for (let i = 0; i < strings.length; i++) {
      if (strings[i].midi === midi) {
        return { stringIndex: i, stringName: `${strings[i].note}${strings[i].octave}` };
      }
    }
    return null;
  };

  return (
    <ToolContainer title="Tune" icon="🎵">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { value: "chromatic", label: "Cromático" },
            { value: "guitar", label: "Guitarra" },
            { value: "bass", label: "Bajo" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMode(value as TunerMode)}
              className={`px-4 py-2 rounded border text-sm transition-all ${
                mode === value
                  ? "border-[#00ffff] text-[#00ffff] bg-[#00ffff]/10"
                  : "border-[#2a2a4a] text-[#8888aa] hover:border-[#00ffff]/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode !== "chromatic" && (
          <div className="flex justify-center gap-2">
            {(mode === "guitar" ? GUITAR_STRINGS : BASS_STRINGS).map((s, i) => (
              <button
                key={i}
                onClick={() => playReference(440 * Math.pow(2, (s.midi - 69) / 12))}
                className={`px-3 py-1 rounded border text-xs transition-all ${
                  pitch && pitch.midi === s.midi
                    ? "border-[#00dd88] text-[#00dd88] bg-[#00dd88]/10"
                    : "border-[#2a2a4a] text-[#8888aa]"
                }`}
              >
                {s.note}{s.octave}
              </button>
            ))}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={toggleListening}
            className={`px-8 py-3 rounded font-bold text-sm tracking-wider transition-all ${
              isListening
                ? "bg-red-900/50 text-red-400 border border-red-800"
                : "bg-[#00ffff]/20 text-[#00ffff] border border-[#00ffff]/50 hover:bg-[#00ffff]/30"
            }`}
          >
            {isListening ? "■ DETENER" : "🎤 ACTIVAR MIC"}
          </button>
        </div>

        {pitch ? (
          <div className="text-center space-y-4">
            <div>
              <span className="text-7xl font-mono font-bold glow-cyan">
                {pitch.note}
              </span>
              <span className="text-3xl font-mono text-[#8888aa]">
                {pitch.octave}
              </span>
            </div>

            <div className="text-lg font-mono text-[#8888aa]">
              {pitch.frequency.toFixed(1)} Hz
            </div>

            <div className="space-y-2">
              <div className="relative h-4 bg-[#1a1a2e] rounded-full overflow-hidden border border-[#2a2a4a]">
                <div
                  className="absolute top-0 left-1/2 w-1 h-full bg-white transform -translate-x-1/2"
                />
                <div
                  className={`h-full transition-all duration-100 rounded-full ${
                    Math.abs(pitch.cents) < 5 ? "bg-[#00dd88]" : Math.abs(pitch.cents) < 10 ? "bg-[#ffaa00]" : "bg-[#ff00ff]"
                  }`}
                  style={{ width: `${centsToPercent(pitch.cents)}%` }}
                />
              </div>
              <span className={`text-2xl font-mono font-bold ${getCentsColor(pitch.cents)}`}>
                {pitch.cents > 0 ? "+" : ""}{pitch.cents}¢
              </span>
            </div>

            {mode !== "chromatic" && (
              <div className="flex justify-center gap-2">
                {(mode === "guitar" ? GUITAR_STRINGS : BASS_STRINGS).map((s, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded border flex items-center justify-center text-xs font-mono transition-all ${
                      pitch.midi === s.midi
                        ? "border-[#00dd88] text-[#00dd88] bg-[#00dd88]/10 shadow-[0_0_10px_rgba(0,221,136,0.3)]"
                        : "border-[#2a2a4a] text-[#555]"
                    }`}
                  >
                    {s.note}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[#8888aa]">
              {isListening ? "Escuchando..." : "Activa el micrófono para empezar"}
            </p>
          </div>
        )}
      </div>
    </ToolContainer>
  );
}
