"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/content";
import { world } from "@/lib/world";

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    setOpen(false);
    if (world.scrollTo) {
      e.preventDefault();
      world.scrollTo(href);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[var(--z-nav)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#04060c] via-[#04060c]/80 to-transparent"
      />
      <nav
        aria-label="Primary"
        className="relative mx-auto flex h-[var(--nav-height)] w-full max-w-[1600px] items-center justify-between gap-8 px-[calc(var(--frame-inset)+22px)]"
      >
        <Link href="/" aria-label="Vironautics — home" className="block shrink-0 py-3.5">
          <Logo className="w-[132px] sm:w-[156px]" />
        </Link>

        <ul className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => go(e, link.href)}
                className="vn-mono group relative inline-flex min-h-8 items-center text-muted transition-colors hover:text-foreground"
              >
                {link.label}
                <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Button href="#contact" className="hidden !min-h-11 !px-6 sm:inline-flex">
            Start a project
          </Button>
          <button
            ref={toggle}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center text-foreground shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors hover:bg-white/5 lg:hidden"
          >
            {open ? (
              <X size={20} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-0 top-[var(--nav-height)] z-[-1] overflow-y-auto bg-[#04060c]/96 px-[calc(var(--frame-inset)+22px)] pb-10 pt-8 backdrop-blur-md lg:hidden"
      >
        <ul className="flex flex-col">
          {NAV_LINKS.map((link, i) => (
            <li key={link.href} className="border-b border-line">
              <a
                href={link.href}
                onClick={(e) => go(e, link.href)}
                className="flex min-h-16 items-baseline gap-4 py-4 font-display text-[1.6rem] uppercase tracking-tight text-foreground"
              >
                <span className="vn-mono text-signal">{String(i + 1).padStart(2, "0")}</span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <Button href="#contact" onClick={() => setOpen(false)} className="mt-10 w-full justify-center">
          Start a project
        </Button>
      </div>
    </header>
  );
}
