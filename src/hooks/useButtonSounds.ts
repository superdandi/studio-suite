import { useEffect, useRef } from "react";
import { playHoverEnter, playHoverLeave, playClick } from "@/lib/sounds";

export default function useButtonSounds(selector: string) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const handlerEnter = () => playHoverEnter();
    const handlerLeave = () => playHoverLeave();
    const handlerClick = () => playClick();

    const elements = document.querySelectorAll<HTMLElement>(selector);
    elements.forEach((el) => {
      el.addEventListener("mouseenter", handlerEnter);
      el.addEventListener("mouseleave", handlerLeave);
      el.addEventListener("click", handlerClick);
    });

    const observer = new MutationObserver(() => {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        el.removeEventListener("mouseenter", handlerEnter);
        el.removeEventListener("mouseleave", handlerLeave);
        el.removeEventListener("click", handlerClick);
        el.addEventListener("mouseenter", handlerEnter);
        el.addEventListener("mouseleave", handlerLeave);
        el.addEventListener("click", handlerClick);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        el.removeEventListener("mouseenter", handlerEnter);
        el.removeEventListener("mouseleave", handlerLeave);
        el.removeEventListener("click", handlerClick);
      });
    };
  }, [selector]);
}
