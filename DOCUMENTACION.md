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
| Corchea Swing | 2 (timing 66/33, ratio 2:1) |
| Negra c/punto y corchea | 2 (timing 75/25, ratio **3:1**) |

**Swing** — las dos subdivisiones de cada pulso no son equitativas: la primera ocupa 2/3 del intervalo y la segunda 1/3 (ratio 2:1). Esto se implementa calculando el delay de cada `setTimeout` individualmente según la posición dentro del par (`count % 2`).

**Negra con punto y corchea** — variante de swing con ratio **3:1**. La primera subdivisión ocupa 3/4 del pulso (375ms a 120 BPM) y la segunda 1/4 (125ms). Crea un ritmo puntillado característico de marchas y música barroca.

**Compás** — cada compás tiene un patrón de acentuación sobre la posición de corchea:

| Compás | Tipo | Corcheas | Patrón de acentos (posiciones 0-indexadas) |
|---|---|---|---|
| **2/4** | Binario simple | 4 | `[Fuerte, _, _, _]` |
| **3/4** | Ternario simple | 6 | `[Fuerte, _, _, _, _, _]` |
| **4/4** | Cuaternario simple | 8 | `[Fuerte, _, _, _, Medio, _, _, _]` |
| **5/4** | Quinario irregular | 10 | `[Fuerte, _, _, _, _, _, Medio, _, _, _]` (agrupación 3+2) |
| **6/8** | Binario compuesto | 6 | `[Fuerte, _, _, Medio, _, _]` (dos grupos de 3) |
| **7/8** | Septenario irregular | 7 | `[Fuerte, _, Medio, _, Medio, _, _]` (agrupación 2+2+3) |
| **9/8** | Ternario compuesto | 9 | `[Fuerte, _, _, Medio, _, _, Medio, _, _]` (tres grupos de 3) |

La implementación calcula la posición de corchea dentro del compás como `eighthPos = floor(count * 2 / subdivisions)` y aplica `EIGHTHS_PER_BAR[compás]` como módulo para determinar el nivel de acento (2=fuerte, 1=medio, 0=débil).

**Sonidos** — cada tipo de sonido tiene 3 variantes internas que se corresponden con los 3 niveles de acento del patrón del compás:

| Nivel | Normal | 808 | FL Studio | Analógico |
|---|---|---|---|---|
| **2 fuerte** | Square 2000Hz vol 0.30, 30ms | Cowbell ~900Hz + noise, 40ms | Sine 2400Hz vol 0.28, 18ms | Sine 1000Hz vol 0.22, 80ms |
| **1 medio** | Square 1500Hz vol 0.15, 30ms | Rimshot ~1800Hz + noise, 25ms | Sine 2000Hz vol 0.14, 18ms | Sine 800Hz vol 0.11, 80ms |
| **0 débil** | Square 1000Hz vol 0.05, 20ms | Noise burst vol 0.08, 15ms | Sine 1800Hz vol 0.05, 12ms | Sine 600Hz vol 0.04, 60ms |

Los acentos son independientes del tipo de sonido. El patrón de acentos viene del compás; el tipo de sonido solo define las frecuencias/volúmenes/timbres de cada nivel.

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


