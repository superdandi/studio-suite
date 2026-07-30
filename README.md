# Studio Suite

Suite de herramientas musicales interactivas con temática cyberpunk. Metrónomo, afinador, analizador de audio, explorador de escalas, entrenamiento auditivo y teoría musical.

## Stack

- **Next.js 15** / React 19 / TypeScript
- Tailwind CSS 4
- Web Audio API + Canvas API
- Export estático para GitHub Pages

## Herramientas

| Tool  | Tab      | Descripción                                |
|-------|----------|--------------------------------------------|
| Pulse | Metrónomo| BPM, 7 figuras, 7 compases con acentuación, 4 sonidos x 3 niveles, TAP |
| Tune  | Afinador | Chromático / Guitarra / Bajo, detección YIN |
| Scan  | Analizador | Espectro FFT, forma de onda, detección de acordes y tonalidad |
| Keys  | Escalas  | Piano interactivo, resaltado de escalas, reproducción |
| Ear   | Oído     | 4 modos: explorar, practicar, reto 10s, reto 3s |
| Theory| Teoría   | 8 secciones educativas con referencias |

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # genera export estático en out/
npm run lint     # ESLint
```

## Build estático

```bash
npx next build
# output en out/
# deploy a GitHub Pages desde out/
```

## Créditos

Hecho por dandi — [@dandiboot](https://github.com/dandiboot)
