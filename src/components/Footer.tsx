export default function Footer() {
  return (
    <footer className="border-t border-[#2a2a4a] bg-[#0a0a0f] px-4 py-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-4 flex items-center justify-center gap-6 text-sm">
          <a
            href="/studio-suite/theory"
            className="text-[#8888aa] hover:text-[#00ffff] transition-colors font-heading tracking-wide"
          >
            ⟠ Theory
          </a>
          <span className="text-[#2a2a4a]">|</span>
          <a
            href="https://superdandi.github.io/oscilate"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8888aa] hover:text-[#ff00ff] transition-colors"
          >
            ⟐ Oscilate
          </a>
          <span className="text-[#2a2a4a]">|</span>
          <a
            href="https://superdandi.github.io/vizcoso"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8888aa] hover:text-[#ff00ff] transition-colors"
          >
            VIZCOSO
          </a>
        </div>
        <p className="text-xs text-[#555]">
          Studio Suite &copy; {new Date().getFullYear()} &mdash; Todos los sonidos son procedurales
        </p>
      </div>
    </footer>
  );
}
