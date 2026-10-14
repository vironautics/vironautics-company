"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { MISSION } from "@/lib/content";
import { gsap } from "@/lib/gsap";

/**
 * Method, laid out as a flight plan. A signal line draws itself down the left
 * edge as you scroll (scrubbed), waypoints light as each stage passes, and the
 * oversized numerals drift against the copy for depth.
 */
export default function Mission() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".mission-line", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-mission-list]",
            start: "top 55%",
            end: "bottom 55%",
            scrub: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
          const numeral = step.querySelector("[data-numeral]");
          const body = step.querySelectorAll("[data-step-body]");
          const dot = step.querySelector("[data-dot]");

          if (numeral) {
            gsap.fromTo(
              numeral,
              { yPercent: 38 },
              {
                yPercent: -38,
                ease: "none",
                scrollTrigger: { trigger: step, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
          }

          gsap.from(body, {
            y: 56,
            opacity: 0,
            duration: 0.9,
            stagger: 0.09,
            ease: "expo.out",
            scrollTrigger: { trigger: step, start: "top 72%", toggleActions: "play none none reverse" },
          });

          if (dot) {
            gsap.fromTo(
              dot,
              { backgroundColor: "rgba(4,6,12,1)", scale: 1 },
              {
                backgroundColor: "rgb(212,255,58)",
                scale: 1.5,
                duration: 0.3,
                scrollTrigger: { trigger: step, start: "top 58%", toggleActions: "play none none reverse" },
              },
            );
          }
        });

        gsap.from("[data-mission-head]", {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-mission-head]", start: "top 80%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="mission"
      data-stage="mission"
      aria-labelledby="mission-title"
      className="relative px-[calc(var(--frame-inset)+22px)] py-[16vh] lg:px-[calc(var(--frame-inset)+132px)]"
    >
      <div className="mx-auto max-w-[1280px]">
        <p data-mission-head className="vn-mono flex items-center gap-4 text-signal">
          <span className="h-px w-10 bg-signal" aria-hidden="true" />
          04 / Method
        </p>
        <h2
          id="mission-title"
          data-mission-head
          className="vn-display mt-6 max-w-[16ch] text-[clamp(1.6rem,7.6vw,2.4rem)] text-foreground sm:text-[clamp(2rem,4.6vw,4.8rem)]"
        >
          {MISSION.title}
        </h2>

        <div data-mission-list className="relative mt-[10vh]">
          <span aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-line" />
          <span aria-hidden="true" className="mission-line absolute left-0 top-0 h-full w-px bg-signal shadow-[0_0_12px_rgba(212,255,58,0.8)]" />

          {MISSION.steps.map((step) => (
            <div
              key={step.index}
              data-step
              className="relative grid gap-8 py-[11vh] pl-9 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10 md:pl-20"
            >
              <span
                data-dot
                aria-hidden="true"
                className="absolute left-0 top-[calc(11vh+1.2rem)] h-3 w-3 -translate-x-1/2 border border-signal bg-[#04060c]"
              />

              <div className="relative">
                <span
                  data-numeral
                  aria-hidden="true"
                  className="vn-display vn-ghost block select-none text-[clamp(7rem,17vw,15rem)] leading-[0.85] [--ghost-a:rgba(232,240,255,0.55)] [--ghost-b:rgba(232,240,255,0)]"
                >
                  {step.index}
                </span>
              </div>

              <div>
                <p data-step-body className="vn-mono flex items-center gap-3 text-signal">
                  <span className="tabular-nums">T+</span>
                  {step.when}
                </p>
                <h3
                  data-step-body
                  className="vn-display mt-4 text-[clamp(2.2rem,4.4vw,4.4rem)] text-foreground"
                >
                  {step.name}
                </h3>
                <p data-step-body className="mt-6 max-w-[46ch] text-[1.05rem] leading-[1.7] text-muted">
                  {step.body}
                </p>
                <p
                  data-step-body
                  className="vn-brackets vn-mono mt-8 inline-flex items-center gap-3 px-6 py-3.5 text-foreground"
                >
                  <span className="h-1.5 w-1.5 bg-signal" aria-hidden="true" />
                  {step.output}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
