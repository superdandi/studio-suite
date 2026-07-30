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

export type SoundType = "normal" | "808" | "flstudio" | "analog";

export function createClick(accent: boolean, soundType: SoundType = "normal"): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  switch (soundType) {
    case "normal":
      oscillatorClick(ctx, now, accent ? 2000 : 1500, accent ? 0.3 : 0.15, 0.03);
      break;

    case "808": {
      if (accent) {
        // TR-808 cowbell: metallic pitched tone
        oscillatorClick(ctx, now, 900, 0.35, 0.04, "square", 800);
        noiseBurst(ctx, now, 0.015, 0.12);
      } else {
        // TR-808 rimshot: noise burst + tonal spike
        oscillatorClick(ctx, now, 1800, 0.2, 0.025, "sine");
        noiseBurst(ctx, now, 0.02, 0.25);
      }
      break;
    }

    case "flstudio": {
      // Bright crisp tick — high sine with very fast decay
      const freq = accent ? 2400 : 2000;
      const vol = accent ? 0.28 : 0.14;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.001);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
      osc.connect(g).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
      break;
    }

    case "analog": {
      // Analog metronome: soft sine pluck with gentle attack
      const freq = accent ? 1000 : 800;
      const vol = accent ? 0.22 : 0.11;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(g).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
      break;
    }
  }
}
