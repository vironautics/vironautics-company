"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { world } from "@/lib/world";

type Props = {
  variant?: "primary" | "ghost";
  children: ReactNode;
} & Omit<ComponentProps<"a">, "children">;

/**
 * Angular-cut call to action. In-page hashes go through the smooth scroller so
 * the camera dive stays in step with the scroll; everything else is a plain link.
 */
export default function Button({
  variant = "primary",
  children,
  className = "",
  href = "#",
  onClick,
  ...props
}: Props) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (href.startsWith("#") && world.scrollTo) {
      e.preventDefault();
      world.scrollTo(href);
    }
  };

  return (
    <a
      href={href}
      onClick={handle}
      className={`vn-btn ${variant === "ghost" ? "vn-btn--ghost" : ""} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
