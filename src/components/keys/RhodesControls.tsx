"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  RHODES_DEFAULTS,
  setRhodesVolume,
  setRhodesTremoloRate,
  setRhodesTremoloDepth,
  setRhodesBassDb,
  setRhodesTrebleDb,
  setRhodesDecay,
  setRhodesSustain,
  setRhodesRelease,
  setRhodesDrive,
  setRhodesBrightness,
  setRhodesChorusRate,
  setRhodesChorusDepth,
  setRhodesKeyClick,
  setRhodesAttack,
  setRhodesReverb,
  resetRhodes,
  brightnessCutoff,
  brightnessInverse,
  type RhodesSettings,
} from "@/lib/rhodes";

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  accent?: string;
  onChange: (v: number) => void;
}

function Knob({ label, value, min, max, step = 1, format, accent = "#ff00ff", onChange }: KnobProps) {
  const pct = (value - min) / (max - min);
  const angle = -135 + pct * 270;
  const dragRef = useRef<{ startY: number; startValue: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = { startY: e.clientY, startValue: value };
    },
    [value],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      const delta = (dragRef.current.startY - e.clientY) * 0.5;
      const raw = dragRef.current.startValue + delta;
      const snapped = Math.round(raw / step) * step;
      onChange(Math.min(max, Math.max(min, snapped)));
    },
    [min, max, step, onChange],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleDoubleClick = useCallback(() => {
    onChange(min);
  }, [min, onChange]);

  const display = format ? format(value) : Math.round(value);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        tabIndex={0}
        onKeyDown={(e) => {
          const stepKey = step === 1 ? 1 : step;
          if (e.key === "ArrowUp" || e.key === "ArrowRight") onChange(Math.min(max, value + stepKey));
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") onChange(Math.max(min, value - stepKey));
        }}
        className="relative w-14 h-14 rounded-full border-2 cursor-ns-resize select-none touch-none outline-none focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/40"
        style={{ borderColor: accent }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <div className="absolute inset-0 rounded-full bg-[#1a1a2e] shadow-inner" />
        <div
          className="absolute left-1/2 top-1/2 w-0.5 h-[38%] origin-bottom"
          style={{
            backgroundColor: accent,
            transform: `translateX(-50%) translateY(-100%) rotate(${angle}deg)`,
            transformOrigin: "50% 100%",
          }}
        />
      </div>
      <span className="text-[10px] text-[#8888aa] font-mono uppercase tracking-wider">{label}</span>
      <span className="text-[11px] font-mono" style={{ color: accent }}>
        {display}
      </span>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  accent,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  accent: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[72px]">
      <span className="text-[10px] text-[#8888aa] font-mono uppercase tracking-wider">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: accent }}
      />
      <span className="text-[11px] font-mono" style={{ color: accent }}>
        {format ? format(value) : Math.round(value)}
      </span>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: accent }}>
        {title}
      </p>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </div>
  );
}

export default function RhodesControls() {
  const [settings, setSettings] = useState<RhodesSettings>({ ...RHODES_DEFAULTS });

  useEffect(() => {
    setRhodesVolume(settings.volume);
    setRhodesTremoloRate(settings.tremoloRate);
    setRhodesTremoloDepth(settings.tremoloDepth);
    setRhodesBassDb(settings.bass);
    setRhodesTrebleDb(settings.treble);
    setRhodesDecay(settings.decay);
    setRhodesSustain(settings.sustain);
    setRhodesRelease(settings.release);
    setRhodesDrive(settings.drive);
    setRhodesBrightness(settings.brightness);
    setRhodesChorusRate(settings.chorusRate);
    setRhodesChorusDepth(settings.chorusDepth);
    setRhodesKeyClick(settings.keyClick);
    setRhodesAttack(settings.attack);
    setRhodesReverb(settings.reverb);
  }, [settings]);

  const handleReset = useCallback(() => {
    setSettings({ ...RHODES_DEFAULTS });
    resetRhodes();
  }, []);

  const patch = useCallback((partial: Partial<RhodesSettings>) => {
    setSettings((s) => ({ ...s, ...partial }));
  }, []);

  return (
    <div className="card-cyber rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#8888aa] font-mono uppercase tracking-wider">Rhodes · Voz del instrumento</p>
        <button
          onClick={handleReset}
          className="px-2 py-0.5 rounded border border-[#ff4455]/50 text-[#ff4455] text-[10px] font-mono tracking-wider hover:bg-[#ff4455]/10 transition-all"
          title="Restaurar todos los controles a sus valores por defecto"
        >
          RESET
        </button>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-5">
        <Section title="Voz" accent="#ffdd44">
          <Knob
            label="Attack"
            value={settings.attack}
            min={0.001}
            max={0.2}
            step={0.001}
            format={(v) => `${Math.round(v * 1000)} ms`}
            accent="#ffdd44"
            onChange={(v) => patch({ attack: v })}
          />
          <Knob
            label="Key Click"
            value={settings.keyClick}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent="#ffaa00"
            onChange={(v) => patch({ keyClick: v })}
          />
          <Slider
            label="Brightness"
            value={brightnessInverse(settings.brightness)}
            min={0}
            max={1}
            step={0.01}
            format={(v) => {
              const hz = brightnessCutoff(v);
              return hz >= 1000 ? `${Math.round(hz / 1000)}k Hz` : `${Math.round(hz)} Hz`;
            }}
            accent="#00dd88"
            onChange={(v) => patch({ brightness: brightnessCutoff(v) })}
          />
          <Slider
            label="Decay"
            value={settings.decay}
            min={0.01}
            max={2}
            step={0.01}
            format={(v) => `${v.toFixed(2)} s`}
            accent="#ffaa00"
            onChange={(v) => patch({ decay: v })}
          />
          <Slider
            label="Sustain"
            value={settings.sustain}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent="#00dd88"
            onChange={(v) => patch({ sustain: v })}
          />
          <Knob
            label="Release"
            value={settings.release}
            min={0.01}
            max={2}
            step={0.01}
            format={(v) => `${Math.round(v * 1000)} ms`}
            accent="#ffaa00"
            onChange={(v) => patch({ release: v })}
          />
        </Section>

        <Section title="Amp" accent="#ff00ff">
          <Knob
            label="Drive"
            value={settings.drive}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent="#ff00ff"
            onChange={(v) => patch({ drive: v })}
          />
          <Knob
            label="Volume"
            value={settings.volume}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent="#ff00ff"
            onChange={(v) => patch({ volume: v })}
          />
          <Slider
            label="Bass"
            value={settings.bass}
            min={-12}
            max={12}
            step={1}
            format={(v) => `${v > 0 ? "+" : ""}${v} dB`}
            accent="#ff00ff"
            onChange={(v) => patch({ bass: v })}
          />
          <Slider
            label="Treble"
            value={settings.treble}
            min={-12}
            max={12}
            step={1}
            format={(v) => `${v > 0 ? "+" : ""}${v} dB`}
            accent="#00dd88"
            onChange={(v) => patch({ treble: v })}
          />
        </Section>

        <Section title="FX" accent="#00ffff">
          <Knob
            label="Trem. Rate"
            value={settings.tremoloRate}
            min={0}
            max={10}
            step={0.1}
            format={(v) => `${v.toFixed(1)} Hz`}
            accent="#00ffff"
            onChange={(v) => patch({ tremoloRate: v })}
          />
          <Knob
            label="Trem. Depth"
            value={settings.tremoloDepth}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent="#00ffff"
            onChange={(v) => patch({ tremoloDepth: v })}
          />
          <Knob
            label="Chorus Rate"
            value={settings.chorusRate}
            min={0}
            max={5}
            step={0.1}
            format={(v) => `${v.toFixed(1)} Hz`}
            accent="#00dd88"
            onChange={(v) => patch({ chorusRate: v })}
          />
          <Knob
            label="Chorus Depth"
            value={settings.chorusDepth}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent="#00dd88"
            onChange={(v) => patch({ chorusDepth: v })}
          />
          <Knob
            label="Reverb"
            value={settings.reverb}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent="#00dd88"
            onChange={(v) => patch({ reverb: v })}
          />
        </Section>
      </div>
    </div>
  );
}
