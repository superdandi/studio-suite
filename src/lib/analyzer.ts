import { detectKey, identifyChord } from "./music-theory";

export interface AnalysisResult {
  spectrum: Uint8Array;
  waveform: Float32Array;
  peaks: { frequency: number; amplitude: number }[];
  pitchClasses: number[];
  chord: string | null;
  key: string | null;
}

export function analyzeFrame(analyser: AnalyserNode, sampleRate: number): AnalysisResult {
  const bufferLength = analyser.frequencyBinCount;
  const spectrum = new Uint8Array(bufferLength);
  const waveform = new Float32Array(bufferLength);
  const timeData = new Float32Array(bufferLength);

  analyser.getByteFrequencyData(spectrum);
  analyser.getFloatTimeDomainData(waveform);
  analyser.getFloatTimeDomainData(timeData);

  const peaks = detectPeaks(spectrum, sampleRate, bufferLength);
  const pitchClasses = peaks.map(p => {
    const midi = Math.round(12 * Math.log2(p.frequency / 440) + 69);
    return midi % 12;
  });

  const chord = identifyChord(pitchClasses);
  const key = detectKey(pitchClasses)?.key ?? null;

  return { spectrum, waveform, peaks, pitchClasses, chord, key };
}

function detectPeaks(
  spectrum: Uint8Array,
  sampleRate: number,
  bufferLength: number,
): { frequency: number; amplitude: number }[] {
  const peaks: { frequency: number; amplitude: number }[] = [];
  const threshold = 30;

  for (let i = 2; i < bufferLength - 2; i++) {
    if (
      spectrum[i] > threshold &&
      spectrum[i] > spectrum[i - 1] &&
      spectrum[i] > spectrum[i + 1] &&
      spectrum[i] > spectrum[i - 2] &&
      spectrum[i] > spectrum[i + 2]
    ) {
      const freq = (i / bufferLength) * (sampleRate / 2);
      peaks.push({ frequency: freq, amplitude: spectrum[i] });
    }
  }

  return peaks.sort((a, b) => b.amplitude - a.amplitude).slice(0, 8);
}
