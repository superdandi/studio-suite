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
  resetRhodes,
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
        className="w-full accent-[#ff00ff]"
        style={{ accentColor: accent }}
      />
      <span className="text-[11px] font-mono" style={{ color: accent }}>
        {format ? format(value) : Math.round(value)}
      </span>
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

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex gap-5">
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
            accent="#00dd88"
            onChange={(v) => patch({ tremoloDepth: v })}
          />
        </div>

        <div className="flex gap-5 items-center ml-2">
          <Slider
            label="Bass"
            value={settings.bass}
            min={-12}
            max={12}
            step={1}
            format={(v) => `${v > 0 ? "+" : ""}${v} dB`}
            accent="#ffdd44"
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
          <Slider
            label="Decay"
            value={settings.decay}
            min={0.2}
            max={2}
            step={0.1}
            format={(v) => `${v.toFixed(1)}×`}
            accent="#ffaa00"
            onChange={(v) => patch({ decay: v })}
          />
        </div>
      </div>
    </div>
  );
}
