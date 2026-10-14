"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { SERVICES } from "@/lib/content";
import { gsap } from "@/lib/gsap";

/**
 * Pinned horizontal scroll (the page's one big pin).
 *
 * While pinned, vertical scroll drives `x` on the track. Inside that, every
 * panel runs three more parallax layers keyed to the track's own movement
 * (`containerAnimation`), each at a different speed:
 *
 *   numeral   drifts fastest, against the direction of travel
 *   copy      drifts slightly
 *   photo     counter-scrolls inside its frame, so the frame slides one way
 *             while the image slides the other
 *
 * Below 1024px, or with reduced motion, none of this applies and the panels
 * simply stack — see `.cap-*` in globals.css.
 */
export default function Capabilities() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current!;
        const dist = () => Math.max(t.scrollWidth - window.innerWidth, 1);

        const travel = gsap.to(t, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (fill.current) fill.current.style.transform = `scaleX(${self.progress})`;
              if (counter.current) {
                const idx = Math.min(
                  Math.floor(self.progress * SERVICES.length * 0.98) + 1,
                  SERVICES.length,
                );
                counter.current.textContent = String(idx).padStart(2, "0");
              }
            },
          },
        });

        gsap.utils.toArray<HTMLElement>(".cap-panel").forEach((panel) => {
          const trigger = {
            trigger: panel,
            containerAnimation: travel,
            start: "left right",
            end: "right left",
            scrub: true,
          };
          const img = panel.querySelector("[data-par-img]");
          const num = panel.querySelector("[data-par-num]");
          const copy = panel.querySelector("[data-par-copy]");
          if (img) gsap.fromTo(img, { xPercent: -11 }, { xPercent: 11, ease: "none", scrollTrigger: trigger });
          if (num) gsap.fromTo(num, { x: "16vw" }, { x: "-14vw", ease: "none", scrollTrigger: trigger });
          if (copy) gsap.fromTo(copy, { x: 70 }, { x: -70, ease: "none", scrollTrigger: trigger });
        });

        const head = root.current!.querySelector("[data-cap-head]");
        if (head) gsap.fromTo(head, { x: 0 }, { x: "-18vw", ease: "none", scrollTrigger: {
          trigger: pin.current, start: "top top", end: () => `+=${dist()}`, scrub: true } });
      });

      // Stacked layout: a simple vertical parallax on each photo.
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".cap-panel").forEach((panel) => {
          const img = panel.querySelector("[data-par-img]");
          if (!img) return;
          gsap.fromTo(
            img,
            { yPercent: -9 },
            {
              yPercent: 9,
              ease: "none",
              scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="capabilities"
      data-stage="capabilities"
      aria-labelledby="cap-title"
      className="relative"
    >
      <div ref={pin} className="cap-pin relative">
        {/* Pinned HUD strip */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden items-start justify-between px-[calc(var(--frame-inset)+132px)] pt-[calc(var(--nav-height)+8px)] lg:flex [html:not(.js-motion)_&]:lg:hidden">
          <p className="vn-mono text-signal">03 / Capabilities</p>
          <p className="vn-mono text-muted">
            <span ref={counter} className="tabular-nums text-signal">
              01
            </span>{" "}
            / {String(SERVICES.length).padStart(2, "0")}
          </p>
        </div>
        <div className="absolute inset-x-[calc(var(--frame-inset)+132px)] bottom-[calc(var(--frame-inset)+24px)] z-20 hidden h-px bg-line lg:block [html:not(.js-motion)_&]:lg:hidden">
          <span
            ref={fill}
            className="block h-px origin-left bg-signal"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <div className="cap-mask">
        <div ref={track} className="cap-track px-[calc(var(--frame-inset)+22px)] py-24 lg:px-0 lg:py-0">
          {/* Intro panel */}
          <div
            data-cap-head
            className="mb-32 shrink-0 lg:mb-0 lg:mr-[8vw] lg:w-[46vw]"
          >
            <p className="vn-mono mb-6 flex items-center gap-4 text-signal lg:hidden">
              <span className="h-px w-10 bg-signal" aria-hidden="true" />
              03 / Capabilities
            </p>
            <h2
              id="cap-title"
              className="vn-display text-[clamp(1.55rem,7.2vw,2.4rem)] text-foreground sm:text-[clamp(2.2rem,5vw,5.6rem)]"
            >
              Six
              <br />
              <span className="vn-outline">disciplines.</span>
              <br />
              One crew.
            </h2>
            <p className="mt-8 hidden max-w-[34ch] text-muted lg:block">
              Scroll to travel through the stack. Each stage is a discipline we
              run in-house — never subcontracted.
            </p>
            <p className="vn-mono mt-10 hidden items-center gap-3 text-subtle lg:flex">
              <span className="block h-px w-14 bg-subtle" aria-hidden="true" />
              Keep scrolling
            </p>
          </div>

          {SERVICES.map((s) => (
            <article
              key={s.id}
              className="cap-panel mb-24 grid gap-8 lg:mb-0 lg:h-[66vh] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-14"
            >
              <div className="relative">
                <span
                  data-par-num
                  aria-hidden="true"
                  className="vn-display vn-ghost pointer-events-none absolute -left-2 -top-16 select-none text-[clamp(8rem,20vw,19rem)] leading-none [--ghost-a:rgba(232,240,255,0.3)] [--ghost-b:rgba(232,240,255,0)] lg:-top-[26vh]"
                >
                  {s.index}
                </span>
                <div data-par-copy className="relative">
                  <p className="vn-mono text-signal">
                    {s.index} / {String(SERVICES.length).padStart(2, "0")}
                  </p>
                  <h3 className="vn-display mt-4 text-[clamp(1.7rem,3vw,3rem)] text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-3 font-display text-[1.05rem] text-[var(--vn-blue-200)]">
                    {s.claim}
                  </p>
                  <p className="mt-6 max-w-[40ch] text-[1rem] leading-[1.65] text-muted">
                    {s.body}
                  </p>
                  <ul className="mt-8 grid max-w-[34rem] grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
                    {s.bullets.map((b) => (
                      <li key={b} className="vn-mono flex items-center gap-2.5 text-foreground">
                        <span className="h-1 w-1 shrink-0 bg-signal" aria-hidden="true" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <figure className="vn-brackets vn-brackets--signal relative h-full">
                <div className="vn-duo aspect-[4/5] w-full lg:aspect-auto lg:h-full">
                  <div data-par-img className="absolute inset-y-0 -inset-x-[14%] lg:-inset-x-[16%]">
                    <Image
                      src={s.image.src}
                      alt={s.image.alt}
                      fill
                      loading="lazy"
                      sizes="(min-width: 1024px) 46vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
                <figcaption className="vn-mono absolute bottom-4 left-5 z-10 bg-[#04060c]/85 px-2.5 py-1.5 text-signal">
                  {s.image.caption}
                </figcaption>
              </figure>
            </article>
          ))}

          <div aria-hidden="true" className="hidden shrink-0 lg:block lg:w-[6vw]" />
        </div>
        </div>
      </div>
    </section>
  );
}
