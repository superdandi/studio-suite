"use client";

import { NOTE_NAMES } from "@/lib/music-theory";
import type { AnalysisResult } from "@/lib/analyzer";

export default function AnalysisInfo({ result }: { result: AnalysisResult }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="card-cyber rounded p-3">
        <p className="text-xs text-[#8888aa] mb-1">Notas detectadas</p>
        <div className="flex flex-wrap gap-1">
          {result.pitchClasses.length > 0 ? (
            [...new Set(result.pitchClasses)].slice(0, 6).map((pc, i) => (
              <span key={i} className="text-sm font-mono font-bold text-[#00ffff]">
                {NOTE_NAMES[((pc % 12) + 12) % 12]}
              </span>
            ))
          ) : (
            <span className="text-sm text-[#555]">—</span>
          )}
        </div>
      </div>

      <div className="card-cyber rounded p-3">
        <p className="text-xs text-[#8888aa] mb-1">Acorde</p>
        <span className="text-lg font-mono font-bold text-[#ff00ff]">
          {result.chord || "—"}
        </span>
      </div>

      <div className="card-cyber rounded p-3">
        <p className="text-xs text-[#8888aa] mb-1">Tonalidad</p>
        <span className="text-lg font-mono font-bold text-[#00dd88]">
          {result.key || "—"}
        </span>
      </div>

      <div className="card-cyber rounded p-3">
        <p className="text-xs text-[#8888aa] mb-1">Picos espectrales</p>
        <span className="text-lg font-mono font-bold text-[#ffaa00]">
          {result.peaks.length}
        </span>
      </div>
    </div>
  );
}
