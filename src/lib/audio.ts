let sharedCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedCtx) sharedCtx = new AudioContext();
  if (sharedCtx.state === "suspended") sharedCtx.resume();
  return sharedCtx;
}

export function playNote(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3,
  startTime?: number,
): void {
  const ctx = getAudioContext();
  const now = startTime ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.02);
  gain.gain.setValueAtTime(volume, now + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

export function playInterval(
  freq1: number,
  freq2: number,
  duration: number,
  type: OscillatorType = "sine",
): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime + 0.05;
  playNote(freq1, duration, type, 0.25, now);
  playNote(freq2, duration, type, 0.25, now);
}

export function createReferenceTone(freq: number): void {
  playNote(freq, 1.5, "sine", 0.2);
}

function noiseBurst(ctx: AudioContext, t: number, dur: number, vol: number): void {
  const sr = ctx.sampleRate;
  const len = Math.max(1, Math.floor(sr * dur));
  const buf = ctx.createBuffer(1, len, sr);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  src.buffer = buf;
  src.connect(g).connect(ctx.destination);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.start(t);
  src.stop(t + dur);
}

function oscillatorClick(
  ctx: AudioContext,
  t: number,
  freq: number,
  vol: number,
  dur: number,
  type: OscillatorType = "square",
  pitchEnd?: number,
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  if (pitchEnd !== undefined) {
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(pitchEnd, t + 0.005);
  } else {
    osc.frequency.value = freq;
  }
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

export type AccentLevel = 0 | 1 | 2;
export type SoundType = "normal" | "808" | "flstudio" | "analog";

export function createClick(accent: AccentLevel, soundType: SoundType = "normal"): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  switch (soundType) {
    case "normal": {
      const DUR = 0.020;
      const map: Record<AccentLevel, { freq: number; vol: number; type: OscillatorType }> = {
        2: { freq: 2000, vol: 0.30, type: "square" },
        1: { freq: 1200, vol: 0.10, type: "triangle" },
        0: { freq: 600, vol: 0.03, type: "sine" },
      };
      const { freq, vol, type } = map[accent];
      oscillatorClick(ctx, now, freq, vol, DUR, type);
      break;
    }

    case "808": {
      const DUR = 0.035;
      if (accent === 2) {
        oscillatorClick(ctx, now, 900, 0.35, DUR, "square", 800);
        noiseBurst(ctx, now, 0.015, 0.12);
      } else if (accent === 1) {
        oscillatorClick(ctx, now, 1800, 0.20, DUR, "sine");
        noiseBurst(ctx, now, 0.020, 0.25);
      } else {
        oscillatorClick(ctx, now, 200, 0.03, DUR, "sine");
      }
      break;
    }

    case "flstudio": {
      const DUR = 0.018;
      const map: Record<AccentLevel, { freq: number; vol: number; type: OscillatorType }> = {
        2: { freq: 2400, vol: 0.28, type: "sine" },
        1: { freq: 1000, vol: 0.07, type: "triangle" },
        0: { freq: 500, vol: 0.02, type: "sine" },
      };
      const { freq, vol, type } = map[accent];
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.001);
      g.gain.exponentialRampToValueAtTime(0.001, now + DUR);
      osc.connect(g).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + DUR);
      break;
    }

    case "analog": {
      const DUR = 0.080;
      const map: Record<AccentLevel, { freq: number; vol: number; type: OscillatorType }> = {
        2: { freq: 1000, vol: 0.22, type: "sine" },
        1: { freq: 700, vol: 0.07, type: "triangle" },
        0: { freq: 300, vol: 0.02, type: "sine" },
      };
      const { freq, vol, type } = map[accent];
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.001, now + DUR);
      osc.connect(g).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + DUR);
      break;
    }
  }
}
