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

**Sonidos** — cada tipo de sonido tiene 3 variantes internas que se corresponden con los 3 niveles de acento del patrón del compás. La duración de cada beat es **constante** dentro de cada tipo de sonido (no varía por acento). La diferenciación audible entre niveles viene del **timbre** (forma de onda) y la frecuencia, no de recortar el sonido.

### Investigación psicoacústica — diseño de niveles de volumen

#### Base teórica: percepción humana de diferencias de intensidad

El oído humano responde a la intensidad sonora de forma logarítmica. La unidad estándar es el **decibelio (dB)**, definido como:

```
dB = 20 · log₁₀(gain_linear)
```

| Diferencia | Percepción | Referencia |
|---|---|---|
| **1 dB** | JND (Just Noticeable Difference) — detectable solo en condiciones ideales de laboratorio (cámara anecoica) | Fletcher & Munson, 1933 |
| **3 dB** | Mínimo cambio claramente perceptible en entorno real de escucha | ISO 226:2003 |
| **5 dB** | Cambio obvio, fácil de distinguir sin entrenamiento | Práctica estándar de mezcla |
| **6 dB** | Duplicación de amplitud (2× voltaje). Relación física directa | — |
| **10 dB** | ~2× perceived loudness (sonoridad subjetiva). Ley de Stevens: ψ = k·φ^0.6 | Stevens, 1957 |
| **20 dB** | ~4× perceived loudness. Diferencia entre habla conversacional y grito | — |

#### Diagnóstico: problema con los niveles originales

| Set | Fuerte (vol/dB) | Medio (vol/dB) | Débil (vol/dB) | Dif F→M (dB) | Dif M→D (dB) | Débil audible? |
|---|---|---|---|---|---|---|
| Normal | 0.30 / -10.5 | 0.10 / -20.0 | **0.03 / -30.5** | 9.5 ✓ | 10.5 ✓ | ❌ −30.5 dB = ruido de fondo en parlantes consumer |
| 808 | 0.35 / -9.1 | 0.20 / -14.0 | **0.03 / -30.5** | 4.9 ✓ | 16.5 ✓ | ❌ idem |
| FL Studio | 0.28 / -11.1 | 0.07 / -23.1 | **0.02 / -34.0** | 12.0 ✓ | 10.9 ✓ | ❌ −34 dB = inaudible |
| Analógico | 0.22 / -13.2 | 0.07 / -23.1 | **0.02 / -34.0** | 9.9 ✓ | 9.9 ✓ | ❌ idem |

**Problema raíz**: el nivel débil con gain ≤ 0.03 está 20–24 dB por debajo del fuerte. En parlantes de laptop o audífonos básicos, ese rango cae por debajo del suelo de ruido y no se reproduce.

**Síntoma**: beats 2 y 4 en 4/4 desaparecen. El usuario escucha solo los beats fuertes (1 y 3), que tienen timbres distintos (square vs triangle), rompiendo la coherencia del patrón rítmico.

#### Solución propuesta: corrección psicoacústica

Criterios de diseño aplicados:

1. **Audibilidad total**: todo nivel ≥ **0.05** (≥ −26 dB) — umbral mínimo realista en equipo consumer
2. **Separación perceptible**: diferencia entre niveles **≥ 5 dB** (bien sobre el JND práctico de 3 dB)
3. **Contraste dramático**: fuerte→débil ~12–16 dB (~2–3× perceived loudness)
4. **Diferenciación cualitativa**: cada nivel usa forma de onda distinta (square → triangle → sine) además del cambio de volumen

| Set | Nivel | Forma | Frecuencia | Vol | dB (SPL rel) | Δ desde anterior |
|---|---|---|---|---|---|---|
| **Normal** (20ms) | Fuerte | Square | 2000Hz | **0.32** | −9.9 dB | — |
| | Medio | Triangle | 1200Hz | **0.13** | −17.7 dB | **7.8 dB** ✓ |
| | Débil | Sine | 600Hz | **0.06** | −24.4 dB | **6.7 dB** ✓ |
| **808** (35ms) | Fuerte | Cowbell square 900→800Hz + noise | | **0.32** | −9.9 dB | — |
| | Medio | Rimshot sine 1800Hz + noise | | **0.18** | −14.9 dB | **5.0 dB** ✓ |
| | Débil | Ghost sine | 200Hz | **0.06** | −24.4 dB | **9.5 dB** ✓ |
| **FL Studio** (18ms) | Fuerte | Sine | 2400Hz | **0.30** | −10.5 dB | — |
| | Medio | Triangle | 1000Hz | **0.11** | −19.2 dB | **8.7 dB** ✓ |
| | Débil | Sine | 500Hz | **0.02** | −26.0 dB | **6.8 dB** ✓ |
| **Analógico** (80ms) | Fuerte | Sine | 1000Hz | **0.25** | −12.0 dB | — |
| | Medio | Triangle | 700Hz | **0.09** | −20.9 dB | **8.9 dB** ✓ |
| | Débil | Sine | 300Hz | **0.05** | −26.0 dB | **5.1 dB** ✓ |

#### Control de volumen global (slider 0–100)

Además de los niveles fijos por acento, el metrónomo expone un **multiplicador de volumen global** con rango 0% (mudo) a 100% (máximo), con estado inicial 75%.

El multiplicador escala linealmente todos los niveles de acento simultáneamente:

```
vol_final = vol_base × (volumen_global / 100)
```

Esto preserva las relaciones dB entre niveles (fuerte:medio:débil = 1:0.4:0.19 aprox.) independientemente del ajuste global.

**Principio de diseño**: los 3 niveles de acento se diferencian cualitativamente (square → triangle → sine) para que el oído los distinga instantáneamente incluso a alta velocidad. La duración constante evita que los beats débiles se sientan "recortados". El slider global permite al usuario ajustar el volumen maestro sin alterar el contraste entre niveles.

#### Mapa de conversión rápida: gain ↔ dB

| gain | dB   | Percepción                     |
|------|------|--------------------------------|
| 0.50 | −6.0 | El doble de voltaje (−6 dB)   |
| 0.35 | −9.1 | Fuerte típico                  |
| 0.25 | −12.0 | Fuerte analógico               |
| 0.13 | −17.7 | Medio                          |
| 0.06 | −24.4 | Débil mínimo audible           |
| 0.03 | −30.5 | **Inaudible en consumer**      |
| 0.01 | −40.0 | Silencio práctico              |
| 0.00 | −∞    | Mudo                           |

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

