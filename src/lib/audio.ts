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

function noiseBuffer(ctx: AudioContext, dur: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.max(1, Math.floor(sr * dur));
  const buf = ctx.createBuffer(1, len, sr);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
  return buf;
}

function filteredNoise(
  ctx: AudioContext,
  t: number,
  dur: number,
  vol: number,
  filterType: BiquadFilterType,
  freq: number,
  q: number = 1,
): void {
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const g = ctx.createGain();
  src.buffer = noiseBuffer(ctx, dur);
  filter.type = filterType;
  filter.frequency.value = freq;
  filter.Q.value = q;
  src.connect(filter).connect(g).connect(ctx.destination);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.start(t);
  src.stop(t + dur);
}

function pitchDropOsc(
  ctx: AudioContext,
  t: number,
  startFreq: number,
  endFreq: number,
  vol: number,
  dur: number,
  type: OscillatorType = "sine",
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

function shortClick(
  ctx: AudioContext,
  t: number,
  freq: number,
  vol: number,
  dur: number,
  type: OscillatorType = "sine",
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

function dualSquare(
  ctx: AudioContext,
  t: number,
  f1: number,
  f2: number,
  vol: number,
  dur: number,
): void {
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const g1 = ctx.createGain();
  const g2 = ctx.createGain();
  o1.type = "square";
  o2.type = "square";
  o1.frequency.value = f1;
  o2.frequency.value = f2;
  g1.gain.setValueAtTime(vol, t);
  g1.gain.exponentialRampToValueAtTime(0.001, t + dur);
  g2.gain.setValueAtTime(vol * 0.6, t);
  g2.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o1.connect(g1).connect(ctx.destination);
  o2.connect(g2).connect(ctx.destination);
  o1.start(t);
  o2.start(t);
  o1.stop(t + dur);
  o2.stop(t + dur);
}

function snare(ctx: AudioContext, t: number, vol: number): void {
  pitchDropOsc(ctx, t, 200, 80, vol * 0.6, 0.08, "sine");
  filteredNoise(ctx, t, 0.07, vol * 0.5, "highpass", 1000);
}

function rimshot(ctx: AudioContext, t: number, vol: number): void {
  shortClick(ctx, t, 1800, vol, 0.015);
  filteredNoise(ctx, t, 0.02, vol * 0.3, "bandpass", 2400, 2);
}

function closedHat(ctx: AudioContext, t: number, vol: number): void {
  filteredNoise(ctx, t, 0.03, vol, "highpass", 8000);
}

function cowbell(ctx: AudioContext, t: number, vol: number): void {
  dualSquare(ctx, t, 800, 540, vol, 0.06);
}

function clap(ctx: AudioContext, t: number, vol: number): void {
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const src = ctx.createBufferSource();
  filter.type = "bandpass";
  filter.frequency.value = 1500;
  filter.Q.value = 0.8;
  src.buffer = noiseBuffer(ctx, 0.12);
  src.connect(filter).connect(g).connect(ctx.destination);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  src.start(t);
  src.stop(t + 0.12);
  for (let i = 0; i < 3; i++) {
    filteredNoise(ctx, t + 0.015 * i, 0.03, vol * 0.35, "bandpass", 1500, 0.8);
  }
}

function openHat(ctx: AudioContext, t: number, vol: number): void {
  filteredNoise(ctx, t, 0.08, vol, "highpass", 6000);
}

function clap909(ctx: AudioContext, t: number, vol: number): void {
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const src = ctx.createBufferSource();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 0.7;
  src.buffer = noiseBuffer(ctx, 0.2);
  src.connect(filter).connect(g).connect(ctx.destination);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  src.start(t);
  src.stop(t + 0.2);
  for (let i = 0; i < 5; i++) {
    filteredNoise(ctx, t + 0.008 * i, 0.04, vol * 0.5, "bandpass", 1800, 0.7);
  }
}

function tom(ctx: AudioContext, t: number, vol: number): void {
  pitchDropOsc(ctx, t, 250, 100, vol, 0.06, "sine");
}

function shaker(ctx: AudioContext, t: number, vol: number): void {
  for (let i = 0; i < 4; i++) {
    filteredNoise(ctx, t + i * 0.006, 0.02, vol * 0.4, "bandpass", 4000, 1.5);
  }
}

function clave(ctx: AudioContext, t: number, vol: number): void {
  shortClick(ctx, t, 800, vol, 0.008);
  shortClick(ctx, t + 0.015, 1200, vol * 0.8, 0.008);
}

function maraca(ctx: AudioContext, t: number, vol: number): void {
  filteredNoise(ctx, t, 0.04, vol, "bandpass", 3000, 1.2);
}

function cabasa(ctx: AudioContext, t: number, vol: number): void {
  for (let i = 0; i < 3; i++) {
    filteredNoise(ctx, t + i * 0.004, 0.018, vol * 0.5, "bandpass", 5000, 1.2);
  }
}

export type AccentLevel = 0 | 1 | 2;
export type SoundType = "normal" | "808" | "flstudio" | "analog";

export function createClick(
  accent: AccentLevel,
  soundType: SoundType = "normal",
  volumeMultiplier: number = 1,
): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  switch (soundType) {
    case "normal":
      if (accent === 2) snare(ctx, now, 0.32 * volumeMultiplier);
      else if (accent === 1) rimshot(ctx, now, 0.16 * volumeMultiplier);
      else closedHat(ctx, now, 0.1 * volumeMultiplier);
      break;

    case "808":
      if (accent === 2) cowbell(ctx, now, 0.28 * volumeMultiplier);
      else if (accent === 1) clap(ctx, now, 0.2 * volumeMultiplier);
      else openHat(ctx, now, 0.09 * volumeMultiplier);
      break;

    case "flstudio":
      if (accent === 2) clap909(ctx, now, 0.3 * volumeMultiplier);
      else if (accent === 1) tom(ctx, now, 0.18 * volumeMultiplier);
      else shaker(ctx, now, 0.1 * volumeMultiplier);
      break;

    case "analog":
      if (accent === 2) clave(ctx, now, 0.26 * volumeMultiplier);
      else if (accent === 1) maraca(ctx, now, 0.14 * volumeMultiplier);
      else cabasa(ctx, now, 0.08 * volumeMultiplier);
      break;
  }
}
