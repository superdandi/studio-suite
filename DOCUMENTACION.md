# Studio Suite — Documentación Técnica

## Arquitectura

SPA con Next.js 15 (App Router) y export estático. Las herramientas viven en tabs laterales dentro de `page.tsx`, cada una cargada con `next/dynamic` para code splitting.

## Estructura

```
src/
├── app/                     # Layout + páginas
│   ├── globals.css          # Tema cyberpunk completo
│   ├── layout.tsx           # Layout raíz con Navbar + Footer
│   ├── page.tsx             # SPA con tabs dinámicos
│   └── theory/page.tsx      # Página de teoría musical
├── components/
│   ├── pulse/PulsePanel.tsx # Metrónomo
│   ├── tune/TunePanel.tsx   # Afinador cromático/guitarra/bajo
│   ├── scan/                # Analizador FFT + visualizaciones
│   ├── keys/                # Piano interactivo + escalas
│   ├── ear/                 # Entrenamiento auditivo + círculo cromático
│   ├── theory/              # 8 secciones de teoría musical
│   └── shared/              # Navbar, Footer, DigitalRain, etc.
├── hooks/                   # Custom hooks (Web Audio, micrófono, etc.)
└── lib/                     # Utilidades (audio, teoría, YIN, FFT)
```

## Notas técnicas

### Metrónomo

Hook `useMetronome` basado en cadena de `setTimeout` (permite timing irregular para swing).

**Figuras rítmicas** — cada figura define cuántas subdivisiones por pulso:
| Figura     | Divisiones |
|------------|-----------|
| Negra      | 1         |
| Corcheas   | 2         |
| Tresillos  | 3         |
| Semicorcheas | 4       |
| Quintillo  | 5         |
| Swing      | 2 (timing 66/33) |

**Swing** — las dos subdivisiones de cada pulso no son equitativas: la primera ocupa 2/3 del intervalo y la segunda 1/3. Esto se implementa calculando el delay de cada `setTimeout` individualmente según la posición dentro del par (`count % 2`).

**Compás** — define los beats por compás que determinan el ciclo de acentos y el display visual:
- 4/4: 4 beats · 3/4: 3 · 6/8: 2 (subdivisión ternaria) · 2/4: 2
- 5/4: 5 · 7/8: 7 · 9/8: 3 (subdivisión ternaria)

**Sonidos** — 4 tipos seleccionables, todos generados proceduralmente con Web Audio API:
| Tipo      | Acento         | Normal        | Técnica                      |
|-----------|----------------|---------------|------------------------------|
| Normal    | Square 2000Hz  | Square 1500Hz | Oscilador cuadrado, 30ms     |
| 808       | Cowbell ~900Hz | Rimshot + noise| Square pitch drop + noise burst, 40ms |
| FL Studio | Sine 2400Hz    | Sine 2000Hz   | Sine ataque rápidísimo (1ms), 18ms |
| Analógico | Sine 1000Hz    | Sine 800Hz    | Sine ataque suave (6ms), 80ms |

**TAP** — calcula BPM promedio a partir de hasta 5 toques.

- **Afinador**: Algoritmo YIN pitch detection en `lib/tuner.ts`
- **Analizador**: FFT + peak picking + detección de acordes (Krumhansl-Schmuckler) en `lib/analyzer.ts`
- **Audio**: Todos los sonidos son procedurales (osciladores Web Audio), sin archivos de audio externos
- **Tema**: Cyberpunk con colores #ff00ff, #00ffff, #00dd88 sobre fondo #0a0a0f
- **Footer**: Enlaces a Theory (local), Oscilate y VIZCOSO (externos)
- **Navegación**: Navbar con logo que vuelve al Dashboard + 5 tabs de herramientas

## Build

```bash
npm run build    # next build + export estático
```

El output está en `out/`. Servir localmente:

```bash
python3 -m http.server 8080 -d out
# Abrir http://localhost:8080/studio-suite/
```


