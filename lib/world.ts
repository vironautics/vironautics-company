/**
 * Shared, mutable state between the scroll engine (DOM) and the WebGL scene.
 *
 * Deliberately NOT React state: both sides read it every animation frame, and
 * routing 60 updates a second through React would re-render for nothing.
 */

export const STAGES = [
  "hero",
  "manifesto",
  "capabilities",
  "mission",
  "lab",
  "reach",
  "contact",
] as const;

export type StageId = (typeof STAGES)[number];

export type WorldState = {
  /** Continuous stage index, 0 (hero) … STAGES.length - 1 (contact). */
  stage: number;
  /** Page scroll progress, 0 … 1. */
  progress: number;
  /** Smoothed scroll velocity, roughly -1 … 1. */
  velocity: number;
  /** Pointer position, -1 … 1 on each axis. */
  mouseX: number;
  mouseY: number;
  /** Hero entrance, 0 … 1. */
  intro: number;
  reduced: boolean;
  webgl: boolean;
  /** 3D scene has its land dots and has rendered a frame (or WebGL is unavailable). */
  ready: boolean;
  /** Loader has finished and the page may start its entrance. */
  loaded: boolean;
  /** Set by ScrollEngine so nav / HUD can scroll with the smooth scroller. */
  scrollTo: ((target: string | number) => void) | null;
};

export const world: WorldState = {
  stage: 0,
  progress: 0,
  velocity: 0,
  mouseX: 0,
  mouseY: 0,
  intro: 0,
  reduced: false,
  webgl: true,
  ready: false,
  loaded: false,
  scrollTo: null,
};

/** Sousse, Tunisia — where the camera lands. */
export const SOUSSE = { lat: 35.8256, lon: 10.6084 } as const;
