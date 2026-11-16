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

  // --- City Pop ---
  {
    // 丸サ進行 / "Just the Two of Us": el descenso cromático IV→III7 es la firma.
    id: "city-pop-marusa",
    name: "City Pop (丸サ進行)",
    degrees: [d("IVmaj7", 5), d("III7", 4), d("vi7", 9), d("v7", 7), d("I7", 0)],
  },
  {
    id: "city-pop-ii-v-i",
    name: "City Pop (ii–V–I)",
    degrees: [d("ii7", 2), d("V7", 7), d("Imaj7", 0), d("vi7", 9)],
  },
  {
    // Plastic Love (Mariya Takeuchi): i–IV–ii–v en menor.
    id: "city-pop-plastic-love",
    name: "City Pop (Plastic Love)",
    degrees: [d("i", 0), d("IV", 5), d("ii", 2), d("v", 7)],
    suggestedScale: "natural-minor",
  },

  // --- Cueca chilena ---
  {
    // Modo mayor, tónica–subdominante–dominante con séptima (base del "pie de cueca").
    id: "cueca-chilena",
    name: "Cueca chilena",
    degrees: [d("I", 0), d("IV", 5), d("V7", 7), d("I", 0)],
  },
  {
    // Cadencia "cuequera": bVI–V7–I.
    id: "cueca-cadencia",
    name: "Cueca (cadencia bVI–V7–I)",
    degrees: [d("bVI", 8), d("V7", 7), d("I", 0)],
  },

  // --- Reggaetón ---
  {
    // Loop menor universal del dembow (Despacito, Ginza, Mi Gente).
    id: "reggaeton",
    name: "Reggaetón",
    degrees: [d("i", 0), d("VI", 8), d("III", 3), d("VII", 10)],
    suggestedScale: "natural-minor",
  },
  {
    // Variante más oscura de Gasolina (Daddy Yankee).
    id: "reggaeton-gasolina",
    name: "Reggaetón (Gasolina)",
    degrees: [d("i", 0), d("bVII", 10), d("bVI", 8), d("bVII", 10)],
    suggestedScale: "natural-minor",
  },

  // --- Neo Soul ---
  {
    // ii–V–I jazzero con el VI7 que reabre el ciclo.
    id: "neo-soul",
    name: "Neo Soul",
    degrees: [d("ii7", 2), d("V7", 7), d("Imaj7", 0), d("VI7", 9)],
  },
  {
    // Backdoor: iv7–bVII7–Imaj7.
    id: "neo-soul-backdoor",
    name: "Neo Soul (backdoor)",
    degrees: [d("iv7", 5), d("bVII7", 10), d("Imaj7", 0)],
  },

  // --- Royal Road (王道進行) ---
  {
    id: "royal-road",
    name: "Royal Road (王道進行)",
    degrees: [d("IVmaj7", 5), d("V7", 7), d("iii7", 4), d("vi7", 9)],
  },
  {
    // Versión con la cadencia ii–V–I final que resuelve en la tónica.
    id: "royal-road-resolved",
    name: "Royal Road (resuelto)",
    degrees: [
      d("IVmaj7", 5),
      d("V7", 7),
      d("iii7", 4),
      d("vi7", 9),
      d("ii7", 2),
      d("V7", 7),
      d("I", 0),
    ],
  },

  // --- Canción ---
  {
    // "Soy pan, soy paz, soy más" (Piero / Luis Ramón Igarzábal, 1981).
    // Verso I↔IV y estribillo ii–V–I: el motor armónico de la canción.
    id: "soy-pan-soy-paz",
    name: "Soy pan, soy paz, soy más",
    degrees: [d("Imaj7", 0), d("IVmaj7", 5), d("ii7", 2), d("V7", 7), d("Imaj7", 0)],
  },
];
