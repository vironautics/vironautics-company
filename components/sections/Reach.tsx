"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { REACH } from "@/lib/content";
import { gsap } from "@/lib/gsap";

/**
 * Reach. Two oversized type rows are bound to scroll in opposite directions
 * (scrubbed, not a CSS loop, so they stop when you stop). A photograph sits
 * behind with the strongest background parallax on the page. The numbers are
 * real text from first paint; the count-up only animates *toward* them.
 */
export default function Reach() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = (extra = {}) => ({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          ...extra,
        });

        gsap.fromTo("[data-row-a]", { xPercent: 0 }, { xPercent: -38, ease: "none", scrollTrigger: st() });
        gsap.fromTo("[data-row-b]", { xPercent: -38 }, { xPercent: 0, ease: "none", scrollTrigger: st() });
        gsap.fromTo(
          "[data-reach-bg]",
          { yPercent: -22, scale: 1.25 },
          { yPercent: 22, scale: 1.25, ease: "none", scrollTrigger: st() },
        );

        gsap.from("[data-stat]", {
          y: 60,
          opacity: 0,
          duration: 1,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-stats]", start: "top 82%" },
        });

        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const target = Number(el.dataset.count);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 2.2,
            ease: "power3.out",
            onUpdate: () => {
              el.textContent = String(Math.round(obj.v));
            },
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });

        gsap.from("[data-reach-head]", {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-reach-head]", start: "top 82%" },
        });
      });
    },
    { scope: root },
  );

  const repeat = (text: string) => Array.from({ length: 4 }, () => text).join(" ");

  return (
    <section
      ref={root}
      id="reach"
      data-stage="reach"
      aria-labelledby="reach-title"
      className="relative isolate overflow-hidden py-[16vh]"
    >
      {/* Feathered top and bottom: an opaque edge here would slice the planet
          in half where it meets the neighbouring sections. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,#000_26%,#000_74%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_26%,#000_74%,transparent)]"
      >
        <div data-reach-bg className="vn-duo absolute inset-0 opacity-30">
          <Image
            src={REACH.image.src}
            alt=""
            fill
            loading="lazy"
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-[#04060c]/55" />
      </div>

      <div className="px-[calc(var(--frame-inset)+22px)] lg:px-[calc(var(--frame-inset)+132px)]">
        <div className="mx-auto max-w-[1400px]">
          <p data-reach-head className="vn-mono flex items-center gap-4 text-signal">
            <span className="h-px w-10 bg-signal" aria-hidden="true" />
            06 / {REACH.eyebrow}
          </p>
          <h2
            id="reach-title"
            data-reach-head
            className="vn-display mt-6 max-w-[18ch] text-[clamp(1.55rem,7.4vw,2.4rem)] text-foreground sm:text-[clamp(2rem,4.6vw,4.8rem)]"
          >
            {REACH.title}
          </h2>
        </div>
      </div>

      {/* Scroll-bound marquees */}
      <div aria-hidden="true" className="mt-[10vh] select-none overflow-hidden">
        <div data-row-a className="vn-marquee-row">
          <p className="vn-display vn-ghost whitespace-nowrap pr-12 text-[clamp(4.5rem,13vw,12rem)] [--ghost-a:rgba(232,240,255,0.7)] [--ghost-b:rgba(232,240,255,0.04)]">
            {repeat(REACH.marquee[0])}
          </p>
        </div>
        <div data-row-b className="vn-marquee-row -mt-[0.5vw]">
          <p className="vn-display vn-ghost whitespace-nowrap pr-12 text-[clamp(3.5rem,9.5vw,9rem)] [--ghost-a:rgba(212,255,58,1)] [--ghost-b:rgba(212,255,58,0.08)]">
            {repeat(REACH.marquee[1])}
          </p>
        </div>
      </div>

      <div className="px-[calc(var(--frame-inset)+22px)] lg:px-[calc(var(--frame-inset)+132px)]">
        <dl
          data-stats
          className="mx-auto mt-[12vh] grid max-w-[1400px] grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4"
        >
          {REACH.stats.map((s) => (
            <div key={s.label} data-stat className="vn-brackets px-5 py-7 sm:px-7">
              <dd className="order-1 font-display text-[clamp(2.6rem,5.2vw,5rem)] font-medium leading-none tracking-[-0.04em] tabular-nums text-foreground">
                <span data-count={s.value}>{s.value}</span>
                <span className="text-signal">{s.suffix}</span>
              </dd>
              <dt className="vn-mono mt-5 max-w-[22ch] text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
