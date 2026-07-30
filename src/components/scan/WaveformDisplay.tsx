"use client";

import { useRef, useEffect } from "react";

export default function WaveformDisplay({ data }: { data: Float32Array }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 1.5;

    for (let i = 0; i < data.length; i++) {
      const x = (i / data.length) * w;
      const y = (data[i] * 0.5 + 0.5) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [data]);

  return (
    <div>
      <p className="text-xs text-[#8888aa] mb-1">Forma de onda</p>
      <canvas
        ref={canvasRef}
        width={512}
        height={128}
        className="w-full rounded border border-[#2a2a4a]"
      />
    </div>
  );
}
