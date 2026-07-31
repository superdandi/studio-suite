const TEMPO_BYTES = new Uint8Array([0xff, 0x51, 0x03]);
const END_OF_TRACK = new Uint8Array([0xff, 0x2f, 0x00]);

function encodeVarint(value: number): number[] {
  const groups: number[] = [];
  let v = Math.max(0, Math.floor(value));
  do {
    groups.unshift(v & 0x7f);
    v = Math.floor(v / 0x80);
  } while (v > 0);
  for (let i = 0; i < groups.length - 1; i++) groups[i] |= 0x80;
  return groups;
}

export interface BuildScaleMidiOptions {
  sequence: number[];
  bpm?: number;
  ppq?: number;
  noteDurationMs?: number;
  noteSpacingMs?: number;
  program?: number;
  velocity?: number;
}

export function buildScaleMidi({
  sequence,
  bpm = 200,
  ppq = 480,
  noteDurationMs = 250,
  noteSpacingMs = 300,
  program = 0,
  velocity = 90,
}: BuildScaleMidiOptions): Uint8Array {
  const quarterMs = 60000 / bpm;
  const ticksPerMs = ppq / quarterMs;
  const durationTicks = Math.round(noteDurationMs * ticksPerMs);
  const spacingTicks = Math.round(noteSpacingMs * ticksPerMs);
  const tempoUspq = Math.round(60000000 / bpm);

  const events: number[] = [];

  const pushEvent = (delta: number, bytes: number[]) => {
    events.push(...encodeVarint(delta), ...bytes);
  };

  pushEvent(0, [...TEMPO_BYTES, (tempoUspq >> 16) & 0xff, (tempoUspq >> 8) & 0xff, tempoUspq & 0xff]);
  pushEvent(0, [0xc0, program & 0x7f]);

  let lastTime = 0;
  for (let i = 0; i < sequence.length; i++) {
    const onTime = i * spacingTicks;
    const offTime = onTime + durationTicks;
    const midi = sequence[i] & 0x7f;
    pushEvent(onTime - lastTime, [0x90, midi, velocity]);
    lastTime = onTime;
    pushEvent(offTime - lastTime, [0x80, midi, 0x40]);
    lastTime = offTime;
  }
  pushEvent(0, [...END_OF_TRACK]);

  const header = new Uint8Array([
    0x4d, 0x54, 0x68, 0x64,
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x00,
    0x00, 0x01,
    (ppq >> 8) & 0xff, ppq & 0xff,
  ]);

  const trackLen = events.length;
  const track = new Uint8Array([
    0x4d, 0x54, 0x72, 0x6b,
    (trackLen >> 24) & 0xff, (trackLen >> 16) & 0xff, (trackLen >> 8) & 0xff, trackLen & 0xff,
    ...events,
  ]);

  const out = new Uint8Array(header.length + track.length);
  out.set(header, 0);
  out.set(track, header.length);
  return out;
}

export function triggerDownload(filename: string, data: Uint8Array): void {
  const blob = new Blob([data as BlobPart], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
