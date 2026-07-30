"use client";

export default function Navbar({ activeTool, onNavigate }: {
  activeTool: string;
  onNavigate: (tool: string) => void;
}) {
  const tools = ["Pulse", "Tune", "Scan", "Keys", "Ear"];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2a4a] bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button
          onClick={() => onNavigate("dashboard")}
          className="text-lg font-bold tracking-wider text-[#ff00ff] glow-magenta font-heading"
        >
          ⚡ Studio Suite
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {tools.map((tool) => (
            <button
              key={tool}
              data-text={tool}
              onClick={() => onNavigate(tool.toLowerCase())}
              className={`nav-link px-3 py-1 text-sm font-medium tracking-wide transition-colors ${
                activeTool === tool.toLowerCase()
                  ? "text-[#ffaa00]"
                  : "text-[#8888aa] hover:text-white"
              }`}
            >
              {tool}
            </button>
          ))}
        </div>

        <div className="sm:hidden">
          <select
            value={activeTool}
            onChange={(e) => onNavigate(e.target.value)}
            className="bg-[#1a1a2e] border border-[#2a2a4a] text-white text-sm rounded px-2 py-1"
          >
            <option value="dashboard">Dashboard</option>
            {tools.map((t) => (
              <option key={t} value={t.toLowerCase()}>{t}</option>
            ))}
            <option value="theory">Theory</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
