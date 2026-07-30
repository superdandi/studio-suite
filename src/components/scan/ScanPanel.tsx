"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ToolContainer from "@/components/ToolContainer";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useAnalyzer } from "@/hooks/useAnalyzer";
import { getAudioContext } from "@/lib/audio";
import SpectrumDisplay from "./SpectrumDisplay";
import WaveformDisplay from "./WaveformDisplay";
import AnalysisInfo from "./AnalysisInfo";
import type { AnalysisResult } from "@/lib/analyzer";

type InputMode = "mic" | "file";

export default function ScanPanel() {
  const [mode, setMode] = useState<InputMode>("mic");
  const [isActive, setIsActive] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const mic = useMicrophone();
  const analyzer = useAnalyzer();
  const sourceRef = useRef<AudioNode | null>(null);
  const fileSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const startMic = useCallback(async () => {
    await mic.start();
  }, [mic]);

  useEffect(() => {
    if (mic.stream && mic.isActive) {
      const ctx = getAudioContext();
      const source = ctx.createMediaStreamSource(mic.stream);
      sourceRef.current = source;
      analyzer.start(source, setResult);
      setIsActive(true);
    }
  }, [mic.stream, mic.isActive, analyzer]);

  const stop = useCallback(() => {
    analyzer.stop();
    mic.stop();
    if (fileSourceRef.current) {
      fileSourceRef.current.stop();
      fileSourceRef.current = null;
    }
    setIsActive(false);
    setResult(null);
  }, [analyzer, mic]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ctx = getAudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    source.connect(gain);
    gain.connect(ctx.destination);

    analyzer.start(source, setResult);
    source.start();
    sourceRef.current = source;
    fileSourceRef.current = source;
    setIsActive(true);
  }, [analyzer]);

  return (
    <ToolContainer title="Scan" icon="📊">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => { setMode("mic"); stop(); }}
            className={`px-4 py-2 rounded border text-sm transition-all ${
              mode === "mic"
                ? "border-[#00dd88] text-[#00dd88] bg-[#00dd88]/10"
                : "border-[#2a2a4a] text-[#8888aa]"
            }`}
          >
            🎤 Micrófono
          </button>
          <button
            onClick={() => { setMode("file"); stop(); }}
            className={`px-4 py-2 rounded border text-sm transition-all ${
              mode === "file"
                ? "border-[#00dd88] text-[#00dd88] bg-[#00dd88]/10"
                : "border-[#2a2a4a] text-[#8888aa]"
            }`}
          >
            📁 Archivo
          </button>
        </div>

        {mode === "mic" && (
          <div className="text-center">
            <button
              onClick={isActive ? stop : startMic}
              className={`px-8 py-3 rounded font-bold text-sm tracking-wider transition-all ${
                isActive
                  ? "bg-red-900/50 text-red-400 border border-red-800"
                  : "bg-[#00dd88]/20 text-[#00dd88] border border-[#00dd88]/50 hover:bg-[#00dd88]/30"
              }`}
            >
              {isActive ? "■ DETENER" : "🎤 ACTIVAR MIC"}
            </button>
          </div>
        )}

        {mode === "file" && (
          <div className="text-center">
            <label className="cursor-pointer px-8 py-3 rounded font-bold text-sm tracking-wider border border-[#00dd88]/50 text-[#00dd88] bg-[#00dd88]/10 hover:bg-[#00dd88]/20 transition-all inline-block">
              📁 SUBIR AUDIO
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SpectrumDisplay data={result.spectrum} />
              <WaveformDisplay data={result.waveform} />
            </div>
            <AnalysisInfo result={result} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#8888aa]">
              {isActive
                ? "Procesando señal de audio..."
                : mode === "mic"
                ? "Activa el micrófono para ver el análisis"
                : "Sube un archivo de audio para analizar"}
            </p>
          </div>
        )}
      </div>
    </ToolContainer>
  );
}
