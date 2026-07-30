"use client";

import { useEffect, useRef } from "react";

const KATAKANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
const ASCII = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const CHAR_POOL = KATAKANA + ASCII;

interface Drop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let drops: Drop[] = [];
let animId: number | null = null;

function init(width: number, height: number) {
  const cols = Math.floor(width / 20);
  drops = Array.from({ length: cols }, (_, i) => ({
    x: i * 20,
    y: Math.random() * height,
    speed: 2 + Math.random() * 6,
    chars: Array.from({ length: 8 + Math.floor(Math.random() * 12) }, () =>
      CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)]
    ),
    length: 8 + Math.floor(Math.random() * 12),
  }));
}

export default function DigitalRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    canvas = c;
    ctx = c.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas || !ctx) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init(canvas.width, canvas.height);
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!ctx || !canvas) return;
      const intensity = 0.5; // fixed medium intensity for SPA
      if (intensity <= 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animId = requestAnimationFrame(draw);
        return;
      }

      ctx.fillStyle = `rgba(10, 10, 15, ${0.05 + intensity * 0.1})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "16px monospace";
      const alpha = 0.2 + intensity * 0.8;

      for (const drop of drops) {
        const leading = Math.random() < 0.02;
        for (let i = 0; i < drop.length; i++) {
          const y = drop.y - i * 20;
          if (y < 0 || y > canvas.height) continue;
          if (i === 0) {
            ctx.fillStyle = `rgba(200, 255, 200, ${alpha})`;
          } else {
            const fade = Math.max(0, 1 - i / drop.length);
            ctx.fillStyle = `rgba(0, 220, 136, ${alpha * fade * 0.6})`;
          }
          const char = leading
            ? CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)]
            : drop.chars[i];
          ctx.fillText(char, drop.x, y);
        }
        drop.y += drop.speed * intensity;
        if (drop.y - drop.length * 20 > canvas.height) {
          drop.y = -drop.length * 20;
          drop.speed = 2 + Math.random() * 6;
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  );
}
