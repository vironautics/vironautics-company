"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { LAB } from "@/lib/content";
import { gsap, SplitText } from "@/lib/gsap";

/**
 * AI services + our own SaaS products. The terminal is illustrative output,
 * labelled as such; it exists to show what "evals and guardrails" means in
 * practice. Lines type out once, on entry. The text is real DOM text from the
 * start, so it is readable without JS and by screen readers.
 */
export default function Lab() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Layered depth: the photo behind the terminal drifts the other way.
        gsap.fromTo(
          "[data-lab-photo]",
          { yPercent: 14, x: 30 },
          {
            yPercent: -14,
            x: -30,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        gsap.fromTo(
          "[data-lab-term]",
          { yPercent: 6 },
          {
            yPercent: -6,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );

        gsap.from("[data-lab-in]", {
          y: 48,
          opacity: 0,
          duration: 1,
          stagger: 0.09,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-lab-in]", start: "top 80%" },
        });

        gsap.utils.toArray<HTMLElement>("[data-product]").forEach((row) => {
          gsap.from(row, {
            opacity: 0,
            x: -40,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: row, start: "top 88%" },
          });
        });

        // Type the terminal, line by line, character by character.
        const lines = gsap.utils.toArray<HTMLElement>("[data-term-line]");
        const split = new SplitText(lines, { type: "chars" });
        gsap.set(split.chars, { opacity: 0 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-lab-term]", start: "top 72%", once: true },
        });
        lines.forEach((line, i) => {
          // With type: "chars" the line's direct children are the characters.
          tl.to(
            Array.from(line.children),
            { opacity: 1, duration: 0.01, stagger: 0.016 },
            i === 0 ? 0 : ">+0.18",
          );
        });
        return () => split.revert();
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="lab"
      data-stage="lab"
      aria-labelledby="lab-title"
      className="relative overflow-hidden px-[calc(var(--frame-inset)+22px)] py-[16vh] lg:px-[calc(var(--frame-inset)+132px)]"
    >
      <div className="mx-auto grid max-w-[1400px] gap-20 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p data-lab-in className="vn-mono flex items-center gap-4 text-signal">
            <span className="h-px w-10 bg-signal" aria-hidden="true" />
            05 / {LAB.eyebrow}
          </p>
          <h2
            id="lab-title"
            data-lab-in
            className="vn-display mt-6 text-[clamp(1.5rem,7vw,2.2rem)] text-foreground sm:text-[clamp(1.9rem,3.8vw,3.9rem)]"
          >
            {LAB.title}
          </h2>

          <ul className="mt-14 border-b border-line">
            {LAB.products.map((p, i) => (
              <li key={p.name} data-product className="group border-t border-line">
                <a
                  href={p.href}
                  {...(p.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-baseline justify-between gap-6 py-7 transition-[padding] duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:pl-3"
                >
                  <div className="min-w-0">
                    <p className="vn-mono mb-2 text-muted">
                      0{i + 1} / {p.kind}
                    </p>
                    <h3 className="vn-display text-[clamp(1.5rem,2.4vw,2.4rem)] text-foreground transition-colors duration-[var(--dur-base)] group-hover:text-signal">
                      {p.name}
                    </h3>
                    <p className="mt-3 max-w-[42ch] text-[0.95rem] leading-[1.6] text-muted">
                      {p.body}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={26}
                    strokeWidth={1.25}
                    aria-hidden="true"
                    className="shrink-0 text-subtle transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-signal"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-7">
          {/* Back layer: photograph */}
          <div
            data-lab-photo
            aria-hidden="true"
            className="vn-brackets vn-duo absolute -right-[4vw] -top-[8vh] hidden aspect-[4/3] w-[72%] [--duo-b:1.35] lg:block"
          >
            <Image
              src={LAB.image.src}
              alt=""
              fill
              loading="lazy"
              sizes="40vw"
              className="object-cover"
            />
          </div>

          {/* Front layer: terminal */}
          <div
            data-lab-term
            className="vn-brackets vn-brackets--signal relative z-10 mt-0 w-full bg-[var(--color-panel)] backdrop-blur-[var(--panel-blur)] lg:mt-[22vh] lg:w-[min(100%,560px)]"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <p className="vn-mono flex items-center gap-2.5 text-signal">
                <span className="vn-blink h-1.5 w-1.5 bg-signal" aria-hidden="true" />
                {LAB.terminal.title}
              </p>
              <p className="vn-mono text-muted">LIVE</p>
            </div>
            <div className="px-5 py-6 font-mono text-[0.78rem] leading-[1.9] text-muted sm:text-[0.82rem]">
              {LAB.terminal.lines.map((line, i) => (
                <p
                  key={line}
                  data-term-line
                  className={
                    i === 0
                      ? "text-foreground"
                      : line.startsWith("✓")
                        ? "mt-2 text-signal"
                        : undefined
                  }
                >
                  {line}
                </p>
              ))}
              <p className="mt-1 text-signal" aria-hidden="true">
                &gt; <span className="vn-blink inline-block h-3.5 w-2 translate-y-0.5 bg-signal" />
              </p>
            </div>
            <p className="vn-mono border-t border-line px-5 py-3 text-muted">
              {LAB.terminal.caption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
