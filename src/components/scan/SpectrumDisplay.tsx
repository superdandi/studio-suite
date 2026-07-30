"use client";

import { useRef, useEffect } from "react";

export default function SpectrumDisplay({ data }: { data: Uint8Array }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const barWidth = w / data.length;
    for (let i = 0; i < data.length; i++) {
      const val = data[i] / 255;
      const barH = val * h;
      const r = Math.floor(255 * val);
      const g = Math.floor(200 * (1 - val * 0.5));
      const b = 255;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(i * barWidth, h - barH, barWidth - 1, barH);
    }
  }, [data]);

  return (
    <div>
      <p className="text-xs text-[#8888aa] mb-1">Espectro</p>
      <canvas
        ref={canvasRef}
        width={512}
        height={128}
        className="w-full rounded border border-[#2a2a4a]"
      />
    </div>
  );
}
