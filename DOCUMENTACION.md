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

- **Metrónomo**: `useMetronome` hook con `setInterval`. El BPM se actualiza en tiempo real via `useEffect` que reinicia el intervalo al cambiar BPM/figure mientras reproduce.
- **Afinador**: Algoritmo YIN pitch detection en `lib/tuner.ts`
- **Analizador**: FFT + peak picking + detección de acordes (Krumhansl-Schmuckler) en `lib/analyzer.ts`
- **Audio**: Todos los sonidos son procedurales (osciladores Web Audio), sin archivos de audio externos
- **Tema**: Cyberpunk con colores #ff00ff, #00ffff, #00dd88 sobre fondo #0a0a0f

## Build

```bash
npm run build    # next build + export estático
```

El output está en `out/`. Servir localmente:

```bash
python3 -m http.server 8080 -d out
# Abrir http://localhost:8080/studio-suite/
```


