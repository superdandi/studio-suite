"use client";

import { useEffect, useRef } from "react";
import { playHoverEnter, playHoverLeave, playClick } from "@/lib/sounds";

export default function SoundEffects() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const selector = ".card-glass-action, .card-glass-pulse, footer a, nav button, button";
    const elements = document.querySelectorAll<HTMLElement>(selector);

    const onEnter = () => playHoverEnter();
    const onLeave = () => playHoverLeave();
    const onClick = () => playClick();

    elements.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("click", onClick);
    });

    return () => {
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.removeEventListener("click", onClick);
      });
    };
  }, []);

  return null;
}
