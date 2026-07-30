"use client";

import { useEffect, useRef } from "react";

export default function ProximityGlow() {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function smootherstep(t: number) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function update() {
      const vh = window.innerHeight;
      const center = vh / 2;

      document.querySelectorAll<HTMLElement>(".card-glow").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = Math.abs(elCenter - center);
        const rawScroll = Math.max(0, 1 - dist / (vh * 0.8));
        const t = Math.max(0.03, Math.pow(smootherstep(rawScroll), 1.6));
        const s = t * 0.82;

        const isPulse = el.classList.contains("card-glass-pulse");
        if (isPulse && t > 0.05) {
          const freq = 0.3 + t * 3.7;
          const halfWave = (Math.sin(performance.now() / 1000 * freq * Math.PI * 2) + 1) / 2;
          const envelope = s + Math.pow(halfWave, 8) * 1.5 * t * t;
          const shockRing = Math.pow(halfWave, 14) * t * t * t;
          el.style.boxShadow = `0 0 ${15 + envelope * 35}px rgba(255, 0, 255, ${0.06 + envelope * 0.2}), 0 0 ${5 + shockRing * 60}px rgba(0, 255, 255, ${shockRing * 0.15})`;
        } else {
          el.style.boxShadow = `0 0 ${5 + s * 25}px rgba(255, 0, 255, ${0.04 + s * 0.15})`;
        }
      });

      rafRef.current = requestAnimationFrame(update);
    }

    update();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return null;
}
