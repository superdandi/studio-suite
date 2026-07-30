export function yinPitchDetect(buffer: Float32Array, sampleRate: number): number | null {
  const threshold = 0.1;
  const bufferSize = buffer.length;
  const maxLag = Math.floor(bufferSize / 2);
  const minLag = Math.floor(sampleRate / 2000);

  const diff = new Float32Array(maxLag);
  for (let tau = 0; tau < maxLag; tau++) {
    let sum = 0;
    for (let i = 0; i < maxLag; i++) {
      const d = buffer[i] - buffer[i + tau];
      sum += d * d;
    }
    diff[tau] = sum;
  }

  const cmnd = new Float32Array(maxLag);
  cmnd[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < maxLag; tau++) {
    runningSum += diff[tau];
    cmnd[tau] = diff[tau] / (runningSum / tau);
  }

  for (let tau = minLag; tau < maxLag; tau++) {
    if (cmnd[tau] < threshold) {
      const betterTau = tau + parabolicInterpolation(cmnd[tau - 1], cmnd[tau], cmnd[tau + 1]);
      return sampleRate / betterTau;
    }
  }

  return null;
}

function parabolicInterpolation(y1: number, y2: number, y3: number): number {
  const denom = 2 * (2 * y2 - y1 - y3);
  if (denom === 0) return 0;
  return (y1 - y3) / denom;
}
