const sections = [
  {
    id: "fisica",
    title: "1. Física del Sonido",
    content: `El sonido es una vibración mecánica que se propaga como onda longitudinal. Musicalmente, las cuatro propiedades perceptuales del sonido son:

• Altura (Pitch) — determinada por la frecuencia fundamental (Hz). A mayor frecuencia, sonido más agudo.
• Intensidad (Loudness) — determinada por la amplitud de la onda (dB).
• Timbre (Tone Color) — determinado por el espectro armónico y la envolvente.
• Duración — el tiempo que percibimos el sonido.

La relación entre frecuencia y altura es logarítmica: duplicar la frecuencia = subir una octava.

En el sistema de temperamento igual (12-TET), la fórmula para la frecuencia de una nota es:
    f(n) = 440 × 2^((n - 69) / 12)

Donde n es el número MIDI de la nota (A4 = 69 = 440 Hz).`,
    references: ["Helmholtz, H. von (1885). On the Sensations of Tone.", "Pierce, J. R. (1992). The Science of Musical Sound."],
  },
  {
    id: "intervalos",
    title: "2. Intervalos",
    content: `Un intervalo es la distancia entre dos notas. Se mide en semitonos y en cents (1 semitono = 100 cents).

Intervalos básicos:
• Unísono (P1): 0 semitonos — misma nota
• 2ª menor (m2): 1 semitono
• 2ª mayor (M2): 2 semitonos
• 3ª menor (m3): 3 semitonos
• 3ª mayor (M3): 4 semitonos
• 4ª justa (P4): 5 semitonos
• Tritono (TT): 6 semitonos — el intervalo más disonante
• 5ª justa (P5): 7 semitonos
• 6ª menor (m6): 8 semitonos
• 6ª mayor (M6): 9 semitonos
• 7ª menor (m7): 10 semitonos
• 7ª mayor (M7): 11 semitonos
• Octava (P8): 12 semitonos

La calidad de un intervalo depende de su consonancia o disonancia. Los intervalos consonantes (unísono, 3ª, 5ª, 6ª, octava) suenan estables. Los disonantes (2ª, 7ª, tritono) generan tensión.`,
    references: ["Piston, W. (1987). Harmony.", "Goldman, R. F. (1965). Harmony in Western Music."],
  },
  {
    id: "escalas",
    title: "3. Escalas y Modos",
    content: `Una escala es una secuencia ordenada de notas. La escala mayor sigue el patrón:

    Tono - Tono - Semitono - Tono - Tono - Tono - Semitono

Escala de C Mayor: C D E F G A B C

Escala menor natural (Eólica):
    Tono - Semitono - Tono - Tono - Semitono - Tono - Tono

Los 7 modos griegos:
• Jónico (I): escala mayor — 1 2 3 4 5 6 7
• Dórico (II): 1 2 ♭3 4 5 6 ♭7
• Frigio (III): 1 ♭2 ♭3 4 5 ♭6 ♭7
• Lidio (IV): 1 2 3 ♯4 5 6 7
• Mixolidio (V): 1 2 3 4 5 6 ♭7
• Eólico (VI): menor natural — 1 2 ♭3 4 5 ♭6 ♭7
• Locrio (VII): 1 ♭2 ♭3 4 ♭5 ♭6 ♭7

Escalas pentatónicas: 5 notas, omitiendo los semitonos.
• Mayor: 1 2 3 5 6
• Menor: 1 ♭3 4 5 ♭7`,
    references: ["Benward, B. & Saker, M. (2008). Music in Theory and Practice.", "Lerdahl, F. (2005). Tonal Pitch Space."],
  },
  {
    id: "acordes",
    title: "4. Acordes",
    content: `Un acorde es la combinación simultánea de tres o más notas.

Tríadas básicas:
• Mayor: 1 - 3 - 5 (ej: C E G)
• Menor: 1 - ♭3 - 5 (ej: C E♭ G)
• Aumentado: 1 - 3 - ♯5 (ej: C E G♯)
• Disminuido: 1 - ♭3 - ♭5 (ej: C E♭ G♭)

Acordes de séptima (4 notas):
• Maj7: 1 - 3 - 5 - 7 (C E G B)
• Dom7: 1 - 3 - 5 - ♭7 (C E G B♭)
• m7: 1 - ♭3 - 5 - ♭7 (C E♭ G B♭)
• m7♭5 (half-dim): 1 - ♭3 - ♭5 - ♭7
• dim7: 1 - ♭3 - ♭5 - ♭♭7

Los acordes se construyen por superposición de terceras.`,
    references: ["Schoenberg, A. (1978). Theory of Harmony.", "Piston, W. (1987). Harmony."],
  },
  {
    id: "armonia",
    title: "5. Armonía Funcional",
    content: `La armonía funcional describe cómo los acordes se relacionan con la tónica (centro tonal).

Funciones tonales (Riemann):
• Tónica (T): I, iii, vi — estabilidad, reposo
• Subdominante (S): IV, ii — movimiento preparatorio
• Dominante (D): V, vii° — tensión, resuelve a tónica

Campo armónico de C Mayor:
    I    ii   iii  IV   V    vi   vii°
    C    Dm   Em   F    G    Am   Bdim
    CM7  Dm7  Em7  FM7  G7   Am7  Bm7♭5

Progresión fundamental: II - V - I (ej: Dm7 - G7 - CM7)
Cadencia auténtica: V → I (la más resolutiva)
Cadencia plagal: IV → I (amen)

El círculo de quintas organiza las tonalidades por quintas justas, mostrando las relaciones entre ellas.`,
    references: ["Goldman, R. F. (1965). Harmony in Western Music.", "Taruskin, R. (2010). The Oxford History of Western Music."],
  },
  {
    id: "tonalidad",
    title: "6. Detección de Tonalidad",
    content: `El algoritmo de Krumhansl-Schmuckler (1990) detecta la tonalidad de un fragmento musical:

1. Se construye un histograma de las clases de nota que aparecen.
2. Se correlaciona con perfiles tonales predefinidos para cada tonalidad mayor y menor.
3. La tonalidad con mayor correlación es la detectada.

Perfil de tonalidad mayor (valores de Krumhansl):
    C: 6.35, C#: 2.23, D: 3.48, D#: 2.33, E: 4.38,
    F: 4.09, F#: 2.52, G: 5.19, G#: 2.39, A: 3.66, A#: 2.29, B: 2.88

Este método se usa en la herramienta Scan para identificar la tonalidad de la música que estás reproduciendo.`,
    references: ["Krumhansl, C. L. (1990). Cognitive Foundations of Musical Pitch."],
  },
  {
    id: "temperamento",
    title: "7. Temperamento Igual",
    content: `El temperamento igual (12-TET) divide la octava en 12 semitonos iguales. Cada semitono tiene una relación de frecuencia de 2^(1/12) ≈ 1.05946.

Fue calculado matemáticamente por primera vez por el príncipe chino Zhu Zaiyu en 1584, y de forma independiente por Simon Stevin en Europa alrededor de 1585.

Comparación con intervalos justos:
• 5ª justa 12-TET: 2^(7/12) ≈ 1.4983 (vs 1.5 justo = -2 cents)
• 3ª mayor 12-TET: 2^(4/12) = 1.2599 (vs 1.25 justo = +14 cents)

La unidad cent (1/100 de semitono) permite medir diferencias de afinación. Una nota afinada está dentro de ±5 cents.`,
    references: ["Barbour, J. M. (2004). Tuning and Temperament.", "Partch, H. (1979). Genesis of a Music."],
  },
  {
    id: "analisis",
    title: "8. Análisis con las Herramientas",
    content: `Cada herramienta de Studio Suite aplica principios de teoría musical y física del sonido:

• Pulse: usa el tempo (BPM) para generar pulsos rítmicos precisos. Las figuras rítmicas subdividen el beat en 2, 3 o 4 partes.

• Tune: implementa el algoritmo YIN de detección de pitch, que usa autocorrelación modificada para encontrar la frecuencia fundamental. Mide la desviación en cents respecto al temperamento igual.

• Scan: analiza el espectro de frecuencia vía FFT (AnalyserNode de Web Audio API). Detecta picos espectrales, los mapea a notas, identifica acordes por comparación con diccionario y determina la tonalidad con el método de Krumhansl-Schmuckler.

• Keys: muestra visualmente la construcción de escalas en el teclado. Cada escala tiene un patrón de intervalos característico.

• Ear: entrena el reconocimiento de intervalos. La práctica auditiva es fundamental para desarrollar el oído musical.

Todas las herramientas generan sonido proceduralmente con Web Audio API — sin archivos de audio externos.`,
    references: ["de Cheveigné, A. & Kawahara, H. (2002). YIN estimator.", "Smus, B. (2013). Web Audio API."],
  },
];

export default function TheoryContent() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-2">
          <span
            data-text="Teoría Musical"
            className="glitch-text neon-title flicker-erratic glow-magenta text-4xl font-bold font-heading"
          >
            ⟠ Teoría Musical
          </span>
        </h1>
        <p className="text-[#8888aa]">
          Fundamentos teóricos y físicos de las herramientas de Studio Suite
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <details
            key={section.id}
            className="card-glass card-glow group rounded-lg border border-[#2a2a4a] bg-black/30 backdrop-blur-sm overflow-hidden"
          >
            <summary className="cursor-pointer px-6 py-4 font-heading text-lg font-bold text-[#00ffff] hover:text-[#ff00ff] transition-colors list-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between">
                {section.title}
                <span className="text-[#555] group-open:rotate-180 transition-transform">▼</span>
              </span>
            </summary>
            <div className="px-6 pb-6">
              <div className="whitespace-pre-line text-sm text-[#ccc] leading-relaxed">
                {section.content}
              </div>
              {section.references.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#2a2a4a]">
                  <p className="text-xs text-[#8888aa] mb-1">Referencias:</p>
                  <ul className="list-disc list-inside text-xs text-[#666]">
                    {section.references.map((ref, i) => (
                      <li key={i}>{ref}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
