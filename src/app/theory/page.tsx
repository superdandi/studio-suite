import DigitalRain from "@/components/DigitalRain";
import ProximityGlow from "@/components/ProximityGlow";
import Footer from "@/components/Footer";
import TheoryContent from "@/components/theory/Content";

export default function TheoryPage() {
  return (
    <>
      <DigitalRain />
      <ProximityGlow />
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2a4a] bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/studio-suite" className="text-lg font-bold tracking-wider text-[#ff00ff] glow-magenta font-heading">
            ⚡ Studio Suite
          </a>
        </div>
      </nav>
      <main className="relative z-10 min-h-screen pt-16">
        <TheoryContent />
      </main>
      <Footer />
    </>
  );
}
