"use client";

import { useState, useCallback } from "react";
import ToolContainer from "@/components/ToolContainer";
import PianoKeyboard from "./PianoKeyboard";
import { useScalePlayer } from "@/hooks/useScalePlayer";
import {
  NOTE_NAMES,
  SCALE_TYPES,
  getScaleNotes,
  type NoteName,
  type ScaleType,
} from "@/lib/music-theory";

const SCALE_CATEGORIES: { label: string; types: ScaleType[] }[] = [
  { label: "Mayor", types: ["major"] },
  { label: "Menor", types: ["natural-minor", "harmonic-minor", "melodic-minor"] },
  { label: "Modos", types: ["dorian", "phrygian", "lydian", "mixolydian", "locrian"] },
  { label: "Pentatónicas", types: ["pentatonic-major", "pentatonic-minor"] },
  { label: "Otras", types: ["blues", "chromatic", "whole-tone", "octatonic"] },
];

export default function KeysPanel({ onBack }: { onBack: () => void }) {
  const [root, setRoot] = useState<NoteName>("C");
  const [scaleType, setScaleType] = useState<ScaleType>("major");
  const [highlightedNotes, setHighlightedNotes] = useState<number[]>([]);
  const scalePlayer = useScalePlayer();

  const updateScale = useCallback((r: NoteName, s: ScaleType) => {
    setRoot(r);
    setScaleType(s);
    const notes = getScaleNotes(r, s);
    const rootIdx = NOTE_NAMES.indexOf(r);
    const midiNotes = notes.map(n => {
      const idx = NOTE_NAMES.indexOf(n);
      let midi = 60 + idx - rootIdx;
      if (midi < 48) midi += 12;
      if (midi < 48) midi += 12;
      return midi;
    });
    setHighlightedNotes(midiNotes);
  }, []);

  const playScale = useCallback(() => {
    scalePlayer.playScale(root, scaleType);
  }, [scalePlayer, root, scaleType]);

  const scale = SCALE_TYPES[scaleType];
  const scaleNotes = getScaleNotes(root, scaleType);

  return (
    <ToolContainer title="Keys" icon="🎹" onBack={onBack}>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-[#8888aa] block mb-1">Nota fundamental</label>
            <div className="flex flex-wrap gap-1">
              {NOTE_NAMES.map((n) => (
                <button
                  key={n}
                  onClick={() => updateScale(n as NoteName, scaleType)}
                  className={`w-10 h-10 rounded border text-sm font-mono transition-all ${
                    root === n
                      ? "border-[#ff00ff] text-[#ff00ff] bg-[#ff00ff]/10"
                      : "border-[#2a2a4a] text-[#8888aa] hover:border-[#ff00ff]/50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm text-[#8888aa] block mb-1">Tipo de escala</label>
          <div className="space-y-2">
            {SCALE_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <p className="text-xs text-[#555] mb-1">{cat.label}</p>
                <div className="flex flex-wrap gap-1">
                  {cat.types.map((t) => (
                    <button
                      key={t}
                      onClick={() => updateScale(root, t)}
                      className={`px-3 py-1 rounded border text-xs transition-all ${
                        scaleType === t
                          ? "border-[#00ffff] text-[#00ffff] bg-[#00ffff]/10"
                          : "border-[#2a2a4a] text-[#8888aa] hover:border-[#00ffff]/50"
                      }`}
                    >
                      {SCALE_TYPES[t].name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-cyber rounded p-4 overflow-x-auto">
          <PianoKeyboard
            startOctave={4}
            octaves={2}
            highlightedNotes={highlightedNotes}
            rootNote={root}
            onNoteClick={(midi) => {
              const noteName = NOTE_NAMES[midi % 12];
              const octave = Math.floor(midi / 12) - 1;
              scalePlayer.playNote(noteName, octave);
            }}
          />
        </div>

        <div className="text-center">
          <button
            onClick={playScale}
            className="px-8 py-3 rounded font-bold text-sm tracking-wider border border-[#00ffff]/50 text-[#00ffff] bg-[#00ffff]/10 hover:bg-[#00ffff]/20 transition-all"
          >
            ▶ REPRODUCIR ESCALA
          </button>
        </div>

        <div className="card-cyber rounded p-4">
          <p className="text-xs text-[#8888aa] mb-2">
            {scale.name} en {root}
          </p>
          <p className="text-xs text-[#555] mb-2">{scale.description}</p>
          <div className="flex flex-wrap gap-2">
            {scaleNotes.map((note, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded text-sm font-mono ${
                  note === root
                    ? "bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff]/50"
                    : "bg-[#00ffff]/10 text-[#00ffff] border border-[#00ffff]/30"
                }`}
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ToolContainer>
  );
}
