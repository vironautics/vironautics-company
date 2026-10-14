"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { CONTACT, NAV_LINKS } from "@/lib/content";
import { gsap, SplitText } from "@/lib/gsap";

/**
 * Touchdown. The camera has descended to a few thousand km above Sousse; the
 * beacon pulses off to the right. The footer's wordmark rises into place as the
 * page ends.
 */
export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: CONTACT.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const set = () => setTime(fmt.format(new Date()));
    set();
    const id = window.setInterval(set, 15000);
    return () => window.clearInterval(id);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const heading = root.current!.querySelector("[data-contact-title]");
        if (heading) {
          const split = new SplitText(heading, { type: "words,chars", mask: "chars" });
          gsap.from(split.chars, {
            yPercent: 110,
            duration: 1.1,
            stagger: 0.022,
            ease: "expo.out",
            scrollTrigger: { trigger: heading, start: "top 80%" },
          });
        }

        gsap.from("[data-contact-in]", {
          y: 36,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-contact-in]", start: "top 85%" },
        });

        gsap.fromTo(
          "[data-wordmark]",
          { yPercent: 70, opacity: 0.4 },
          {
            yPercent: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-footer]",
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: root },
  );

  const year = new Date().getFullYear();

  return (
    <section ref={root}>
      <div
        id="contact"
        data-stage="contact"
        aria-labelledby="contact-title"
        className="relative flex min-h-[100svh] items-center px-[calc(var(--frame-inset)+22px)] py-[14vh] lg:px-[calc(var(--frame-inset)+132px)]"
      >
        <div className="mx-auto grid w-full max-w-[1400px] gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p data-contact-in className="vn-mono flex items-center gap-4 text-signal">
              <span className="h-px w-10 bg-signal" aria-hidden="true" />
              07 / {CONTACT.eyebrow}
            </p>
            <h2
              id="contact-title"
              data-contact-title
              className="vn-display mt-7 text-[clamp(1.7rem,8.4vw,2.8rem)] text-foreground sm:text-[clamp(2.2rem,5.4vw,5.8rem)]"
            >
              {CONTACT.title}
            </h2>
            <p
              data-contact-in
              className="mt-8 max-w-[46ch] text-[1.1rem] leading-[1.7] text-muted"
            >
              {CONTACT.body}
            </p>
            <div data-contact-in className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href={`mailto:${CONTACT.email}`}>
                Start a project
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </Button>
              <Button href="#capabilities" variant="ghost">
                Review capabilities
              </Button>
            </div>
          </div>

          <aside
            data-contact-in
            className="vn-brackets vn-brackets--signal self-end bg-[var(--color-panel)] p-7 backdrop-blur-[var(--panel-blur)] lg:col-span-4 lg:col-start-9"
          >
            <p className="vn-mono flex items-center gap-2.5 text-signal">
              <span className="vn-blink h-1.5 w-1.5 bg-signal" aria-hidden="true" />
              Ground station
            </p>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="vn-mono text-subtle">Position</dt>
                <dd className="mt-1 flex items-center gap-2.5 font-mono text-[0.95rem] text-foreground">
                  <MapPin size={15} strokeWidth={1.5} aria-hidden="true" className="text-signal" />
                  {CONTACT.coords}
                </dd>
              </div>
              <div>
                <dt className="vn-mono text-subtle">Local time</dt>
                <dd className="mt-1 font-mono text-[0.95rem] tabular-nums text-foreground">
                  {time} <span className="text-subtle">CET</span>
                </dd>
              </div>
              <div>
                <dt className="vn-mono text-subtle">Channel</dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="inline-flex min-h-8 items-center gap-2.5 font-mono text-[0.95rem] text-foreground underline decoration-line-strong decoration-1 underline-offset-4 transition-colors hover:text-signal"
                  >
                    <Mail size={15} strokeWidth={1.5} aria-hidden="true" className="text-signal" />
                    {CONTACT.email}
                  </a>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>

      <footer data-footer className="relative overflow-hidden border-t border-line bg-[#04060c]">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-[calc(var(--frame-inset)+22px)] pt-16 sm:grid-cols-3 lg:px-[calc(var(--frame-inset)+132px)]">
          <p className="max-w-[34ch] text-[0.95rem] leading-[1.65] text-muted">
            A technology and growth partner in {CONTACT.address}, building for
            companies across Europe, the Gulf and North Africa.
          </p>
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="vn-mono inline-flex min-h-8 items-center text-muted transition-colors hover:text-signal"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="vn-mono text-subtle sm:text-right">
            © {year} Vironautics
            <br />
            Designed &amp; built in {CONTACT.address}
          </p>
        </div>

        <div className="overflow-hidden px-[calc(var(--frame-inset)+22px)] pb-8 pt-14 lg:px-[calc(var(--frame-inset)+132px)]">
          <div data-wordmark>
            <Logo className="w-full" decorative />
          </div>
        </div>
      </footer>
    </section>
  );
}
