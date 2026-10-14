"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * A trailing targeting ring that follows a fine pointer and tightens onto
 * interactive elements. It is an accent on top of the native cursor, never a
 * replacement: the real pointer stays visible, so a failure here costs nothing.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || !ring.current || !dot.current) return;

    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3.out" });
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "none" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "none" });

    gsap.set([ring.current, dot.current], { opacity: 0 });

    const move = (e: PointerEvent) => {
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
      gsap.to([ring.current, dot.current], { opacity: 1, duration: 0.3, overwrite: "auto" });
    };
    const over = (e: PointerEvent) => {
      const hot = (e.target as Element | null)?.closest("a,button,[role=button]");
      gsap.to(ring.current, {
        scale: hot ? 0.62 : 1,
        borderColor: hot ? "rgba(212,255,58,1)" : "rgba(212,255,58,0.55)",
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
    };
    const leave = () => gsap.to([ring.current, dot.current], { opacity: 0, duration: 0.3 });

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[var(--z-cursor)] hidden [@media(pointer:fine)]:block">
      <div
        ref={ring}
        className="absolute -left-[22px] -top-[22px] h-11 w-11 rounded-full border border-[rgba(212,255,58,0.55)]"
      />
      <div ref={dot} className="absolute -left-[2px] -top-[2px] h-1 w-1 bg-signal" />
    </div>
  );
}
