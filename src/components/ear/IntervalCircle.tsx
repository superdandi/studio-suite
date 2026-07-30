"use client";

import { useRef, useEffect, useCallback } from "react";
import { NOTE_NAMES } from "@/lib/music-theory";

const RADIUS = 120;
const CENTER = 150;
const NOTE_RADIUS = 14;

interface IntervalCircleProps {
  selectedInterval: number | null;
  currentInterval: number | null;
  onIntervalClick: (semitones: number) => void;
}

export default function IntervalCircle({
  selectedInterval,
  currentInterval: _currentInterval,
  onIntervalClick,
}: IntervalCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = CENTER * 2;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Outer ring
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS + 20, 0, Math.PI * 2);
    ctx.strokeStyle = "#2a2a4a";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw note positions and lines
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x = CENTER + RADIUS * Math.cos(angle);
      const y = CENTER + RADIUS * Math.sin(angle);

      // Lines connecting to center
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.lineTo(x, y);
      ctx.strokeStyle = i % 2 === 0 ? "rgba(42,42,74,0.3)" : "rgba(42,42,74,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw interval arcs if selected
      if (selectedInterval !== null) {
        const interval = selectedInterval;
        const endAngle = (i + interval) % 12;
        if (interval > 0 && interval <= 12) {
          const startAngleRad = (i * 30 - 90) * (Math.PI / 180);
          const endAngleRad = (endAngle * 30 - 90) * (Math.PI / 180);

          ctx.beginPath();
          ctx.arc(CENTER, CENTER, RADIUS - NOTE_RADIUS, startAngleRad, endAngleRad);
          ctx.strokeStyle = interval <= 7 ? "#00ffff" : "#ff00ff";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    }

    // Draw notes
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x = CENTER + RADIUS * Math.cos(angle);
      const y = CENTER + RADIUS * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, NOTE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1a2e";
      ctx.fill();
      ctx.strokeStyle = "#2a2a4a";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#8888aa";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(NOTE_NAMES[i], x, y);
    }

    // Center
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, NOTE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#0a0a0f";
    ctx.fill();
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ff00ff";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("C", CENTER, CENTER);
  }, [selectedInterval]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x = CENTER + RADIUS * Math.cos(angle);
      const y = CENTER + RADIUS * Math.sin(angle);
      const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);

      if (dist <= NOTE_RADIUS + 5) {
        onIntervalClick(i);
        return;
      }
    }
  }, [onIntervalClick]);

  return (
    <div className="inline-block">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onClick={handleClick}
        className="cursor-pointer"
        style={{ maxWidth: size, maxHeight: size }}
      />
    </div>
  );
}
