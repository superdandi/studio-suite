export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export type NoteName = typeof NOTE_NAMES[number];

export const GUITAR_STRINGS = [
  { note: "E", octave: 2, midi: 40 },
  { note: "A", octave: 2, midi: 45 },
  { note: "D", octave: 3, midi: 50 },
  { note: "G", octave: 3, midi: 55 },
  { note: "B", octave: 3, midi: 59 },
  { note: "E", octave: 4, midi: 64 },
] as const;

export const BASS_STRINGS = [
  { note: "E", octave: 1, midi: 28 },
  { note: "A", octave: 1, midi: 33 },
  { note: "D", octave: 2, midi: 38 },
  { note: "G", octave: 2, midi: 43 },
] as const;

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToNote(freq: number): { note: NoteName; octave: number; midi: number; cents: number } {
  const midi = Math.round(12 * Math.log2(freq / 440) + 69);
  const freqExpected = midiToFrequency(midi);
  const cents = 1200 * Math.log2(freq / freqExpected);
  const note = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { note, octave, midi, cents };
}

export const KEYBOARD_KEY_SEQUENCE = [
  "q", "2", "w", "3", "e", "r", "5", "t", "6", "y", "7", "u",
  "v", "g", "b", "h", "n", "m", "k", ",", "l", ".", "ñ", "-",
] as const;

export const KEYBOARD_KEY_TO_MIDI: Record<string, number> = {};
export const MIDI_TO_KEYBOARD_KEY: Record<number, string> = {};

for (let i = 0; i < KEYBOARD_KEY_SEQUENCE.length; i++) {
  const key = KEYBOARD_KEY_SEQUENCE[i];
  const midi = 60 + i;
  KEYBOARD_KEY_TO_MIDI[key] = midi;
  MIDI_TO_KEYBOARD_KEY[midi] = key;
}

export function noteToMidi(note: NoteName, octave: number): number {
  return NOTE_NAMES.indexOf(note) + (octave + 1) * 12;
}

export function centsBetween(f1: number, f2: number): number {
  return 1200 * Math.log2(f2 / f1);
}

export const INTERVALS = [
  { semitones: 0, name: "Unísono", short: "P1", quality: "perfecto" },
  { semitones: 1, name: "2ª menor", short: "m2", quality: "menor" },
  { semitones: 2, name: "2ª mayor", short: "M2", quality: "mayor" },
  { semitones: 3, name: "3ª menor", short: "m3", quality: "menor" },
  { semitones: 4, name: "3ª mayor", short: "M3", quality: "mayor" },
  { semitones: 5, name: "4ª justa", short: "P4", quality: "perfecto" },
  { semitones: 6, name: "Tritono", short: "TT", quality: "dissonante" },
  { semitones: 7, name: "5ª justa", short: "P5", quality: "perfecto" },
  { semitones: 8, name: "6ª menor", short: "m6", quality: "menor" },
  { semitones: 9, name: "6ª mayor", short: "M6", quality: "mayor" },
  { semitones: 10, name: "7ª menor", short: "m7", quality: "menor" },
  { semitones: 11, name: "7ª mayor", short: "M7", quality: "mayor" },
  { semitones: 12, name: "Octava", short: "P8", quality: "perfecto" },
] as const;

export const SCALE_TYPES = {
  major: {
    name: "Mayor",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: "Tono-Tono-Semitono-Tono-Tono-Tono-Semitono",
  },
  "natural-minor": {
    name: "Menor Natural",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: "Tono-Semitono-Tono-Tono-Semitono-Tono-Tono",
  },
  "harmonic-minor": {
    name: "Menor Armónica",
    intervals: [0, 2, 3, 5, 7, 8, 11],
    description: "Tono-Semitono-Tono-Tono-Semitono-Tono+1/2-Semitono",
  },
  "melodic-minor": {
    name: "Menor Melódica",
    intervals: [0, 2, 3, 5, 7, 9, 11],
    description: "Tono-Semitono-Tono-Tono-Tono-Tono-Semitono",
  },
  dorian: {
    name: "Dórico",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: "Modo II: 1-2-♭3-4-5-6-♭7",
  },
  phrygian: {
    name: "Frigio",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: "Modo III: 1-♭2-♭3-4-5-♭6-♭7",
  },
  lydian: {
    name: "Lidio",
    intervals: [0, 2, 4, 6, 7, 9, 11],
    description: "Modo IV: 1-2-3-♯4-5-6-7",
  },
  mixolydian: {
    name: "Mixolidio",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: "Modo V: 1-2-3-4-5-6-♭7",
  },
  locrian: {
    name: "Locrio",
    intervals: [0, 1, 3, 5, 6, 8, 10],
    description: "Modo VII: 1-♭2-♭3-4-♭5-♭6-♭7",
  },
  "pentatonic-major": {
    name: "Pentatónica Mayor",
    intervals: [0, 2, 4, 7, 9],
    description: "T-T-1½-T-1½",
  },
  "pentatonic-minor": {
    name: "Pentatónica Menor",
    intervals: [0, 3, 5, 7, 10],
    description: "1½-T-T-1½-T",
  },
  blues: {
    name: "Blues",
    intervals: [0, 3, 5, 6, 7, 10],
    description: "1-♭3-4-♭5-5-♭7",
  },
  chromatic: {
    name: "Cromática",
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    description: "Todos los 12 semitonos",
  },
  "whole-tone": {
    name: "Tonos Enteros",
    intervals: [0, 2, 4, 6, 8, 10],
    description: "T-T-T-T-T",
  },
  octatonic: {
    name: "Octatónica (T-ST)",
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    description: "T-ST-T-ST-T-ST-T-ST",
  },
  hirajoshi: {
    name: "Hirajoshi",
    intervals: [0, 2, 3, 7, 8],
    description: "Japonesa: T-½-2T-½-3½",
  },
  iwato: {
    name: "Iwato",
    intervals: [0, 1, 5, 6, 10],
    description: "Japonesa: ½-2T+½-½-2T+½",
  },
  insen: {
    name: "In-sen",
    intervals: [0, 1, 5, 7, 10],
    description: "Japonesa (sakura): ½-2T+½-T-1½+½",
  },
  yo: {
    name: "Yo",
    intervals: [0, 2, 5, 7, 9],
    description: "Japonesa pentatónica sin semitonos",
  },
  hijaz: {
    name: "Hijaz (Doble Armónica)",
    intervals: [0, 1, 4, 5, 7, 8, 11],
    description: "Árabe: ½-1½-½-T-½-1½-½",
  },
  rast: {
    name: "Rast",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: "Árabe (maqam): T-T-½-T-T-T-½",
  },
  "phrygian-dominant": {
    name: "Frigia Dominante",
    intervals: [0, 1, 4, 5, 7, 8, 10],
    description: "Árabe/flamenco: 1-♭2-3-4-5-♭6-♭7",
  },
  bhairav: {
    name: "Bhairav",
    intervals: [0, 1, 4, 5, 7, 8, 11],
    description: "India (raga matinal): 1-♭2-3-4-5-♭6-7",
  },
  bhairavi: {
    name: "Bhairavi",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: "India: 1-♭2-♭3-4-5-♭6-♭7",
  },
  todi: {
    name: "Todi",
    intervals: [0, 1, 3, 6, 7, 8, 11],
    description: "India: 1-♭2-♭3-♯4-5-♭6-7 (tritono)",
  },
  pelog: {
    name: "Pelog (Balinese)",
    intervals: [0, 1, 3, 7, 8],
    description: "Gamelán javanés: ½-T-2T-½-3½",
  },
  slendro: {
    name: "Slendro",
    intervals: [0, 2, 4, 7, 9],
    description: "Gamelán: 5 notas casi equiespaciadas",
  },
  "african-pentatonic": {
    name: "Africana Pentatónica",
    intervals: [0, 2, 4, 7, 9],
    description: "Pentatónica mayor, base de muchas músicas africanas",
  },
} as const;

export type ScaleType = keyof typeof SCALE_TYPES;

export function getScaleNotes(root: NoteName, scaleType: ScaleType): NoteName[] {
  const rootIdx = NOTE_NAMES.indexOf(root);
  const scale = SCALE_TYPES[scaleType];
  return scale.intervals.map(i => NOTE_NAMES[(rootIdx + i) % 12]);
}

export function getScaleMidi(root: NoteName, scaleType: ScaleType, octave = 4): number[] {
  const rootMidi = noteToMidi(root, octave);
  return SCALE_TYPES[scaleType].intervals.map(i => rootMidi + i);
}

export function getScaleMidiSequence(
  root: NoteName,
  scaleType: ScaleType,
  mode: "asc" | "ascdesc" = "asc",
): number[] {
  const asc = getScaleMidi(root, scaleType, 4);
  return mode === "asc" ? asc : [...asc, ...asc.slice(1, -1).reverse()];
}

export function getScaleDegrees(_root: NoteName, scaleType: ScaleType): string[] {
  const scale = SCALE_TYPES[scaleType];
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return scale.intervals.map((_, i) => roman[i]);
}

export const CHORD_DICTIONARY: Record<string, number[]> = {
  "": [0, 4, 7],
  "m": [0, 3, 7],
  "dim": [0, 3, 6],
  "aug": [0, 4, 8],
  "7": [0, 4, 7, 10],
  "maj7": [0, 4, 7, 11],
  "m7": [0, 3, 7, 10],
  "mM7": [0, 3, 7, 11],
  "dim7": [0, 3, 6, 9],
  "m7b5": [0, 3, 6, 10],
  "aug7": [0, 4, 8, 10],
  "6": [0, 4, 7, 9],
  "m6": [0, 3, 7, 9],
  "sus2": [0, 2, 7],
  "sus4": [0, 5, 7],
  "9": [0, 4, 7, 10, 14],
  "maj9": [0, 4, 7, 11, 14],
  "m9": [0, 3, 7, 10, 14],
};

export function identifyChord(pitchClasses: number[]): string | null {
  const sorted = [...new Set(pitchClasses.map(p => ((p % 12) + 12) % 12))].sort((a, b) => a - b);
  if (sorted.length < 2) return null;

  let bestMatch = null as { root: number; quality: string; score: number } | null;

  for (let root = 0; root < 12; root++) {
    const normalized = sorted.map(p => ((p - root) % 12 + 12) % 12).sort((a, b) => a - b);

    for (const [quality, template] of Object.entries(CHORD_DICTIONARY)) {
      const normalizedTemplate = [...new Set(template.map(t => t % 12))].sort((a, b) => a - b);
      const matches = normalizedTemplate.filter(t => normalized.includes(t)).length;
      const total = normalizedTemplate.length;

      if (matches >= Math.min(total, sorted.length)) {
        const score = matches / total;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { root, quality, score };
        }
      }
    }
  }

  if (!bestMatch || bestMatch.score < 0.5) return null;
  return `${NOTE_NAMES[bestMatch.root]}${bestMatch.quality}`;
}

export const KEY_PROFILES = {
  major: [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
  minor: [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17],
} as const;

export function detectKey(pitchClasses: number[]): { key: string; confidence: number } | null {
  if (pitchClasses.length === 0) return null;

  const histogram = new Array(12).fill(0);
  for (const pc of pitchClasses) {
    histogram[((pc % 12) + 12) % 12]++;
  }

  let bestKey = "";
  let bestScore = -Infinity;

  for (let root = 0; root < 12; root++) {
    for (const [mode, profile] of Object.entries(KEY_PROFILES)) {
      let score = 0;
      for (let i = 0; i < 12; i++) {
        score += histogram[(root + i) % 12] * profile[i];
      }
      if (score > bestScore) {
        bestScore = score;
        bestKey = `${NOTE_NAMES[root]} ${mode}`;
      }
    }
  }

  return { key: bestKey, confidence: bestScore > 0 ? 1 : 0 };
}

// --- Progresiones armónicas ---

export type ProgressionDegree = {
  symbol: string;
  semitones: number;
  bars: number;
};

export type Progression = {
  id: string;
  name: string;
  degrees: ProgressionDegree[];
};

export function getDegreeRoot(root: NoteName, degreeSemitones: number, octave = 4): number {
  return noteToMidi(root, octave) + degreeSemitones;
}

export function getProgressionMidiSequence(
  root: NoteName,
  scaleType: ScaleType,
  progression: Progression,
  mode: "asc" | "ascdesc" = "asc",
): number[] {
  const sequence: number[] = [];
  for (const degree of progression.degrees) {
    const degreeRoot = getDegreeRoot(root, degree.semitones);
    const degreeRootName = NOTE_NAMES[((degreeRoot % 12) + 12) % 12] as NoteName;
    for (let bar = 0; bar < degree.bars; bar++) {
      sequence.push(...getScaleMidiSequence(degreeRootName, scaleType, mode));
    }
  }
  return sequence;
}
