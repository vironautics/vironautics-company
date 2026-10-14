"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, reducedMotion } from "@/lib/gsap";
import { STAGES, world } from "@/lib/world";

/**
 * Smooth scroll + the bridge from DOM scroll position to the WebGL world.
 *
 * Renders nothing. Lenis owns the scroll position, GSAP's ticker drives Lenis,
 * and every frame we turn "how far down the page are we" into a continuous
 * stage index the 3D scene can interpolate camera keyframes against.
 */
export default function ScrollEngine() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = reducedMotion();
    world.reduced = reduced;

    if (reduced) {
      world.intro = 1;
      world.scrollTo = (target) => {
        if (typeof target === "number") window.scrollTo({ top: target });
        else document.querySelector(target)?.scrollIntoView();
      };
      return;
    }

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      smoothWheel: true,
    });
    world.scrollTo = (target) => lenis.scrollTo(target, { duration: 1.6 });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Page offset of each stage's top edge. Re-measured after every
    // ScrollTrigger refresh because pin spacers change section heights.
    let tops: number[] = [];
    const measure = () => {
      const y = window.scrollY;
      tops = STAGES.map((id) => {
        const el = document.querySelector<HTMLElement>(`[data-stage="${id}"]`);
        return el ? el.getBoundingClientRect().top + y : 0;
      });
      tops.push(root.scrollHeight);
    };

    const compute = (y: number) => {
      if (tops.length === 0) return;
      // Pose i is reached when section i's top meets the viewport top, so the
      // page opens exactly on the hero keyframe.
      const ref = y;
      let i = 0;
      while (i < STAGES.length - 1 && ref >= tops[i + 1]) i++;
      const span = Math.max(tops[i + 1] - tops[i], 1);
      const f = Math.min(Math.max((ref - tops[i]) / span, 0), 1);
      world.stage = Math.min(i + f, STAGES.length - 1);
      world.progress = Math.min(
        Math.max(y / Math.max(root.scrollHeight - window.innerHeight, 1), 0),
        1,
      );
    };

    lenis.on("scroll", (l: Lenis) => {
      compute(l.scroll);
      world.velocity += (Math.max(Math.min(l.velocity / 40, 1), -1) - world.velocity) * 0.25;
    });

    ScrollTrigger.addEventListener("refresh", () => {
      measure();
      compute(lenis.scroll);
    });

    const onPointer = (e: PointerEvent) => {
      world.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      world.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    // Sections build their pins in their own effects; measure once they have.
    const settle = window.setTimeout(refresh, 400);

    measure();
    compute(0);

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      world.scrollTo = null;
    };
  }, []);

  return null;
}
