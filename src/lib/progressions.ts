"use client";

import type { Progression } from "@/lib/music-theory";

const d = (
  symbol: string,
  semitones: number,
  bars = 1,
): { symbol: string; semitones: number; bars: number } => ({ symbol, semitones, bars });

export const PROGRESSIONS: Progression[] = [
  {
    id: "i-iv-v-i",
    name: "I–IV–V–I",
    degrees: [d("I", 0), d("IV", 5), d("V", 7), d("I", 0)],
  },
  {
    id: "i-v-vi-iv",
    name: "I–V–vi–IV",
    degrees: [d("I", 0), d("V", 7), d("vi", 9), d("IV", 5)],
  },
  {
    id: "i-vi-iv-v",
    name: "I–vi–IV–V",
    degrees: [d("I", 0), d("vi", 9), d("IV", 5), d("V", 7)],
  },
  {
    id: "ii-v-i",
    name: "ii–V–I",
    degrees: [d("ii", 2), d("V", 7), d("I", 0, 2)],
  },
  {
    id: "i-iv-v-v",
    name: "I–IV–V–V",
    degrees: [d("I", 0), d("IV", 5), d("V", 7, 2)],
  },
  {
    id: "blues-12",
    name: "Blues 12 compases",
    degrees: [d("I", 0, 4), d("IV", 5, 2), d("I", 0, 2), d("V", 7, 1), d("IV", 5, 1), d("I", 0, 1), d("V", 7, 1)],
  },
  {
    id: "i-bvii-iv-i",
    name: "I–bVII–IV–I (Rock)",
    degrees: [d("I", 0), d("bVII", 10), d("IV", 5), d("I", 0)],
  },
];
