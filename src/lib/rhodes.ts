"use client";

import { getAudioContext } from "@/lib/audio";

export interface RhodesSettings {
  volume: number;
  tremoloRate: number;
  tremoloDepth: number;
  bass: number;
  treble: number;
  decay: number;
}

export const RHODES_DEFAULTS: RhodesSettings = {
  volume: 0.3,
  tremoloRate: 4,
  tremoloDepth: 0,
  bass: 0,
  treble: 0,
  decay: 1,
};

interface RhodesBus {
  input: GainNode;
  master: GainNode;
  bass: BiquadFilterNode;
  treble: BiquadFilterNode;
  tremoloGain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
}

let bus: RhodesBus | null = null;
let current = { ...RHODES_DEFAULTS };

function getRhodesBus(): RhodesBus {
  if (bus) return bus;
  const ctx = getAudioContext();

  const input = ctx.createGain();
  const bass = ctx.createBiquadFilter();
  bass.type = "lowshelf";
  bass.frequency.value = 250;
  bass.gain.value = current.bass;

  const treble = ctx.createBiquadFilter();
  treble.type = "highshelf";
  treble.frequency.value = 4000;
  treble.gain.value = current.treble;

  const tremoloGain = ctx.createGain();
  tremoloGain.gain.value = 1;

  const master = ctx.createGain();
  master.gain.value = current.volume;

  input.connect(bass);
  bass.connect(treble);
  treble.connect(tremoloGain);
  tremoloGain.connect(master);
  master.connect(ctx.destination);

  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = current.tremoloRate;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = current.tremoloDepth;
  lfo.connect(lfoGain);
  lfoGain.connect(tremoloGain.gain);
  lfo.start();

  bus = { input, master, bass, treble, tremoloGain, lfo, lfoGain };
  return bus;
}

export function playRhodesNote(freq: number, duration: number, volume = 0.3): void {
  const ctx = getAudioContext();
  const b = getRhodesBus();
  const now = ctx.currentTime;
  const effectiveDur = Math.max(0.05, duration * current.decay);

  const fundamental = ctx.createOscillator();
  const bell = ctx.createOscillator();
  const g1 = ctx.createGain();
  const g2 = ctx.createGain();

  fundamental.type = "sine";
  fundamental.frequency.value = freq;
  bell.type = "sine";
  bell.frequency.value = freq * 2;

  g1.gain.setValueAtTime(0, now);
  g1.gain.linearRampToValueAtTime(volume, now + 0.005);
  g1.gain.exponentialRampToValueAtTime(0.001, now + effectiveDur);

  g2.gain.setValueAtTime(0, now);
  g2.gain.linearRampToValueAtTime(volume * 0.35, now + 0.003);
  g2.gain.exponentialRampToValueAtTime(0.001, now + effectiveDur * 0.6);

  fundamental.connect(g1).connect(b.input);
  bell.connect(g2).connect(b.input);
  fundamental.start(now);
  bell.start(now);
  fundamental.stop(now + effectiveDur);
  bell.stop(now + effectiveDur * 0.6);
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
  }
}

export function getRhodesSettings(): RhodesSettings {
  return { ...current };
}
