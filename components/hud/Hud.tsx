"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { HUD_STAGES } from "@/lib/content";
import { STAGES, world } from "@/lib/world";
import { CONTACT } from "@/lib/content";

/**
 * Fixed mission-control overlay: an altitude ruler that flows with scroll, live
 * telemetry, a stage index, and Sousse local time.
 *
 * Everything is written straight to the DOM from the GSAP ticker. Nothing here
 * goes through React state, so it costs no re-renders at 60 fps.
 *
 * The readouts are theatre, not data: altitude is a function of scroll depth
 * (408 km at the top, the ISS orbit, down to 0 m at touchdown in Sousse).
 */
export default function Hud() {
  const alt = useRef<HTMLSpanElement>(null);
  const altUnit = useRef<HTMLSpanElement>(null);
  const vel = useRef<HTMLSpanElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const items = useRef<Array<HTMLButtonElement | null>>([]);
  const last = useRef({ alt: "", unit: "", vel: "", active: -1, clock: "" });

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: CONTACT.timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    let lastClock = 0;

    const tick = () => {
      const p = world.progress;
      const km = 408 * Math.pow(1 - p, 2.4);
      const altText = km >= 1 ? String(Math.round(km)).padStart(3, "0") : String(Math.round(km * 1000)).padStart(3, "0");
      const unit = km >= 1 ? "KM" : "M";
      const v = (7.66 * Math.pow(1 - p, 0.8)).toFixed(2);
      const active = Math.min(Math.round(world.stage), STAGES.length - 1);
      const l = last.current;

      if (alt.current && l.alt !== altText) {
        alt.current.textContent = altText;
        l.alt = altText;
      }
      if (altUnit.current && l.unit !== unit) {
        altUnit.current.textContent = unit;
        l.unit = unit;
      }
      if (vel.current && l.vel !== v) {
        vel.current.textContent = v;
        l.vel = v;
      }
      if (ruler.current) {
        ruler.current.style.backgroundPositionY = `${p * 2600}px, ${p * 2600}px`;
      }
      if (active !== l.active) {
        items.current.forEach((el, i) => {
          if (!el) return;
          const on = i === active;
          el.dataset.active = on ? "true" : "false";
          el.setAttribute("aria-current", on ? "true" : "false");
        });
        l.active = active;
      }
      const now = performance.now();
      if (clock.current && now - lastClock > 500) {
        lastClock = now;
        const t = fmt.format(new Date());
        if (t !== l.clock) {
          clock.current.textContent = t;
          l.clock = t;
        }
      }
    };

    tick();
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const go = (id: string) => {
    const sel = `[data-stage="${id}"]`;
    if (world.scrollTo) world.scrollTo(sel);
    else document.querySelector(sel)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="vn-frame vn-brackets" aria-hidden="true" />

      {/* Left rail: altitude ruler + telemetry */}
      <aside
        aria-hidden="true"
        className="pointer-events-none fixed left-[calc(var(--frame-inset)+14px)] top-1/2 z-[var(--z-hud)] hidden -translate-y-1/2 items-stretch gap-4 bg-[#04060c]/72 py-5 pl-1 pr-4 backdrop-blur-[6px] lg:flex"
      >
        <div
          ref={ruler}
          className="h-[44vh] w-3"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(212,255,58,0.85) 0 1px, transparent 1px 44px), repeating-linear-gradient(to bottom, rgba(170,200,255,0.4) 0 1px, transparent 1px 11px)",
            backgroundSize: "12px 44px, 6px 11px",
            backgroundRepeat: "repeat-y, repeat-y",
            maskImage: "linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)",
          }}
        />
        <div className="flex flex-col justify-center gap-5">
          <div>
            <p className="vn-mono text-subtle">ALT</p>
            <p className="font-mono text-[1.35rem] font-medium leading-none tabular-nums text-signal">
              <span ref={alt}>408</span>
              <span ref={altUnit} className="ml-1.5 text-[0.7rem] text-subtle">
                KM
              </span>
            </p>
          </div>
          <div>
            <p className="vn-mono text-subtle">VEL</p>
            <p className="font-mono text-[0.95rem] leading-none tabular-nums text-foreground">
              <span ref={vel}>7.66</span>
              <span className="ml-1.5 text-[0.65rem] text-subtle">KM/S</span>
            </p>
          </div>
          <div>
            <p className="vn-mono text-subtle">SOUSSE</p>
            <p className="font-mono text-[0.8rem] leading-none tabular-nums text-foreground">
              <span ref={clock}>--:--:--</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Right rail: stage index */}
      <nav
        aria-label="Page sections"
        className="fixed right-[calc(var(--frame-inset)+14px)] top-1/2 z-[var(--z-hud)] hidden -translate-y-1/2 bg-[#04060c]/72 py-5 pl-3 pr-1 backdrop-blur-[6px] lg:block"
      >
        <ol className="flex flex-col items-end gap-3.5">
          {HUD_STAGES.map((label, i) => (
            <li key={label}>
              <button
                ref={(el) => {
                  items.current[i] = el;
                }}
                type="button"
                onClick={() => go(STAGES[i])}
                data-active={i === 0 ? "true" : "false"}
                className="group relative flex min-h-6 cursor-pointer items-center gap-3 text-subtle transition-colors data-[active=true]:text-signal hover:text-foreground"
              >
                <span className="vn-mono pointer-events-none absolute right-full mr-4 translate-x-1 whitespace-nowrap bg-[#04060c]/85 px-2 py-1 opacity-0 transition-all duration-[var(--dur-base)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                  {label}
                </span>
                <span className="vn-mono tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="block h-px w-4 bg-current transition-all duration-[var(--dur-base)] group-data-[active=true]:w-9" />
              </button>
            </li>
          ))}
        </ol>
      </nav>

    </>
  );
}
