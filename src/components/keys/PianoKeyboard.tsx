"use client";

import { useRef, useEffect, useCallback } from "react";
import { NOTE_NAMES, MIDI_TO_KEYBOARD_KEY } from "@/lib/music-theory";

const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const KEY_WIDTH = 40;
const KEY_HEIGHT = 140;
const BLACK_KEY_WIDTH = 24;
const BLACK_KEY_HEIGHT = 85;

interface PianoKeyboardProps {
  startOctave: number;
  octaves: number;
  highlightedNotes: number[];
  rootNote: string;
  activeNotes?: number[];
  showLabels?: boolean;
  onNoteClick: (midi: number) => void;
}

export default function PianoKeyboard({
  startOctave,
  octaves,
  highlightedNotes,
  rootNote,
  activeNotes = [],
  showLabels = true,
  onNoteClick,
}: PianoKeyboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const totalWhiteKeys = octaves * 7;
  const canvasWidth = totalWhiteKeys * KEY_WIDTH;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const isActive = (midi: number) => activeNotes.includes(midi);
    const drawKeyLabel = (x: number, y: number, midi: number) => {
      if (!showLabels) return;
      const label = MIDI_TO_KEYBOARD_KEY[midi];
      if (!label) return;
      ctx.fillStyle = isActive(midi) ? "#ffdd44" : "#3a3a5a";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, x, y);
    };
    const drawActiveGlow = (x: number, y: number, wd: number, ht: number) => {
      ctx.shadowColor = "#ffdd44";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "rgba(255, 221, 68, 0.35)";
      ctx.fillRect(x, y, wd, ht);
      ctx.shadowBlur = 0;
    };

    // Draw white keys
    let whiteKeyIndex = 0;
    for (let oct = 0; oct < octaves; oct++) {
      for (let i = 0; i < 7; i++) {
        const noteIdx = WHITE_KEYS[i];
        const midi = (startOctave + 1) * 12 + noteIdx + oct * 12;
        const x = whiteKeyIndex * KEY_WIDTH;
        const isHighlighted = highlightedNotes.includes(midi);
        const isRoot = NOTE_NAMES[noteIdx] === rootNote;

        ctx.fillStyle = isHighlighted
          ? (isRoot ? "rgba(255, 0, 255, 0.25)" : "rgba(0, 255, 255, 0.2)")
          : "#1a1a2e";
        ctx.fillRect(x, 0, KEY_WIDTH - 1, KEY_HEIGHT);
        ctx.strokeStyle = isHighlighted
          ? (isRoot ? "#ff00ff" : "#00ffff")
          : "#2a2a4a";
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.strokeRect(x, 0, KEY_WIDTH - 1, KEY_HEIGHT);

        if (isActive(midi)) {
          drawActiveGlow(x, 0, KEY_WIDTH - 1, KEY_HEIGHT);
        }

        if (isHighlighted) {
          ctx.shadowColor = isRoot ? "#ff00ff" : "#00ffff";
          ctx.shadowBlur = 10;
          ctx.fillStyle = isRoot ? "rgba(255,0,255,0.1)" : "rgba(0,255,255,0.1)";
          ctx.fillRect(x, 0, KEY_WIDTH - 1, KEY_HEIGHT);
          ctx.shadowBlur = 0;
        }

        drawKeyLabel(x + KEY_WIDTH / 2, KEY_HEIGHT - 10, midi);

        whiteKeyIndex++;
      }
    }

    // Draw black keys
    whiteKeyIndex = 0;
    for (let oct = 0; oct < octaves; oct++) {
      for (let i = 0; i < 7; i++) {
        if (i === 2 || i === 6) {
          whiteKeyIndex++;
          continue;
        }
        const blackNoteIdx = (WHITE_KEYS[i] + 1) % 12;
        const midi = (startOctave + 1) * 12 + blackNoteIdx + oct * 12;
        const isHighlighted = highlightedNotes.includes(midi);
        const x = (whiteKeyIndex + 1) * KEY_WIDTH - BLACK_KEY_WIDTH / 2;

        ctx.fillStyle = isHighlighted
          ? "rgba(0, 255, 255, 0.8)"
          : "#0a0a0f";
        ctx.fillRect(x, 0, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT);
        ctx.strokeStyle = isHighlighted ? "#00ffff" : "#2a2a4a";
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.strokeRect(x, 0, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT);

        if (isActive(midi)) {
          drawActiveGlow(x, 0, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT);
        }

        if (isHighlighted) {
          ctx.shadowColor = "#00ffff";
          ctx.shadowBlur = 10;
          ctx.fillStyle = "rgba(0,255,255,0.3)";
          ctx.fillRect(x, 0, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT);
          ctx.shadowBlur = 0;
        }

        drawKeyLabel(x + BLACK_KEY_WIDTH / 2, BLACK_KEY_HEIGHT - 8, midi);

        whiteKeyIndex++;
      }
    }
  }, [startOctave, octaves, highlightedNotes, rootNote, activeNotes, showLabels]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleX;

    // Check black keys first
    let whiteKeyIndex = 0;
    for (let oct = 0; oct < octaves; oct++) {
      for (let i = 0; i < 7; i++) {
        if (i === 2 || i === 6) {
          whiteKeyIndex++;
          continue;
        }
        const blackNoteIdx = (WHITE_KEYS[i] + 1) % 12;
        const midi = (startOctave + 1) * 12 + blackNoteIdx + oct * 12;
        const x = (whiteKeyIndex + 1) * KEY_WIDTH - BLACK_KEY_WIDTH / 2;

        if (mx >= x && mx <= x + BLACK_KEY_WIDTH && my <= BLACK_KEY_HEIGHT) {
          onNoteClick(midi);
          return;
        }
        whiteKeyIndex++;
      }
    }

    // Check white keys
    whiteKeyIndex = 0;
    for (let oct = 0; oct < octaves; oct++) {
      for (let i = 0; i < 7; i++) {
        const noteIdx = WHITE_KEYS[i];
        const midi = (startOctave + 1) * 12 + noteIdx + oct * 12;
        const x = whiteKeyIndex * KEY_WIDTH;

        if (mx >= x && mx <= x + KEY_WIDTH) {
          onNoteClick(midi);
          return;
        }
        whiteKeyIndex++;
      }
    }
  }, [startOctave, octaves, onNoteClick]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={KEY_HEIGHT}
      onClick={handleClick}
      className="cursor-pointer rounded"
      style={{ minWidth: canvasWidth, maxWidth: "none" }}
    />
  );
}
