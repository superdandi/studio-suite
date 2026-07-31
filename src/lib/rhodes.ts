"use client";

import { getAudioContext } from "@/lib/audio";

export interface RhodesSettings {
  volume: number;
  tremoloRate: number;
  tremoloDepth: number;
  bass: number;
  treble: number;
  decay: number;
  drive: number;
  brightness: number;
  chorusRate: number;
  chorusDepth: number;
  keyClick: number;
  attack: number;
  reverb: number;
}

export const RHODES_DEFAULTS: RhodesSettings = {
  volume: 0.3,
  tremoloRate: 4,
  tremoloDepth: 0,
  bass: 0,
  treble: 0,
  decay: 1,
  drive: 0,
  brightness: 20000,
  chorusRate: 0.8,
  chorusDepth: 0,
  keyClick: 0,
  attack: 0.005,
  reverb: 0,
};

const DRIVE_CURVE_SIZE = 1024;
const CHORUS_DELAY_BASE = 0.022;
const CHORUS_LFO_DEPTH = 0.004;
const BRIGHTNESS_MIN = 500;
const BRIGHTNESS_MAX = 20000;

interface RhodesBus {
  input: GainNode;
  drive: WaveShaperNode;
  brightness: BiquadFilterNode;
  bass: BiquadFilterNode;
  treble: BiquadFilterNode;
  chorusDry: GainNode;
  chorusWet: GainNode;
  chorusDelay: DelayNode;
  chorusLfo: OscillatorNode;
  chorusLfoGain: GainNode;
  tremoloGain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
  reverbWet: GainNode;
  reverbDry: GainNode;
  master: GainNode;
}

let bus: RhodesBus | null = null;
let current = { ...RHODES_DEFAULTS };
let clickBuffer: AudioBuffer | null = null;

export function driveCurveFor(drive: number): Float32Array<ArrayBuffer> {
  const k = drive <= 0 ? 0 : 1 + drive * 10;
  const curve = new Float32Array(DRIVE_CURVE_SIZE);
  const tanhK = Math.tanh(k);
  for (let i = 0; i < DRIVE_CURVE_SIZE; i++) {
    const x = (i / (DRIVE_CURVE_SIZE - 1)) * 2 - 1;
    curve[i] = k === 0 ? x : Math.tanh(k * x) / tanhK;
  }
  return curve;
}

export function brightnessCutoff(pos: number): number {
  const t = Math.min(1, Math.max(0, pos));
  return BRIGHTNESS_MIN * Math.pow(BRIGHTNESS_MAX / BRIGHTNESS_MIN, t);
}

function getClickBuffer(ctx: AudioContext): AudioBuffer {
  if (clickBuffer) return clickBuffer;
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * 0.05);
  const buf = ctx.createBuffer(1, len, sr);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.01));
  }
  clickBuffer = buf;
  return buf;
}

function getRhodesBus(): RhodesBus {
  if (bus) return bus;
  const ctx = getAudioContext();

  const input = ctx.createGain();

  const drive = ctx.createWaveShaper();
  drive.curve = driveCurveFor(current.drive);
  drive.oversample = "4x";

  const brightness = ctx.createBiquadFilter();
  brightness.type = "lowpass";
  brightness.frequency.value = current.brightness;

  const bass = ctx.createBiquadFilter();
  bass.type = "lowshelf";
  bass.frequency.value = 250;
  bass.gain.value = current.bass;

  const treble = ctx.createBiquadFilter();
  treble.type = "highshelf";
  treble.frequency.value = 4000;
  treble.gain.value = current.treble;

  const chorusDry = ctx.createGain();
  chorusDry.gain.value = 1;
  const chorusWet = ctx.createGain();
  chorusWet.gain.value = current.chorusDepth;
  const chorusDelay = ctx.createDelay(0.1);
  chorusDelay.delayTime.value = CHORUS_DELAY_BASE;
  const chorusLfo = ctx.createOscillator();
  chorusLfo.type = "sine";
  chorusLfo.frequency.value = current.chorusRate;
  const chorusLfoGain = ctx.createGain();
  chorusLfoGain.gain.value = CHORUS_LFO_DEPTH;
  chorusLfo.connect(chorusLfoGain);
  chorusLfoGain.connect(chorusDelay.delayTime);
  chorusLfo.start();

  const tremoloGain = ctx.createGain();
  tremoloGain.gain.value = 1;

  const reverbDry = ctx.createGain();
  reverbDry.gain.value = 1;
  const reverbWet = ctx.createGain();
  reverbWet.gain.value = current.reverb;
  const convolver = ctx.createConvolver();
  convolver.buffer = buildReverbIR(ctx);

  const master = ctx.createGain();
  master.gain.value = current.volume;

  input.connect(drive);
  drive.connect(brightness);
  brightness.connect(bass);
  bass.connect(treble);
  treble.connect(chorusDry);
  treble.connect(chorusDelay);
  chorusDelay.connect(chorusWet);
  chorusDry.connect(tremoloGain);
  chorusWet.connect(tremoloGain);
  tremoloGain.connect(reverbDry);
  tremoloGain.connect(convolver);
  convolver.connect(reverbWet);
  reverbDry.connect(master);
  reverbWet.connect(master);
  master.connect(ctx.destination);

  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = current.tremoloRate;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = current.tremoloDepth;
  lfo.connect(lfoGain);
  lfoGain.connect(tremoloGain.gain);
  lfo.start();

  bus = {
    input,
    drive,
    brightness,
    bass,
    treble,
    chorusDry,
    chorusWet,
    chorusDelay,
    chorusLfo,
    chorusLfoGain,
    tremoloGain,
    lfo,
    lfoGain,
    reverbWet,
    reverbDry,
    master,
  };
  return bus;
}

function buildReverbIR(ctx: AudioContext): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * 2.5);
  const buf = ctx.createBuffer(1, len, sr);
  const ch = buf.getChannelData(0);
  const decay = 0.6;
  for (let i = 0; i < len; i++) {
    ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * decay));
  }
  return buf;
}

export function playRhodesNote(freq: number, duration: number, volume = 0.3): void {
  const ctx = getAudioContext();
  const b = getRhodesBus();
  const now = ctx.currentTime;
  const effectiveDur = Math.max(0.05, duration * current.decay);
  const attack = Math.min(effectiveDur * 0.5, Math.max(0.001, current.attack));

  const fundamental = ctx.createOscillator();
  const bell = ctx.createOscillator();
  const g1 = ctx.createGain();
  const g2 = ctx.createGain();

  fundamental.type = "sine";
  fundamental.frequency.value = freq;
  bell.type = "sine";
  bell.frequency.value = freq * 2;

  g1.gain.setValueAtTime(0, now);
  g1.gain.linearRampToValueAtTime(volume, now + attack);
  g1.gain.exponentialRampToValueAtTime(0.001, now + effectiveDur);

  g2.gain.setValueAtTime(0, now);
  g2.gain.linearRampToValueAtTime(volume * 0.35, now + attack * 0.6);
  g2.gain.exponentialRampToValueAtTime(0.001, now + effectiveDur * 0.6);

  fundamental.connect(g1).connect(b.input);
  bell.connect(g2).connect(b.input);
  fundamental.start(now);
  bell.start(now);
  fundamental.stop(now + effectiveDur);
  bell.stop(now + effectiveDur * 0.6);

  if (current.keyClick > 0) {
    const src = ctx.createBufferSource();
    src.buffer = getClickBuffer(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3000;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0, now);
    cg.gain.linearRampToValueAtTime(volume * current.keyClick, now + 0.001);
    cg.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    src.connect(hp).connect(cg).connect(b.input);
    src.start(now);
    src.stop(now + 0.03);
  }
}

export function setRhodesVolume(v: number): void {
  current.volume = v;
  if (bus) bus.master.gain.setTargetAtTime(v, getAudioContext().currentTime, 0.01);
}

export function setRhodesTremoloRate(hz: number): void {
  current.tremoloRate = hz;
  if (bus) bus.lfo.frequency.setTargetAtTime(hz, getAudioContext().currentTime, 0.01);
}

export function setRhodesTremoloDepth(depth: number): void {
  current.tremoloDepth = depth;
  if (bus) bus.lfoGain.gain.setTargetAtTime(depth, getAudioContext().currentTime, 0.01);
}

export function setRhodesBassDb(db: number): void {
  current.bass = db;
  if (bus) bus.bass.gain.setTargetAtTime(db, getAudioContext().currentTime, 0.01);
}

export function setRhodesTrebleDb(db: number): void {
  current.treble = db;
  if (bus) bus.treble.gain.setTargetAtTime(db, getAudioContext().currentTime, 0.01);
}

export function setRhodesDecay(mult: number): void {
  current.decay = mult;
}

export function setRhodesDrive(d: number): void {
  current.drive = d;
  if (bus) bus.drive.curve = driveCurveFor(d);
}

export function setRhodesBrightness(b: number): void {
  current.brightness = b;
  if (bus) bus.brightness.frequency.setTargetAtTime(b, getAudioContext().currentTime, 0.01);
}

export function setRhodesChorusRate(hz: number): void {
  current.chorusRate = hz;
  if (bus) bus.chorusLfo.frequency.setTargetAtTime(hz, getAudioContext().currentTime, 0.01);
}

export function setRhodesChorusDepth(depth: number): void {
  current.chorusDepth = depth;
  if (bus) bus.chorusWet.gain.setTargetAtTime(depth, getAudioContext().currentTime, 0.01);
}

export function setRhodesKeyClick(k: number): void {
  current.keyClick = k;
}

export function setRhodesAttack(a: number): void {
  current.attack = a;
}

export function setRhodesReverb(r: number): void {
  current.reverb = r;
  if (bus) bus.reverbWet.gain.setTargetAtTime(r, getAudioContext().currentTime, 0.01);
}

export function resetRhodes(): void {
  current = { ...RHODES_DEFAULTS };
  if (bus) {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    bus.master.gain.setTargetAtTime(current.volume, t, 0.01);
    bus.lfo.frequency.setTargetAtTime(current.tremoloRate, t, 0.01);
    bus.lfoGain.gain.setTargetAtTime(current.tremoloDepth, t, 0.01);
    bus.bass.gain.setTargetAtTime(current.bass, t, 0.01);
    bus.treble.gain.setTargetAtTime(current.treble, t, 0.01);
    bus.drive.curve = driveCurveFor(0);
    bus.brightness.frequency.setTargetAtTime(current.brightness, t, 0.01);
    bus.chorusLfo.frequency.setTargetAtTime(current.chorusRate, t, 0.01);
    bus.chorusWet.gain.setTargetAtTime(current.chorusDepth, t, 0.01);
    bus.reverbWet.gain.setTargetAtTime(current.reverb, t, 0.01);
  }
}

export function getRhodesSettings(): RhodesSettings {
  return { ...current };
}
