"use client";

import dynamic from "next/dynamic";

/**
 * three.js is ~700 kB. It loads in its own chunk, after the page is already
 * readable, and never on the server (there is no WebGL there).
 */
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function WorldLoader() {
  return (
    <div
      className="vn-world pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    >
      <Scene />
    </div>
  );
}
