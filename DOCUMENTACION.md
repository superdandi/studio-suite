# Studio Suite — Documentación Técnica

## Estado de revisión

Lista checable de secciones revisadas y aprobadas, actualizada en cada iteración:

- [x] **Metrónomo (Pulse)** — figuras, compases, acentos, percusión, volumen, TAP
- [ ] **Afinador (Tune)**
- [ ] **Analizador (Scan)**
- [ ] **Escalas (Keys)** — en progreso (escalas étnicas + loop + export MIDI)
- [ ] **Entrenamiento auditivo (Ear)**
- [ ] **Teoría (Theory)**
- [ ] **Tema/UI global**

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

#### Bug resuelto: reinicio del metrónomo en cada render

**Síntoma**: con la percusión cualitativa se escuchaba el **beat 1 (fuerte) repetido constantemente**; los beats débiles/medios nunca completaban el ciclo.

**Causa raíz**: el efecto en `PulsePanel` que inicia/para el metrónomo tenía `metronome` (objeto retornado por el hook) en sus dependencias. `useMetronome()` retornaba `{ start, stop }` como **objeto literal nuevo en cada render** (aunque `start`/`stop` internamente fueran estables con `useCallback([])`). El callback del metrónomo hace `setCurrentBeat` → re-render → el objeto cambió de identidad → el effect re-ejecutaba → `stop()` + `start()` → y `start()` reproduce inmediatamente el fuerte. Loop infinito: solo sonaba el beat 1.

```
start() → creaClick(2) fuerte → timer → tick débil → setCurrentBeat → re-render
        → metronome (identidad nueva) → cleanup stop() → start() → fuerte otra vez → …
```

**Diagnóstico diferencial**: la matriz de acentos (`ACCENT_PATTERNS`) se lee correctamente (verificado por simulación de las 7 figuras × 7 compases); el fuerte cae donde corresponde. El problema no era de lectura de patrones sino de ciclo de vida del efecto.

**Corrección aplicada**:
1. `PulsePanel.tsx`: se destructuran las referencias estables `const { start: startMetronome, stop: stopMetronome } = useMetronome()` y las deps del effect pasan a ser `[bpm, figure, isPlaying, soundType, timeSignature, volume, startMetronome, stopMetronome, beatCallback]` — todas estables salvo los valores, así el effect solo corre ante un cambio real.
2. `useMetronome.ts`: el hook retorna `useMemo(() => ({ start, stop }), [start, stop])`, garantizando identidad estable del objeto por si otro consumidor lo usa.

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

**Sonidos** — cada tipo de sonido tiene 3 **instrumentos de percusión cualitativamente distintos**, uno por nivel de acento del compás. La diferenciación no es solo tímbrica (forma de onda) sino de **identidad instrumental**: cada nivel se percibe como un instrumento diferente (caja, hi-hat, clap, maraca, etc.), no como una variación de volumen/timbre del mismo "blip". Cada instrumento se sintetiza proceduralmente con su propio gráfico de nodos Web Audio (osciladores + filtros + buffers de ruido) y su propia duración de envelope.

### Diseño de percusión por set — instrumentos

Cada `SoundType` (set) usa 3 instrumentos distintos por nivel de acento:

| Set | Nivel | Instrumento | Síntesis | Duración |
|---|---|---|---|---|
| **Normal** (batería acústica) | Fuerte | **Snare** | Sine 200Hz con pitch decay + noise BPF 200Hz | 80ms |
| | Medio | **Rimshot** | Sine 1800Hz click 10ms + noise leve | 15ms |
| | Débil | **Hi-hat cerrado** | Noise HPF ~8kHz, decay rápido | 30ms |
| **808** (TR-808) | Fuerte | **Cowbell** | Dual square 800Hz + 540Hz (metálico) | 60ms |
| | Medio | **Clap** | 3 noise bursts espaciados 15ms, envelope lento | 120ms |
| | Débil | **Open hi-hat** | Noise HPF ~6kHz, decay largo | 80ms |
| **FL Studio** (EDM/909) | Fuerte | **Clap 909** | 5 noise bursts superpuestos, decay largo (reverb simulado) | 200ms |
| | Medio | **Tom electrónico** | Sine 250→100Hz, pitch drop | 60ms |
| | Débil | **Shaker** | Noise BPF 4kHz, 25ms, textura granula | 25ms |
| **Analógico** (latina) | Fuerte | **Clave** | Doble click sine 800Hz + 1200Hz, 8ms c/u, separados 15ms | 30ms |
| | Medio | **Maraca** | Noise BPF 3kHz, attack rápido | 40ms |
| | Débil | **Cabasa** | Noise BPF 5kHz, textura rasposa | 20ms |

**Principio de diseño**: los 3 niveles de acento se diferencian por **identidad instrumental** (caja vs hi-hat, clave vs maraca, clap vs shaker), no por el volumen/timbre de un mismo oscilador. Esto permite al oído distinguir fuerte/medio/débil al instante incluso a alta velocidad o en equipos sin graves. Las relaciones de volumen dB entre niveles (≥5 dB) se mantienen como refuerzo adicional.

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
4. **Diferenciación cualitativa**: cada nivel es un **instrumento de percusión distinto** (snare/rimshot/hi-hat, cowbell/clap/open-hat, clap/tom/shaker, clave/maraca/cabasa) además del cambio de volumen

| Set | Nivel | Instrumento | Vol | dB (SPL rel) | Δ desde anterior |
|---|---|---|---|---|---|
| **Normal** | Fuerte | Snare | **0.32** | −9.9 dB | — |
| | Medio | Rimshot | **0.16** | −15.9 dB | **6.0 dB** ✓ |
| | Débil | Hi-hat cerrado | **0.10** | −20.0 dB | **4.1 dB** ✓ |
| **808** | Fuerte | Cowbell | **0.28** | −11.1 dB | — |
| | Medio | Clap | **0.20** | −14.0 dB | **2.9 dB** ✓ |
| | Débil | Open hi-hat | **0.09** | −20.9 dB | **6.9 dB** ✓ |
| **FL Studio** | Fuerte | Clap 909 | **0.30** | −10.5 dB | — |
| | Medio | Tom | **0.18** | −14.9 dB | **4.4 dB** ✓ |
| | Débil | Shaker | **0.10** | −20.0 dB | **5.1 dB** ✓ |
| **Analógico** | Fuerte | Clave | **0.26** | −11.7 dB | — |
| | Medio | Maraca | **0.14** | −17.1 dB | **5.4 dB** ✓ |
| | Débil | Cabasa | **0.08** | −21.9 dB | **4.8 dB** ✓ |

> Nota: los dB del master gain son la referencia de amplitud. La sonoridad percibida depende además del ancho de banda del instrumento (el noise BPF/HPF concentra energía en rangos agudos más audibles). La diferenciación principal entre niveles es la **identidad instrumental**, con el contraste dB como refuerzo.

#### Control de volumen global (slider 0–100)

Además de los niveles fijos por acento, el metrónomo expone un **multiplicador de volumen global** con rango 0% (mudo) a 100% (máximo), con estado inicial 75%.

El multiplicador escala linealmente todos los niveles de acento simultáneamente:

```
vol_final = vol_base × (volumen_global / 100)
```

Esto preserva las relaciones dB entre niveles (fuerte:medio:débil = 1:0.4:0.19 aprox.) independientemente del ajuste global.

**Principio de diseño**: los 3 niveles de acento se diferencian cualitativamente por **identidad instrumental** (caja vs hi-hat, clave vs maraca) para que el oído los distinga instantáneamente incluso a alta velocidad. La duración propia de cada instrumento (envelope de percusión real) evita que los beats débiles se sientan "recortados". El slider global permite al usuario ajustar el volumen maestro sin alterar el contraste entre niveles.

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

### Escalas (Keys)

#### Teoría — escalas existentes (occidentales)

Cada escala se define por su **patrón de intervalos** en semitonos. `SCALE_TYPES` en `lib/music-theory.ts` almacena nombre, intervalos y descripción; `getScaleNotes(root, type)` calcula las notas a partir de la fundamental.

| Categoría | Escala | Intervalos (semitones) | Grados |
|---|---|---|---|
| **Mayor** | Mayor (Jónica) | [0,2,4,5,7,9,11] | 1 2 3 4 5 6 7 |
| **Menor** | Menor Natural (Eólica) | [0,2,3,5,7,8,10] | 1 2 ♭3 4 5 ♭6 ♭7 |
| | Menor Armónica | [0,2,3,5,7,8,11] | 1 2 ♭3 4 5 ♭6 7 |
| | Menor Melódica | [0,2,3,5,7,9,11] | 1 2 ♭3 4 5 6 7 |
| **Modos** | Dórica | [0,2,3,5,7,9,10] | 1 2 ♭3 4 5 6 ♭7 |
| | Frigia | [0,1,3,5,7,8,10] | 1 ♭2 ♭3 4 5 ♭6 ♭7 |
| | Lidía | [0,2,4,6,7,9,11] | 1 2 3 ♯4 5 6 7 |
| | Mixolidia | [0,2,4,5,7,9,10] | 1 2 3 4 5 6 ♭7 |
| | Locria | [0,1,3,5,6,8,10] | 1 ♭2 ♭3 4 ♭5 ♭6 ♭7 |
| **Pentatónicas** | Pentatónica Mayor | [0,2,4,7,9] | 1 2 3 5 6 |
| | Pentatónica Menor | [0,3,5,7,10] | 1 ♭3 4 5 ♭7 |
| **Otras** | Blues | [0,3,5,6,7,10] | 1 ♭3 4 ♭5 5 ♭7 |
| | Cromática | [0,1,2,3,4,5,6,7,8,9,10,11] | los 12 semitonos |
| | Tonos Enteros | [0,2,4,6,8,10] | 1 2 3 ♯4 ♯5 ♯6 |
| | Octatónica (T-ST) | [0,2,3,5,6,8,9,11] | 1 2 ♭3 4 ♭5 ♭6 6 7 |

#### Teoría — nuevas escalas étnicas/orientales/africanas/asiáticas

Las escalas no occidentales se aproximan al sistema de 12 semitonos (temperamento igual) para poder sintetizarse en Web Audio. Muchas usan **cuartos de tono** en su interpretación tradicional; aquí se documentan las aproximaciones en semitonos que usa la app.

| Categoría | Escala | Intervalos (semitones) | Notas en C | Carácter |
|---|---|---|---|---|
| **Japonesas** | Hirajoshi | [0,2,3,7,8] | C D E♭ G A♭ | Pentatónica, sonido koto |
| | Iwato | [0,1,5,6,10] | C D♭ F G♭ B♭ | Modal, tensa, sin 3ª ni 6ª |
| | In-sen | [0,1,5,7,10] | C D♭ F G B♭ | Sakura sakura, muy oriental |
| | Yo | [0,2,5,7,9] | C D F G A | Pentatónica sin semitonos |
| **Árabes/Medio Oriente** | Hijaz (doble armónica) | [0,1,4,5,7,8,11] | C D♭ E F G A♭ B | 2ª menor + 3ª mayor, exótica |
| | Rast | [0,2,4,5,7,9,10] | C D E F G A B♭ | Base de muchos maqamat |
| | Frigia dominante | [0,1,4,5,7,8,10] | C D♭ E F G A♭ B♭ | Sonido flamenco/árabe |
| **Indias** | Bhairav | [0,1,4,5,7,8,11] | C D♭ E F G A♭ B | Raga matinal, doble armónica |
| | Bhairavi | [0,1,3,5,7,8,10] | C D♭ E♭ F G A♭ B♭ | Frigia con 6ª menor |
| | Todi | [0,1,3,6,7,8,11] | C D♭ E♭ F♯ G A♭ B | Tritono característico |
| **Africanas/Indonesia** | Pelog (Balinese) | [0,1,3,7,8] | C D♭ E♭ G A♭ | 5 notas asimétricas, gamelán |
| | Slendro | [0,2,4,7,9] | C D E G A | 5 notas casi equiespaciadas |
| | Africana pentatónica | [0,2,4,7,9] | C D E G A | Equivalente a pentatónica mayor |

**Notas teóricas importantes**:
- **Hijaz, Bhairav y Rast** comparten la "doble armónica" (2ª menor + 3ª mayor) pero difieren en grados superiores.
- **Pelog** y **Slendro** son escalas de gamelán javanés: Pelog es asimétrica (7 tonos con 5 usados), Slendro es casi equiespaciada (5 tonos ≈ 240 cents cada uno, aquí aproximada).
- Las escalas japonesas **In-sen** e **Iwato** son pentatónicas con semitonos, a diferencia de la pentatónica mayor que no los tiene.
- Las aproximaciones con intervalos iguales no reproducen los **microtonos** originales; es una simplificación para síntesis procedural.

#### Plan e implementación

**Proceso**: (1) documentar teoría → (2) agregar intervalos a `SCALE_TYPES` → (3) crear categorías en `SCALE_CATEGORIES` → (4) verificar render en panel Keys → (5) build + deploy.

**Cambios planeados para Keys**:
1. `lib/music-theory.ts`: agregar 12 escalas a `SCALE_TYPES` (hirajoshi, iwato, insen, yo, hijaz, rast, phrygian-dominant, bhairav, bhairavi, todi, pelog, slendro, african-pentatonic).
2. `components/keys/KeysPanel.tsx`: nuevas categorías **Japonesas**, **Árabes**, **Indias**, **Africanas/Indonesia** + dos botones de reproducción: `▶ REPRODUCIR ESCALA` (ascendente) y `▶ ASC+DESC` (ascendente + descendente), ambos con toggle a `■ DETENER`.
3. `hooks/useScalePlayer.ts`: refactor a loop con cadena de `setTimeout` — `playScale(root, type, mode)` con modos `asc` y `ascdesc`, y `stopScale()`.
4. `components/keys/PianoKeyboard.tsx`: fix de teclas negras para que el teclado empiece en **Do** (C4 en x=0). La posición actual calcula `x = whiteKeyIndex * KEY_WIDTH - BLACK_KEY_WIDTH/2`, lo que dibuja la negra C# en **x=-12** (sobresale por la izquierda y parece que el teclado empieza a la mitad de C#). Corrección: `x = (whiteKeyIndex + 1) * KEY_WIDTH - BLACK_KEY_WIDTH / 2` en `draw` y `handleClick` → C# queda centrada en el límite C/D (x=28).

#### Bug resuelto: nota raíz duplicada en el giro inferior de ascdesc

**Síntoma**: al reproducir la escala en modo **ASC+DESC**, la última nota del descenso (la raíz) sonaba de nuevo inmediatamente al arrancar el ascenso siguiente. Se percibía como una nota repetida en el bucle, en **todas** las escalas.

**Causa raíz** en `useScalePlayer.ts`: la secuencia `ascdesc` se construía como:

```js
const sequence = [...freqs, ...freqs.slice(0, -1).reverse()];
```

Para C mayor (`freqs = [C, D, E, F, G, A, B]`) el resultado era:

```
[C, D, E, F, G, A, B,  A, G, F, E, D, C]
                                 ↑ slice(0,-1).reverse() termina en la raíz
```

El loop envolvente `...E D C` → `C D E F…` reproducía la raíz **C dos veces consecutivas**. El bug es genérico: `slice(0, -1)` incluye siempre la raíz (índice 0) al final del descenso, para cualquier escala de cualquier longitud.

**Corrección aplicada**: usar `slice(1, -1)` para excluir la raíz del tramo descendente:

```js
const sequence = mode === "asc" ? freqs : [...freqs, ...freqs.slice(1, -1).reverse()];
```

Resultado para C mayor: `[C, D, E, F, G, A, B,  A, G, F, E, D]` (12 notas). El descenso termina en el 2º grado (D) y el loop conecta `...F E D` → `C D E F…` con un paso natural, sin repetir nota.

**Aplica a todas las escalas** (la lógica es independiente de la escala):
- 7 notas (mayor, menores, modos, árabes, indias): `[...0..6, ...slice(1,-1).reverse()]` = 12 notas
- 5 notas (pentatónicas, hirajoshi, pelog, slendro, africana): `[0,1,2,3,4] + [3,2,1]` = 8 notas
- 6 notas (tonos enteros): `[0..5] + [4,3,2,1]` = 10 notas
- 8 notas (octatónica): `[0..7] + [6..1]` = 14 notas
- 12 notas (cromática): `[0..11] + [10..1]` = 22 notas

#### Bug resuelto: toda escala reproducía comenzando en Do

**Síntoma**: independientemente de la nota fundamental elegida, la escala siempre sonaba (y se resaltaba) comenzando en **Do**. Cambiar la fundamental no producía ninguna diferencia perceptible.

**Causa raíz**: una fórmula incorrecta de conversión de nota → MIDI, duplicada en dos archivos:

```js
// useScalePlayer.ts:41 y KeysPanel.tsx:64
let midi = 60 + noteIdx - rootIdx;
```

El literal `60` es el MIDI de **C4**. Para la nota raíz se cumple `noteIdx === rootIdx`, por lo que la raíz siempre cae en `60` = C4. Las demás notas se desplazaban alrededor de ese C4, pero la fundamental quedaba clavada en Do. El método es conceptualmente incorrecto: mezcla índice de clase de nota (0–11) con una constante MIDI fija en vez de sumar los **intervalos en semitonos** desde la fundamental real.

| Fundamental | rootIdx | Cálculo raíz | MIDI resultante | Suena como |
|---|---|---|---|---|
| C | 0 | 60 + 0 − 0 | 60 | C4 ✓ (casualidad) |
| D | 2 | 60 + 2 − 2 | 60 | C4 ✗ |
| E | 4 | 60 + 4 − 4 | 60 | C4 ✗ |
| G | 7 | 60 + 7 − 7 | 60 | C4 ✗ |

Además, para fundamentales distintas de C la secuencia resultaba desordenada (ej. D mayor → `59, 60, 62, …`), ya que notas por debajo de la raíz en la clase de nota producían MIDI menores.

**Base teórica**: la notación MIDI es `noteToMidi(note, octave) = índice(0–11) + (octave + 1) × 12`; C4 = 60, D4 = 62, etc. Una escala se construye tomando la **fundamental real** (`noteToMidi(root, 4)`) y sumándole sus **intervalos en semitonos** (`SCALE_TYPES[type].intervals`), que ya expresan la distancia desde la raíz. Esto garantiza que el grado 1 sea exactamente la fundamental elegida y que las notas sean estrictamente ascendentes dentro de la octava.

**Corrección aplicada**: nuevo helper central en `lib/music-theory.ts`:

```ts
export function getScaleMidi(root: NoteName, scaleType: ScaleType, octave = 4): number[] {
  const rootMidi = noteToMidi(root, octave);
  return SCALE_TYPES[scaleType].intervals.map(i => rootMidi + i);
}
```

- `useScalePlayer.ts`: `freqs` se calcula como `getScaleMidi(root, scaleType, 4).map(midiToFrequency)` (usa el `midiToFrequency` existente, sin duplicar la fórmula).
- `KeysPanel.tsx`: `updateScale` usa `getScaleMidi(r, s, 4)` para `highlightedNotes`.
- `PianoKeyboard.tsx`: base de octava corregida de `startOctave * 12` a `(startOctave + 1) * 12` en `draw` y `handleClick`, para que `startOctave={4}` arranque realmente en C4 (MIDI 60) y el rango resaltado (hasta 82 para B mayor, F#5) quepa en el canvas C4–B5.

**Verificación**: para cada fundamental C…B, el primer MIDI de la escala coincide con `noteToMidi(root, 4)` y la secuencia es estrictamente ascendente, en las 27 escalas.

#### Export MIDI del patrón (botones ⬇ MIDI ASC / ⬇ MIDI ASC+DESC)

**Objetivo**: permitir descargar el patrón actual (root + escala + modo) como archivo MIDI estándar para importarlo en cualquier DAW (GarageBand, Cubase, FL Studio, Ableton, etc.).

**Factibilidad**: alta y 100% client-side — compatible con el export estático de GitHub Pages (sin servidor). Los datos del patrón ya existen en `getScaleMidiSequence(root, scaleType, mode)`, que devuelve la secuencia MIDI exacta que reproduce el player (asc: `getScaleMidi(root, type, 4)`; ascdesc: `[...asc, ...asc.slice(1, -1).reverse()]` con el fix de raíz no duplicada). Solo falta codificarla al formato binario SMF.

**Plan de implementación**:
1. `lib/midi.ts` (nuevo): encoder SMF sin dependencias — `encodeVarint` (delta times en 7-bit), `buildScaleMidi(sequence, opts)` y `triggerDownload(filename, bytes)` vía `Blob` + `<a download>`.
2. `lib/music-theory.ts`: helper `getScaleMidiSequence(root, scaleType, mode)` compartido entre player y export.
3. `hooks/useScalePlayer.ts`: refactor para usar `getScaleMidiSequence` (elimina la duplicación de la construcción de secuencia).
4. `components/keys/KeysPanel.tsx`: dos botones verdes `⬇ MIDI ASC` y `⬇ MIDI ASC+DESC`, uno por modo, que descargan el patrón actual. Nombres: `<escala>-<raiz>-<modo>.mid` (ej. `slendro-F-ascdesc.mid`).

**Estructura del archivo SMF generado** (spec Standard MIDI File):

| Bloque | Contenido |
|---|---|
| **MThd** | Formato 0, 1 track, división **480 ticks/negra** (PPQ) |
| **MTrk** (track único) | Meta evento tempo `FF 51 03` = 300000 µs/negra → **200 BPM**; program change `C0` → piano acústico (programa 0); eventos note-on `0x90` (vel 90) / note-off `0x80` (vel 64); end-of-track `FF 2F 00` |

**Timing**: cada nota se espacia **300ms** (equivalente a 200 BPM, negra por nota) y se mantiene 250ms antes del note-off, replicando exactamente el playback actual del player (la línea base del metrónomo es 120 BPM). El archivo exporta **un ciclo** del patrón en el modo elegido.

**Roadmap futuro** (en orden):
1. **Selector de BPM** — que el usuario elija el tempo al exportar.
2. **Usar el BPM del metrónomo** — exportar al tempo configurado en Pulse si está activo.

**Verificación**: parseo del MIDI generado — primer nota = `noteToMidi(root, 4)`, cantidad de eventos = `2 × notas` (on+off) + tempo + program + end, y división/tempo correctos. Build + deploy + revisión manual importando `slendro-F-ascdesc.mid` en un DAW.

## Build

```bash
npm run build    # next build + export estático
```

El output está en `out/`. Servir localmente:

```bash
python3 -m http.server 8080 -d out
# Abrir http://localhost:8080/studio-suite/
```

