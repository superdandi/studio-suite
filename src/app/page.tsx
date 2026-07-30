"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import DigitalRain from "@/components/DigitalRain";
import ProximityGlow from "@/components/ProximityGlow";
import SoundEffects from "@/components/SoundEffects";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Dashboard from "@/components/Dashboard";

const PulsePanel = dynamic(() => import("@/components/pulse/PulsePanel"), { ssr: false });
const TunePanel = dynamic(() => import("@/components/tune/TunePanel"), { ssr: false });
const ScanPanel = dynamic(() => import("@/components/scan/ScanPanel"), { ssr: false });
const KeysPanel = dynamic(() => import("@/components/keys/KeysPanel"), { ssr: false });
const EarPanel = dynamic(() => import("@/components/ear/EarPanel"), { ssr: false });

type ToolView = "dashboard" | "pulse" | "tune" | "scan" | "keys" | "ear";

export default function Home() {
  const [view, setView] = useState<ToolView>("dashboard");

  return (
    <>
      <DigitalRain />
      <ProximityGlow />
      <SoundEffects />
      <Navbar activeTool={view === "dashboard" ? "dashboard" : view} onNavigate={(t) => setView(t as ToolView)} />
      <main className="relative z-10 min-h-screen">
        {view === "dashboard" && <Dashboard onSelect={(t) => setView(t as ToolView)} />}
        {view === "pulse" && <PulsePanel />}
        {view === "tune" && <TunePanel />}
        {view === "scan" && <ScanPanel />}
        {view === "keys" && <KeysPanel />}
        {view === "ear" && <EarPanel />}
      </main>
      <Footer />
    </>
  );
}
