"use client";

import { Play, Ear, Music, Waves, Piano } from "lucide-react";

const tools = [
  {
    id: "pulse",
    name: "Pulse",
    description: "Metrónomo con figuras rítmicas",
    icon: Play,
    color: "text-[#ff00ff]",
  },
  {
    id: "tune",
    name: "Tune",
    description: "Afinador cromático para guitarra y bajo",
    icon: Music,
    color: "text-[#00ffff]",
  },
  {
    id: "scan",
    name: "Scan",
    description: "Analizador espectral con teoría musical",
    icon: Waves,
    color: "text-[#00dd88]",
  },
  {
    id: "keys",
    name: "Keys",
    description: "Explorador de escalas en piano interactivo",
    icon: Piano,
    color: "text-[#ffaa00]",
  },
  {
    id: "ear",
    name: "Ear",
    description: "Entrenamiento auditivo con círculo de intervalos",
    icon: Ear,
    color: "text-[#ff00ff]",
  },
];

export default function Dashboard({ onSelect }: { onSelect: (tool: string) => void }) {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-24 pb-16">
      <div className="mb-12 text-center">
        <h1 className="mb-2">
          <span
            data-text="Studio Suite"
            className="glitch-text neon-title flicker-erratic glow-magenta text-5xl sm:text-6xl font-bold font-heading"
          >
            Studio Suite
          </span>
        </h1>
        <p className="text-lg text-[#8888aa] font-sans">
          Navaja suiza para estudio musical
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onSelect(tool.id)}
              className="card-glass card-glow card-glass-pulse card-cyber-hover group rounded-lg border border-[#2a2a4a] bg-black/30 backdrop-blur-sm p-6 text-left transition-all duration-300 hover:border-[#ff00ff]"
            >
              <Icon className={`mb-3 h-8 w-8 ${tool.color}`} />
              <h3 className={`mb-1 text-xl font-bold font-heading ${tool.color}`}>
                {tool.name}
              </h3>
              <p className="text-sm text-[#8888aa]">{tool.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
