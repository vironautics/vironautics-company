"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { HERO } from "@/lib/content";
import { gsap, SplitText, reducedMotion } from "@/lib/gsap";
import { world } from "@/lib/world";

const ROUTES = [
  ["SOUSSE → LYON", "1,020 KM"],
  ["SOUSSE → PARIS", "1,460 KM"],
  ["SOUSSE → DUBAI", "4,480 KM"],
] as const;

/**
 * Orbit view. The planet is WebGL (components/world); everything here is the
 * layer in front of it, so it can move at a different speed from the planet —
 * that gap is the parallax.
 *
 *   world  : camera dives as you scroll
 *   copy   : lifts away faster, fading
 *   reticle: drifts with the pointer (depth 14) and spins on its own axis
 *   routes : drifts with the pointer the other way (depth -22)
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;

      const lines = gsap.utils.toArray<HTMLElement>("[data-hero-line]");
      const split = new SplitText(lines, { type: "lines", mask: "lines" });
      gsap.set(lines, { visibility: "visible" });

      // Built paused: the loader releases it (vn:ready) so the entrance is seen,
      // not played out behind the boot screen.
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.to(world, { intro: 1, duration: 3.2, ease: "power3.out" }, 0)
        .from(split.lines, { yPercent: 115, duration: 1.4, stagger: 0.14 }, 0.35)
        .fromTo(
          "[data-hero-fade]",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.09, ease: "power3.out" },
          1.0,
        );

      // Scroll-out: the copy leaves faster than the planet recedes.
      gsap.to("[data-hero-copy]", {
        yPercent: -26,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom 35%",
          scrub: true,
        },
      });
      gsap.to("[data-hero-routes]", {
        yPercent: -140,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "70% top",
          scrub: true,
        },
      });
      gsap.to("[data-hero-reticle]", {
        scale: 1.35,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom 40%",
          scrub: true,
        },
      });

      const play = () => tl.play();
      const gated = document.documentElement.classList.contains("js-loading");
      if (world.loaded || !gated) play();
      else window.addEventListener("vn:ready", play, { once: true });

      // Pointer parallax: each layer has its own depth and direction.
      const layers = gsap.utils.toArray<HTMLElement>("[data-depth]").map((el) => ({
        x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
        depth: Number(el.dataset.depth),
      }));
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        layers.forEach((l) => {
          l.x(nx * l.depth * 2);
          l.y(ny * l.depth * 2);
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      // useGSAP reverts every tween and ScrollTrigger made above on unmount.
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("vn:ready", play);
        split.revert();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      data-stage="hero"
      className="relative min-h-[100svh] overflow-x-clip"
    >
      {/* Targeting reticle locked onto the planet (desktop only). */}
      <div
        aria-hidden="true"
        data-hero-reticle
        className="pointer-events-none absolute left-[72%] top-1/2 hidden aspect-square w-[min(94vh,62vw)] -translate-x-1/2 -translate-y-1/2 lg:block"
      >
        <div data-depth="14" className="h-full w-full">
          <svg viewBox="0 0 100 100" className="vn-spin-slow absolute inset-0 h-full w-full">
            <circle cx="50" cy="50" r="49.2" fill="none" stroke="rgba(170,200,255,0.34)" strokeWidth="0.12" />
            <circle
              cx="50"
              cy="50"
              r="47.6"
              fill="none"
              stroke="rgba(212,255,58,0.55)"
              strokeWidth="0.35"
              strokeDasharray="0.25 1.57"
            />
          </svg>
          <svg viewBox="0 0 100 100" className="vn-spin-rev absolute inset-0 h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="44.6"
              fill="none"
              stroke="rgba(170,200,255,0.22)"
              strokeWidth="0.12"
              strokeDasharray="6 3 1 3"
            />
            <path d="M50 0.8 V4.2 M50 95.8 V99.2 M0.8 50 H4.2 M95.8 50 H99.2" stroke="rgba(212,255,58,0.9)" strokeWidth="0.3" />
          </svg>
          <p className="vn-mono absolute left-[8%] top-[10%] text-signal">TGT / SOUSSE</p>
          <p className="vn-mono absolute right-[4%] top-[17%] text-subtle">LOCK 35.83°N 10.61°E</p>
        </div>
      </div>

      <div className="relative z-[var(--z-content)] mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col justify-center px-[calc(var(--frame-inset)+22px)] pb-24 pt-[calc(var(--nav-height)+2rem)] lg:px-[calc(var(--frame-inset)+132px)]">
        <div data-hero-copy className="max-w-[62rem]">
          <p
            data-hero-fade
            className="vn-mono flex items-center gap-4 text-signal"
          >
            <span className="h-px w-10 bg-signal" aria-hidden="true" />
            {HERO.eyebrow}
          </p>

          <h1 className="vn-display mt-7 text-[clamp(1.45rem,7.4vw,2.6rem)] text-foreground sm:text-[clamp(2.15rem,5.1vw,5.4rem)]">
            <span data-hero-line className="block">
              {HERO.lines[0]}
            </span>{" "}
            <span data-hero-line className="vn-outline block">
              {HERO.lines[1]}
            </span>{" "}
            <span data-hero-line className="block">
              {HERO.lines[2]}
            </span>
          </h1>

          <p
            data-hero-fade
            className="mt-9 max-w-[42ch] text-[1.0625rem] leading-[1.65] text-muted sm:text-[1.15rem]"
          >
            {HERO.body}
          </p>

          <div data-hero-fade className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={HERO.primary.href}>
              {HERO.primary.label}
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button href={HERO.secondary.href} variant="ghost">
              {HERO.secondary.label}
            </Button>
          </div>
        </div>
      </div>

      {/* Disciplines strip */}
      <ul
        data-hero-fade
        className="absolute bottom-[calc(var(--frame-inset)+22px)] left-[calc(var(--frame-inset)+22px)] z-[var(--z-content)] hidden flex-wrap gap-x-5 gap-y-1 sm:flex lg:left-[calc(var(--frame-inset)+132px)]"
      >
        {HERO.disciplines.map((d) => (
          <li key={d} className="vn-mono flex items-center gap-2 text-subtle">
            <span className="h-1 w-1 bg-signal" aria-hidden="true" />
            {d}
          </li>
        ))}
      </ul>

      {/* Live routes (decorative) */}
      <aside
        aria-hidden="true"
        data-hero-routes
        className="absolute bottom-[calc(var(--frame-inset)+22px)] right-[calc(var(--frame-inset)+132px)] z-[var(--z-content)] hidden lg:block"
      >
        <div data-depth="-22" className="vn-brackets min-w-[250px] bg-[var(--color-panel)] px-5 py-4 backdrop-blur-[var(--panel-blur)]">
          <p className="vn-mono mb-3 flex items-center gap-2 text-signal">
            <span className="vn-blink h-1.5 w-1.5 bg-signal" />
            Routes / 12 active
          </p>
          {ROUTES.map(([a, b]) => (
            <p key={a} className="vn-mono flex justify-between gap-6 py-0.5 text-muted">
              <span>{a}</span>
              <span className="tabular-nums text-foreground">{b}</span>
            </p>
          ))}
        </div>
      </aside>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        data-hero-fade
        className="absolute bottom-[calc(var(--frame-inset)+22px)] left-1/2 z-[var(--z-content)] flex -translate-x-1/2 flex-col items-center gap-3 sm:hidden"
      >
        <span className="vn-mono text-subtle">Descend</span>
        <span className="block h-10 w-px overflow-hidden bg-line">
          <span className="vn-cue block h-full w-full bg-signal" />
        </span>
      </div>
    </section>
  );
}
