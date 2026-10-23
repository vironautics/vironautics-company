"use client";

import { useEffect, useRef } from "react";
import Logo from "@/components/ui/Logo";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { world } from "@/lib/world";

/** Hard ceiling: a stalled request must never trap the visitor on this screen. */
const MAX_WAIT_MS = 15000;
/** Floor: finishing in 80ms would read as a flash, not a transition. */
const MIN_SHOW_MS = 1100;

/**
 * Boot screen. It is server-rendered but hidden by CSS unless the pre-paint
 * script added `html.js-loading`, so without JS the page is simply visible.
 *
 * "Loaded" means all of:
 *   - web fonts ready and the window `load` event fired
 *   - the logo
 *   - every <img> on the page, lazy ones included (they are forced eager so
 *     nothing pops in later during the pinned horizontal scroll)
 *   - the 3D scene has its land dots and has painted a frame (`world.ready`)
 *
 * Then: scroll is pinned to the top, ScrollTrigger re-measures against the
 * finished layout, the loader lifts, and the hero intro is released.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const status = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const el = root.current;
    if (!el) return;
    // Pre-paint script did not run (or its failsafe already fired): nothing to do.
    if (!html.classList.contains("js-loading")) {
      world.loaded = true;
      return;
    }

    try {
      history.scrollRestoration = "manual";
    } catch {
      /* some embedded browsers forbid it */
    }
    window.scrollTo(0, 0);

    const started = performance.now();
    let total = 0;
    let done = 0;
    const track = (p: Promise<unknown>, weight = 1) => {
      total += weight;
      return p.then(
        () => void (done += weight),
        () => void (done += weight), // a failed asset still counts as settled
      );
    };

    const tasks: Promise<unknown>[] = [];

    tasks.push(track(document.fonts?.ready ?? Promise.resolve()));
    tasks.push(
      track(
        document.readyState === "complete"
          ? Promise.resolve()
          : new Promise<void>((res) => window.addEventListener("load", () => res(), { once: true })),
      ),
    );
    tasks.push(
      track(
        new Promise<void>((res) => {
          const img = new Image();
          img.onload = img.onerror = () => res();
          img.src = "/logo.svg";
        }),
      ),
    );
    tasks.push(
      track(
        new Promise<void>((res) => {
          const poll = window.setInterval(() => {
            if (world.ready || !world.webgl) {
              window.clearInterval(poll);
              res();
            }
          }, 50);
        }),
        4,
      ),
    );

    document.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
      img.loading = "eager";
      tasks.push(
        track(
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>((res) => {
                img.addEventListener("load", () => res(), { once: true });
                img.addEventListener("error", () => res(), { once: true });
              }),
        ),
      );
    });

    let finished = false;
    Promise.all(tasks).then(() => (finished = true));
    const giveUp = window.setTimeout(() => {
      finished = true;
    }, MAX_WAIT_MS);

    // Displayed progress eases toward real progress; it never runs ahead of it.
    let shown = 0;
    let raf = 0;
    let exiting = false;

    const exit = () => {
      exiting = true;
      window.clearTimeout(giveUp);
      if (pct.current) pct.current.textContent = "100";
      if (bar.current) bar.current.style.transform = "scaleX(1)";
      if (status.current) status.current.textContent = "Ready";
      el.setAttribute("aria-busy", "false");

      // Always the top: layout is final now, so pin and re-measure.
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
      window.scrollTo(0, 0);

      el.dataset.exiting = "true"; // keeps it visible after js-loading is removed
      html.classList.remove("js-loading"); // unlocks scrolling

      const finish = () => {
        el.style.display = "none";
        el.remove();
      };
      const release = () => {
        world.loaded = true;
        window.dispatchEvent(new Event("vn:ready"));
      };

      if (world.reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        release();
        gsap.to(el, { opacity: 0, duration: 0.3, onComplete: finish });
        return;
      }

      const tl = gsap.timeline({ onComplete: finish });
      tl.to("[data-loader-content]", { opacity: 0, y: -16, duration: 0.45, ease: "power2.in" })
        .add(release, ">-0.05")
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 1.0, ease: "expo.inOut" }, "<");
    };

    const tick = () => {
      if (exiting) return;
      const real = total ? (done / total) * 100 : 0;
      const target = finished ? 100 : Math.min(real, 99);
      shown += (target - shown) * 0.1;
      if (target - shown < 0.4) shown = target;

      if (pct.current) pct.current.textContent = String(Math.floor(shown)).padStart(2, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${shown / 100})`;

      if (finished && shown >= 100 && performance.now() - started >= MIN_SHOW_MS) {
        exit();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(giveUp);
    };
  }, []);

  return (
    <div
      ref={root}
      className="vn-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading Vironautics"
    >
      <div className="vn-loader__frame vn-brackets vn-brackets--signal" aria-hidden="true" />

      <div data-loader-content className="relative flex w-full max-w-[420px] flex-col items-center px-8">
        <div className="relative flex h-[260px] w-[260px] items-center justify-center" aria-hidden="true">
          <svg viewBox="0 0 100 100" className="vn-spin-slow absolute inset-0 h-full w-full">
            <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(170,200,255,0.3)" strokeWidth="0.15" />
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke="rgba(212,255,58,0.6)"
              strokeWidth="0.4"
              strokeDasharray="0.25 1.6"
            />
          </svg>
          <svg viewBox="0 0 100 100" className="vn-spin-rev absolute inset-0 h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="rgba(170,200,255,0.2)"
              strokeWidth="0.15"
              strokeDasharray="6 3 1 3"
            />
            <path d="M50 0.8 V4 M50 96 V99.2 M0.8 50 H4 M96 50 H99.2" stroke="rgba(212,255,58,0.9)" strokeWidth="0.35" />
          </svg>
          <Logo className="w-[150px]" decorative />
        </div>

        <p
          ref={status}
          className="vn-mono mt-9 flex items-center gap-3 text-signal"
        >
          Initialising descent
        </p>

        <div className="mt-5 h-px w-full max-w-[260px] overflow-hidden bg-line">
          <span
            ref={bar}
            className="block h-px origin-left bg-signal shadow-[0_0_10px_rgba(212,255,58,0.8)]"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <p className="mt-6 font-display text-[clamp(2.4rem,6vw,4rem)] font-medium leading-none tabular-nums tracking-[-0.04em] text-foreground">
          <span ref={pct}>00</span>
          <span className="text-signal">%</span>
        </p>
      </div>

      <p
        aria-hidden="true"
        className="vn-mono absolute bottom-[calc(var(--frame-inset)+16px)] left-[calc(var(--frame-inset)+18px)] text-subtle"
      >
        ALT 408 KM
      </p>
      <p
        aria-hidden="true"
        className="vn-mono absolute bottom-[calc(var(--frame-inset)+16px)] right-[calc(var(--frame-inset)+18px)] text-subtle"
      >
        35.8256°N 10.6084°E
      </p>
    </div>
  );
}
