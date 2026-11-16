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

// --- Paleta HUD: un color por sección ---
const SECTION_ACCENTS = {
  voz: "#ffdd44",
  env: "#00dd88",
  amp: "#ff00ff",
  fx: "#00ffff",
} as const;

// Variables CSS locales para reutilizar el acento en gradientes/pseudo-elementos.
const accentVars = (accent: string) =>
  ({ "--rhodes-accent": accent }) as unknown as React.CSSProperties;

// --- Geometría de los arcos/ticks del knob (viewBox 0 0 100 100) ---
const KNOB_TICKS = 12;

function polar(angleDeg: number, r: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: 50 + r * Math.sin(a), y: 50 - r * Math.cos(a) };
}

function arcPath(startDeg: number, endDeg: number, r: number) {
  const s = polar(startDeg, r);
  const e = polar(endDeg, r);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

// Display tipo LCD para todos los valores.
function Readout({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <span className="rhodes-readout" style={{ color: accent, borderColor: `${accent}55` }}>
      {children}
    </span>
  );
}

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
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const angle = -135 + pct * 270;
  const dragRef = useRef<{ startY: number; startValue: number } | null>(null);
  const [active, setActive] = useState(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { startY: e.clientY, startValue: value };
      setActive(true);
    },
    [value],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      // Sensibilidad normalizada al rango: ~150 px de arrastre vertical
      // recorren todo el rango (min→max), independientemente de su magnitud.
      const range = max - min;
      const delta = (dragRef.current.startY - e.clientY) * (range / 150);
      const raw = dragRef.current.startValue + delta;
      const snapped = Math.round(raw / step) * step;
      onChange(Math.min(max, Math.max(min, snapped)));
    },
    [min, max, step, onChange],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    setActive(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    onChange(min);
  }, [min, onChange]);

  const display = format ? format(value) : Math.round(value);
  const needleStart = polar(angle, 9);
  const needleEnd = polar(angle, 33);

  return (
    <div className="rhodes-ctrl flex w-[74px] flex-col items-center gap-1.5">
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        className="relative h-16 w-16 cursor-ns-resize select-none touch-none rounded-full outline-none"
        style={active ? { filter: `drop-shadow(0 0 6px ${accent})` } : undefined}
      >
        {/* cuerpo con profundidad radial */}
        <div
          className="absolute inset-[16%] rounded-full border"
          style={{
            borderColor: "#2a2a4a",
            background: "radial-gradient(circle at 35% 28%, #2a2a45 0%, #16162a 52%, #0b0b16 100%)",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.85), inset 0 -2px 5px rgba(255,255,255,0.04)",
          }}
        />
        {/* ticks + arco de valor + aguja */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {Array.from({ length: KNOB_TICKS + 1 }, (_, i) => {
            const a = -135 + (i / KNOB_TICKS) * 270;
            const p1 = polar(a, 45);
            const p2 = polar(a, 49);
            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={accent}
                strokeWidth={1.4}
                strokeLinecap="round"
                opacity={0.3}
              />
            );
          })}
          <path d={arcPath(-135, 135, 40)} fill="none" stroke="#2a2a4a" strokeWidth={4} strokeLinecap="round" />
          {pct > 0.002 && (
            <path
              d={arcPath(-135, angle, 40)}
              fill="none"
              stroke={accent}
              strokeWidth={4}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 3px ${accent})` }}
            />
          )}
          <line
            x1={needleStart.x}
            y1={needleStart.y}
            x2={needleEnd.x}
            y2={needleEnd.y}
            stroke={accent}
            strokeWidth={3.2}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 3px ${accent})` }}
          />
          <circle cx={50} cy={50} r={2.6} fill={accent} opacity={0.9} />
        </svg>
      </div>
      <span className="rhodes-label">{label}</span>
      <Readout accent={accent}>{display}</Readout>
    </div>
  );
}

// Alto de la pista de un fader vertical, en píxeles.
const FADER_TRACK_H = 96;

function Fader({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  accent = "#ff00ff",
  defaultValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  accent?: string;
  defaultValue?: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [active, setActive] = useState(false);
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));

  // Interacción ABSOLUTA estilo consola: el thumb salta al punto donde se toca
  // y luego sigue al puntero. A diferencia del Knob (arrastre relativo), un
  // fader se lee por posición, así que mapear la Y del puntero al valor es lo
  // más natural y no depende de la magnitud del rango.
  const setFromClientY = useCallback(
    (clientY: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // 1 en el tope de la pista, 0 en la base.
      const t = Math.min(1, Math.max(0, (rect.bottom - clientY) / rect.height));
      const raw = min + t * (max - min);
      const snapped = Math.round(raw / step) * step;
      onChange(Math.min(max, Math.max(min, snapped)));
    },
    [min, max, step, onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      draggingRef.current = true;
      setActive(true);
      setFromClientY(e.clientY);
    },
    [setFromClientY],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      setFromClientY(e.clientY);
    },
    [setFromClientY],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
    setActive(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    onChange(defaultValue ?? min);
  }, [defaultValue, min, onChange]);

  const display = format ? format(value) : Math.round(value);
  const resetLabel = defaultValue !== undefined ? "default" : "mínimo";

  return (
    <div className="rhodes-ctrl flex w-[74px] flex-col items-center gap-1.5">
      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        tabIndex={0}
        title={`${label}: arrastrá vertical para ajustar · doble click = ${resetLabel}`}
        onKeyDown={(e) => {
          const stepKey = step === 1 ? 1 : step;
          if (e.key === "ArrowUp" || e.key === "ArrowRight") onChange(Math.min(max, value + stepKey));
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") onChange(Math.max(min, value - stepKey));
        }}
        className="rhodes-fader-track relative w-6 cursor-ns-resize select-none touch-none rounded-full border outline-none"
        style={{ ...accentVars(accent), height: FADER_TRACK_H, borderColor: "#2a2a4a", background: "#12121f" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* relleno en gradiente desde la base */}
        <div
          className="rhodes-fader-fill absolute inset-x-0 bottom-0 rounded-full"
          style={{ height: `${pct * 100}%` }}
        />
        {/* marcas de escala */}
        <div className="rhodes-fader-ticks pointer-events-none absolute inset-0 rounded-full" />
        {/* cap tipo LED */}
        <div
          className="absolute h-1.5 w-8 rounded-full border"
          style={{
            bottom: `${pct * 100}%`,
            left: "50%",
            transform: "translate(-50%, 50%)",
            borderColor: accent,
            background: "#0a0a0f",
            boxShadow: active ? `0 0 13px ${accent}, 0 0 4px ${accent}` : `0 0 6px ${accent}`,
          }}
        />
      </div>
      <span className="rhodes-label">{label}</span>
      <Readout accent={accent}>{display}</Readout>
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
    <div className="rhodes-ctrl flex w-[116px] flex-col items-center gap-1.5">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rhodes-slider"
        style={accentVars(accent)}
      />
      <span className="rhodes-label">{label}</span>
      <Readout accent={accent}>{format ? format(value) : Math.round(value)}</Readout>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="rhodes-led" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: accent }}>
          {title}
        </span>
        <span className="h-px w-16 sm:w-24" style={{ background: `linear-gradient(90deg, ${accent}aa, transparent)` }} />
      </div>
      <div className="flex flex-wrap items-start gap-x-4 gap-y-4">{children}</div>
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
    <div className="rhodes-panel card-cyber relative overflow-hidden rounded p-4">
      {/* esquinas HUD */}
      <span className="rhodes-corner" style={{ top: 0, left: 0, borderTopColor: "#ff00ff", borderLeftColor: "#ff00ff" }} />
      <span className="rhodes-corner" style={{ top: 0, right: 0, borderTopColor: "#ff00ff", borderRightColor: "#ff00ff" }} />
      <span className="rhodes-corner" style={{ bottom: 0, left: 0, borderBottomColor: "#00ffff", borderLeftColor: "#00ffff" }} />
      <span className="rhodes-corner" style={{ bottom: 0, right: 0, borderBottomColor: "#00ffff", borderRightColor: "#00ffff" }} />

      <div className="relative z-10 mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rhodes-led" style={{ background: "#ff00ff", boxShadow: "0 0 8px #ff00ff" }} />
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#c8c8e0]">
            Rhodes · Voz del instrumento
          </p>
        </div>
        <button
          onClick={handleReset}
          className="rhodes-reset"
          title="Restaurar todos los controles a sus valores por defecto"
        >
          RESET
        </button>
      </div>

      <div className="relative z-10 flex flex-wrap gap-x-10 gap-y-7">
        <Section title="Voz" accent={SECTION_ACCENTS.voz}>
          <Fader
            label="Brightness"
            value={brightnessInverse(settings.brightness)}
            min={0}
            max={1}
            step={0.01}
            format={(v) => {
              const hz = brightnessCutoff(v);
              return hz >= 1000 ? `${Math.round(hz / 1000)}k Hz` : `${Math.round(hz)} Hz`;
            }}
            accent={SECTION_ACCENTS.voz}
            defaultValue={brightnessInverse(RHODES_DEFAULTS.brightness)}
            onChange={(v) => patch({ brightness: brightnessCutoff(v) })}
          />
          <Fader
            label="Key Click"
            value={settings.keyClick}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent={SECTION_ACCENTS.voz}
            defaultValue={RHODES_DEFAULTS.keyClick}
            onChange={(v) => patch({ keyClick: v })}
          />
        </Section>

        <Section title="Env" accent={SECTION_ACCENTS.env}>
          <Fader
            label="Attack"
            value={settings.attack}
            min={0.001}
            max={0.2}
            step={0.001}
            format={(v) => `${Math.round(v * 1000)} ms`}
            accent={SECTION_ACCENTS.env}
            defaultValue={RHODES_DEFAULTS.attack}
            onChange={(v) => patch({ attack: v })}
          />
          <Fader
            label="Decay"
            value={settings.decay}
            min={0.01}
            max={2}
            step={0.01}
            format={(v) => `${v.toFixed(2)} s`}
            accent={SECTION_ACCENTS.env}
            defaultValue={RHODES_DEFAULTS.decay}
            onChange={(v) => patch({ decay: v })}
          />
          <Fader
            label="Sustain"
            value={settings.sustain}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent={SECTION_ACCENTS.env}
            defaultValue={RHODES_DEFAULTS.sustain}
            onChange={(v) => patch({ sustain: v })}
          />
          <Fader
            label="Release"
            value={settings.release}
            min={0.01}
            max={2}
            step={0.01}
            format={(v) => `${Math.round(v * 1000)} ms`}
            accent={SECTION_ACCENTS.env}
            defaultValue={RHODES_DEFAULTS.release}
            onChange={(v) => patch({ release: v })}
          />
        </Section>

        <Section title="Amp" accent={SECTION_ACCENTS.amp}>
          <Knob
            label="Volume"
            value={settings.volume}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent={SECTION_ACCENTS.amp}
            onChange={(v) => patch({ volume: v })}
          />
          <Knob
            label="Drive"
            value={settings.drive}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent={SECTION_ACCENTS.amp}
            onChange={(v) => patch({ drive: v })}
          />
          <Slider
            label="Bass"
            value={settings.bass}
            min={-12}
            max={12}
            step={1}
            format={(v) => `${v > 0 ? "+" : ""}${v} dB`}
            accent={SECTION_ACCENTS.amp}
            onChange={(v) => patch({ bass: v })}
          />
          <Slider
            label="Treble"
            value={settings.treble}
            min={-12}
            max={12}
            step={1}
            format={(v) => `${v > 0 ? "+" : ""}${v} dB`}
            accent={SECTION_ACCENTS.amp}
            onChange={(v) => patch({ treble: v })}
          />
        </Section>

        <Section title="FX" accent={SECTION_ACCENTS.fx}>
          <Knob
            label="Trem. Rate"
            value={settings.tremoloRate}
            min={0}
            max={10}
            step={0.1}
            format={(v) => `${v.toFixed(1)} Hz`}
            accent={SECTION_ACCENTS.fx}
            onChange={(v) => patch({ tremoloRate: v })}
          />
          <Knob
            label="Trem. Depth"
            value={settings.tremoloDepth}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent={SECTION_ACCENTS.fx}
            onChange={(v) => patch({ tremoloDepth: v })}
          />
          <Knob
            label="Chorus Rate"
            value={settings.chorusRate}
            min={0}
            max={5}
            step={0.1}
            format={(v) => `${v.toFixed(1)} Hz`}
            accent={SECTION_ACCENTS.fx}
            onChange={(v) => patch({ chorusRate: v })}
          />
          <Knob
            label="Chorus Depth"
            value={settings.chorusDepth}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent={SECTION_ACCENTS.fx}
            onChange={(v) => patch({ chorusDepth: v })}
          />
          <Knob
            label="Reverb"
            value={settings.reverb}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            accent={SECTION_ACCENTS.fx}
            onChange={(v) => patch({ reverb: v })}
          />
        </Section>
      </div>
    </div>
  );
}
