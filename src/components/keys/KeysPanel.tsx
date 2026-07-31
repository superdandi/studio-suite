"use client";

import { useState, useCallback, useEffect } from "react";
import ToolContainer from "@/components/ToolContainer";
import PianoKeyboard from "./PianoKeyboard";
import { useScalePlayer } from "@/hooks/useScalePlayer";
import {
  NOTE_NAMES,
  SCALE_TYPES,
  getScaleNotes,
  getScaleMidi,
  getScaleMidiSequence,
  KEYBOARD_KEY_TO_MIDI,
  type NoteName,
  type ScaleType,
} from "@/lib/music-theory";
import { buildScaleMidi, triggerDownload } from "@/lib/midi";
import { PIANOLA_PIECES } from "@/lib/pieces";

const SCALE_CATEGORIES: { label: string; types: ScaleType[] }[] = [
  { label: "Mayor", types: ["major"] },
  { label: "Menor", types: ["natural-minor", "harmonic-minor", "melodic-minor"] },
  { label: "Modos", types: ["dorian", "phrygian", "lydian", "mixolydian", "locrian"] },
  { label: "Pentatónicas", types: ["pentatonic-major", "pentatonic-minor"] },
  { label: "Otras", types: ["blues", "chromatic", "whole-tone", "octatonic"] },
  {
    label: "Japonesas",
    types: ["hirajoshi", "iwato", "insen", "yo"],
  },
  {
    label: "Árabes",
    types: ["hijaz", "rast", "phrygian-dominant"],
  },
  {
    label: "Indias",
    types: ["bhairav", "bhairavi", "todi"],
  },
  {
    label: "Africanas/Indonesia",
    types: ["pelog", "slendro", "african-pentatonic"],
  },
];

export default function KeysPanel() {
  const [root, setRoot] = useState<NoteName>("C");
  const [scaleType, setScaleType] = useState<ScaleType>("major");
  const [highlightedNotes, setHighlightedNotes] = useState<number[]>([]);
  const [ascPlaying, setAscPlaying] = useState(false);
  const [ascDescPlaying, setAscDescPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [showLabels, setShowLabels] = useState(true);
  const [playableKeyboard, setPlayableKeyboard] = useState(true);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [piecePlaying, setPiecePlaying] = useState(false);
  const scalePlayer = useScalePlayer();

  const playMidi = useCallback(
    (midi: number) => {
      const noteName = NOTE_NAMES[midi % 12];
      const octave = Math.floor(midi / 12) - 1;
      scalePlayer.playNote(noteName, octave);
    },
    [scalePlayer],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!playableKeyboard) return;
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const midi = KEYBOARD_KEY_TO_MIDI[e.key.toLowerCase()];
      if (midi === undefined) return;
      e.preventDefault();
      setActiveNotes((prev) => (prev.includes(midi) ? prev : [...prev, midi]));
      playMidi(midi);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (!playableKeyboard) return;
      const midi = KEYBOARD_KEY_TO_MIDI[e.key.toLowerCase()];
      if (midi === undefined) return;
      setActiveNotes((prev) => prev.filter((m) => m !== midi));
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [playMidi, playableKeyboard]);

  const togglePlay = useCallback((mode: "asc" | "ascdesc") => {
    setPiecePlaying(false);
    if (mode === "asc") {
      setAscPlaying((p) => !p);
      setAscDescPlaying(false);
    } else {
      setAscDescPlaying((p) => !p);
      setAscPlaying(false);
    }
  }, []);

  const togglePiece = useCallback((id: string) => {
    setAscPlaying(false);
    setAscDescPlaying(false);
    setSelectedPieceId((prev) => {
      const next = prev === id ? !piecePlaying : true;
      setPiecePlaying(next);
      return id;
    });
  }, [piecePlaying]);

  const togglePlayableKeyboard = useCallback(() => {
    setPlayableKeyboard((p) => {
      const next = !p;
      if (!next) {
        scalePlayer.stopScale();
        setAscPlaying(false);
        setAscDescPlaying(false);
        setActiveNotes([]);
        setShowLabels(false);
      } else {
        scalePlayer.stopScale();
        setPiecePlaying(false);
        setActiveNotes([]);
      }
      return next;
    });
  }, [scalePlayer]);

  const updateScale = useCallback((r: NoteName, s: ScaleType) => {
    setRoot(r);
    setScaleType(s);
    setHighlightedNotes(getScaleMidi(r, s, 4));
  }, []);

  const downloadMidi = useCallback(
    (mode: "asc" | "ascdesc") => {
      const sequence = getScaleMidiSequence(root, scaleType, mode);
      const data = buildScaleMidi({ sequence });
      triggerDownload(`${scaleType}-${root}-${mode}.mid`, data);
    },
    [root, scaleType],
  );

  const scale = SCALE_TYPES[scaleType];
  const scaleNotes = getScaleNotes(root, scaleType);

  useEffect(() => {
    const selectedPiece = selectedPieceId
      ? PIANOLA_PIECES.find((p) => p.id === selectedPieceId) ?? null
      : null;
    if (piecePlaying && selectedPiece) {
      scalePlayer.playPiece(selectedPiece, (midi) => {
        setActiveNotes(midi === null ? [] : [midi]);
      });
    } else if (ascPlaying) {
      scalePlayer.playScale(root, scaleType, "asc");
    } else if (ascDescPlaying) {
      scalePlayer.playScale(root, scaleType, "ascdesc");
    } else {
      scalePlayer.stopScale();
    }
  }, [root, scaleType, ascPlaying, ascDescPlaying, piecePlaying, selectedPieceId, scalePlayer]);

  return (
    <ToolContainer title="Keys" icon="🎹">
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
            {!playableKeyboard && (
              <div key="pieces">
                <p className="text-xs text-[#555] mb-1">Piezas de pianola</p>
                <div className="flex flex-wrap gap-1">
                  {PIANOLA_PIECES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => togglePiece(p.id)}
                      className={`px-3 py-1 rounded border text-xs transition-all ${
                        piecePlaying && selectedPieceId === p.id
                          ? "border-[#ff4455] text-[#ff4455] bg-[#ff4455]/10"
                          : "border-[#2a2a4a] text-[#8888aa] hover:border-[#ff4455]/50"
                      }`}
                      title={`${p.name} · ${p.composer} · ${p.tempo} BPM`}
                    >
                      {piecePlaying && selectedPieceId === p.id ? "■ " : "▶ "}
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card-cyber rounded p-4 overflow-x-auto">
          <PianoKeyboard
            startOctave={4}
            octaves={2}
            highlightedNotes={highlightedNotes}
            rootNote={root}
            activeNotes={activeNotes}
            showLabels={showLabels}
            onNoteClick={playMidi}
          />
          <div className="flex items-center justify-between mt-3 gap-2">
            <button
              onClick={togglePlayableKeyboard}
              className={`px-3 py-1 rounded border text-[10px] font-mono transition-all ${
                playableKeyboard
                  ? "border-[#00ffff]/60 text-[#00ffff] bg-[#00ffff]/10"
                  : "border-[#ffaa00]/60 text-[#ffaa00] bg-[#ffaa00]/10"
              }`}
              title="Alternar entre tocar con el teclado físico (TECLADO) y solo visualizar la escala (PIANOLA)"
            >
              MODO: {playableKeyboard ? "TECLADO" : "PIANOLA"}
            </button>
            {playableKeyboard && (
              <button
                onClick={() => setShowLabels((s) => !s)}
                className={`px-3 py-1 rounded border text-[10px] font-mono transition-all ${
                  showLabels
                    ? "border-[#ffdd44]/60 text-[#ffdd44] bg-[#ffdd44]/10"
                    : "border-[#2a2a4a] text-[#8888aa] hover:border-[#ffdd44]/50"
                }`}
                title="Mostrar u ocultar las etiquetas de teclas sobre el piano"
              >
                TECLAS: {showLabels ? "ON" : "OFF"}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-4">
            <button
              onClick={() => togglePlay("asc")}
              className={`px-6 py-3 rounded font-bold text-sm tracking-wider transition-all ${
                ascPlaying
                  ? "bg-red-900/50 text-red-400 border border-red-800 hover:bg-red-900/70"
                  : "border border-[#00ffff]/50 text-[#00ffff] bg-[#00ffff]/10 hover:bg-[#00ffff]/20"
              }`}
            >
              {ascPlaying ? "■ DETENER" : "▶ REPRODUCIR ESCALA"}
            </button>
            <button
              onClick={() => togglePlay("ascdesc")}
              className={`px-6 py-3 rounded font-bold text-sm tracking-wider transition-all ${
                ascDescPlaying
                  ? "bg-red-900/50 text-red-400 border border-red-800 hover:bg-red-900/70"
                  : "border border-[#ffaa00]/50 text-[#ffaa00] bg-[#ffaa00]/10 hover:bg-[#ffaa00]/20"
              }`}
            >
              {ascDescPlaying ? "■ DETENER" : "▶ ASC + DESC"}
            </button>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => downloadMidi("asc")}
              className="px-4 py-1.5 rounded border border-[#00ff66]/50 text-[#00ff66] text-xs tracking-wider hover:bg-[#00ff66]/10 transition-all"
              title="Descargar patrón ascendente como archivo MIDI (200 BPM)"
            >
              ⬇ MIDI ASC
            </button>
            <button
              onClick={() => downloadMidi("ascdesc")}
              className="px-4 py-1.5 rounded border border-[#00ff66]/50 text-[#00ff66] text-xs tracking-wider hover:bg-[#00ff66]/10 transition-all"
              title="Descargar patrón ascendente + descendente como archivo MIDI (200 BPM)"
            >
              ⬇ MIDI ASC+DESC
            </button>
          </div>
          <p className="text-xs text-[#555]">
            {piecePlaying
              ? `Reproduciendo pieza en bucle…`
              : ascPlaying
                ? "Reproduciendo escala ascendente en bucle…"
                : ascDescPlaying
                  ? "Reproduciendo escala ascendente + descendente en bucle…"
                  : "Pulsá para reproducir en bucle hasta detener."}
          </p>
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
