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

export function createClick(accent: boolean): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = accent ? 2000 : 1500;
  gain.gain.setValueAtTime(accent ? 0.3 : 0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.03);
}
