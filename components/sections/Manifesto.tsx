"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { MANIFESTO } from "@/lib/content";
import { gsap, reducedMotion } from "@/lib/gsap";

/**
 * A tall track with a sticky one-viewport stage. Scrolling through the track
 * (a) lights the sentence word by word and (b) carries four photographs across
 * the stage at different speeds and tilts. Faster figures read as nearer.
 *
 * Without motion (reduced-motion or no JS) the track collapses to one
 * viewport and every word is fully lit — see globals.css `.vn-word`.
 */

// [x position class, width class, start y, end y (vh), start rot, end rot]
const PLACEMENT = [
  { pos: "left-[3vw] top-[14vh]", w: "w-[17vw]", y0: 95, y1: -105, r0: -5, r1: 3 },
  { pos: "right-[4vw] top-[6vh]", w: "w-[13vw]", y0: 70, y1: -70, r0: 4, r1: -2 },
  { pos: "left-[11vw] bottom-[4vh]", w: "w-[12vw]", y0: 130, y1: -150, r0: 2, r1: -6 },
  { pos: "right-[9vw] bottom-[8vh]", w: "w-[19vw]", y0: 60, y1: -95, r0: -3, r1: 5 },
] as const;

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const words = MANIFESTO.text.split(" ");

  useGSAP(
    () => {
      if (reducedMotion()) return;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      tl.fromTo(
        ".vn-word",
        { opacity: 0.14 },
        { opacity: 1, stagger: 0.14, duration: 0.4 },
        0,
      );

      // The word stagger sets the timeline length; the figures must span all
      // of it, otherwise they finish in the first sixth of the scroll.
      const total = tl.duration();
      gsap.utils.toArray<HTMLElement>("[data-figure]").forEach((fig, i) => {
        const p = PLACEMENT[i];
        tl.fromTo(
          fig,
          { y: `${p.y0}vh`, rotate: p.r0 },
          { y: `${p.y1}vh`, rotate: p.r1, duration: total },
          0,
        );
        const img = fig.querySelector("[data-fig-img]");
        if (img) tl.fromTo(img, { scale: 1.35 }, { scale: 1.05, duration: total }, 0);
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="brief"
      data-stage="manifesto"
      className="relative [.js-motion_&]:h-[260vh]"
    >
      <div className="flex min-h-[100svh] items-center justify-center overflow-hidden px-6 py-28 [.js-motion_&]:sticky [.js-motion_&]:top-0 [.js-motion_&]:h-[100svh] [.js-motion_&]:py-0">
        {/* Figures */}
        {MANIFESTO.figures.map((fig, i) => {
          const p = PLACEMENT[i];
          return (
            <figure
              key={fig.id}
              data-figure
              className={`vn-brackets absolute z-0 hidden md:block ${p.pos} ${p.w}`}
              aria-hidden="true"
            >
              <div className="vn-duo aspect-[3/4] w-full">
                <div data-fig-img className="absolute inset-0">
                  <Image
                    src={fig.src}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="20vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <figcaption className="vn-mono absolute -bottom-6 left-0 text-subtle">
                {fig.caption}
              </figcaption>
            </figure>
          );
        })}

        <div className="relative z-10 mx-auto max-w-[64rem]">
          <p className="vn-mono mb-8 flex items-center justify-center gap-4 text-signal">
            <span className="h-px w-10 bg-signal" aria-hidden="true" />
            02 / Brief
            <span className="h-px w-10 bg-signal" aria-hidden="true" />
          </p>
          <p
            className="text-balance text-center font-display text-[clamp(1.3rem,3vw,2.9rem)] font-medium leading-[1.2] tracking-[-0.02em] text-foreground"
            aria-label={MANIFESTO.text}
          >
            {words.map((w, i) => (
              <span key={`${w}-${i}`} className="vn-word" aria-hidden="true">
                {w}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
