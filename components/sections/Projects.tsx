import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { PROJECTS } from "@/lib/content";

/**
 * Our live products, each with a screenshot of the real site. Sits between the
 * hero and the brief. Screenshots are shown in full colour (no duotone) so the
 * products read as themselves. Static markup: no scroll animation to maintain.
 */
export default function Projects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="relative px-[calc(var(--frame-inset)+22px)] py-[14vh] lg:px-[calc(var(--frame-inset)+132px)]"
    >
      <div className="mx-auto max-w-[1400px]">
        <p className="vn-mono flex items-center gap-4 text-signal">
          <span className="h-px w-10 bg-signal" aria-hidden="true" />
          01 / {PROJECTS.eyebrow}
        </p>
        <h2
          id="projects-title"
          className="vn-display mt-6 text-[clamp(1.6rem,7vw,2.4rem)] text-foreground sm:text-[clamp(2rem,4.4vw,4.4rem)]"
        >
          {PROJECTS.title}
        </h2>

        <ul className="mt-14 grid gap-10 md:grid-cols-2">
          {PROJECTS.items.map((p, i) => (
            <li key={p.name}>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="vn-brackets vn-brackets--signal relative aspect-[16/10] w-full overflow-hidden bg-[var(--color-panel)]">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.alt}
                      fill
                      loading="lazy"
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover object-top transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="vn-display text-[clamp(2rem,5vw,4rem)] text-subtle">
                        {p.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-5 flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="vn-mono mb-2 text-muted">
                      0{i + 1} / {p.kind}
                    </p>
                    <h3 className="vn-display text-[clamp(1.4rem,2.2vw,2.2rem)] text-foreground transition-colors duration-[var(--dur-base)] group-hover:text-signal">
                      {p.name}
                    </h3>
                    <p className="mt-3 max-w-[48ch] text-[0.95rem] leading-[1.6] text-muted">
                      {p.body}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={26}
                    strokeWidth={1.25}
                    aria-hidden="true"
                    className="shrink-0 text-subtle transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-signal"
                  />
                </div>
              </a>
            </li>
          ))}
        </ul>

        <div className="vn-brackets mt-16 flex flex-col gap-6 border border-line p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="vn-display text-[clamp(1.3rem,2vw,2rem)] text-foreground">
              {PROJECTS.email.title}
            </h3>
            <p className="mt-2 max-w-[56ch] text-[0.95rem] leading-[1.6] text-muted">
              {PROJECTS.email.body}
            </p>
          </div>
          <Button href="#contact" className="shrink-0">
            Get your email
          </Button>
        </div>
      </div>
    </section>
  );
}
