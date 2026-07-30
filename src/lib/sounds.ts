let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function burst(
  freq: number,
  freqEnd: number | null,
  dur: number,
  gain: number,
  noiseDur: number,
  noiseGain: number,
) {
  const c = getCtx();
  const now = c.currentTime;

  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(c.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, now);
  if (freqEnd != null)
    osc.frequency.exponentialRampToValueAtTime(freqEnd, now + dur);
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.start(now);
  osc.stop(now + dur);

  if (noiseDur <= 0) return;
  const sr = c.sampleRate;
  const buf = c.createBuffer(1, sr * noiseDur, sr);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  const ng = c.createGain();
  src.buffer = buf;
  src.connect(ng);
  ng.connect(c.destination);
  ng.gain.setValueAtTime(noiseGain, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + noiseDur);
  src.start(now);
  src.stop(now + noiseDur);
}

export function playHoverEnter() {
  burst(200, null, 0.05, 0.1, 0.03, 0.06);
}

export function playHoverLeave() {
  burst(250, 100, 0.04, 0.06, 0.02, 0.04);
}

export function playClick() {
  burst(120, null, 0.08, 0.15, 0.05, 0.1);
}
