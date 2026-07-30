import type { Metadata } from "next";
import "./globals.css";
import { Exo_2, Rajdhani, VT323 } from "next/font/google";
import { cn } from "@/lib/utils";

const exo2 = Exo_2({ subsets: ["latin"], variable: "--font-sans" });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-heading" });
const vt323 = VT323({ subsets: ["latin"], weight: "400", variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Studio Suite — Herramientas Musicales",
  description: "Navaja suiza para estudio musical: metrónomo, afinador, analizador, escalas y entrenamiento auditivo",
  icons: { icon: "/studio-suite/favicon.png" },
  other: { "theme-color": "#0a0a0f" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={cn("scroll-smooth", "font-sans", exo2.variable, rajdhani.variable, vt323.variable, "dark")}>
      <body className="scanline-overlay antialiased">
        {children}
      </body>
    </html>
  );
}
