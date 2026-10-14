# Vironautics — Design System (MASTER) · "Descent"

Global source of truth. Supersedes the first iteration (navy glass cards + subtle
parallax), which was rejected as generic. Tokens live in `app/globals.css`.

## 0. Concept

**The page is one continuous descent from orbit to Sousse.** A fixed WebGL planet
sits behind every section; the camera falls toward Tunisia as you scroll. The DOM
is a mission-control HUD layered on top. The name (*Vironautics*) is the idea.

| Stage | Section | Camera | Planet |
|---|---|---|---|
| 0 | Hero | d=8, orbit, planet right | full brightness, scan band, arcs |
| 1 | Brief (manifesto) | d=6.4, planet left | dimmed 28% |
| 2 | Capabilities (pinned, horizontal) | d=5.4, planet as a horizon below | dimmed 45% |
| 3 | Method | d=4.1 | dimmed 70% |
| 4 | AI Lab | d=3.7 | dimmed 76% |
| 5 | Reach | d=4.3, arcs at full strength | dimmed 50% |
| 6 | Landing (contact) | d=3.35 over Sousse | dimmed 30% |

HUD altitude is theatre, not data: `408 km · (1 − progress)^2.4`, reaching 0 m at
touchdown.

## 1. What changed from the first pass, and why

| Before | Now | Reason |
|---|---|---|
| Navy gradient + glass cards + icon tiles | Void black, HUD frames, angular cuts, mono labels | The card grid with an icon tile is the single most recognisable template tell |
| Gradient-filled headings | Solid ice type; one hollow word per section | Gradient text read as generic "AI SaaS" |
| Stock people under a blue scrim | One duotone + scanline treatment for every photo | Stock reads as art direction only when it is processed identically |
| Parallax `0.04–0.16` on blurred blobs | Depth parallax at 4 scales (see §5) | The generator's "subtle parallax" rule was applied to decorative blobs, making it invisible; the brief asked for visible parallax |
| Blue primary CTA | Volt signal CTA | One hot colour owns "interactive / live" |

Generator output (`ui-ux-pro-max --design-system`) returned *Brutalism* and was
overridden; the typography pairing was replaced (see §3).

## 2. Tokens (three layers)

**Primitive** — raw values, never used in components:
`--vn-void #04060C` · `--vn-ink-900 #070B14` · `--vn-ice #E8F0FF` ·
`--vn-slate-300 #A9B8D6` · `--vn-slate-400 #8496B6` · `--vn-blue-500 #2B7FFF` ·
`--vn-blue-300 #6FB0FF` · `--vn-blue-200 #9CCBFF` · `--vn-signal #D4FF3A` ·
`--vn-signal-ink #0B1100`

**Semantic** — purpose: `--color-background`, `--color-foreground`,
`--color-muted-foreground`, `--color-subtle-foreground`, `--color-signal`,
`--color-on-signal`, `--color-line`, `--color-line-strong`, `--color-panel`,
`--color-ring`.

**Component** — `--btn-bg/--btn-fg`, `--nav-height`, `--frame-inset`,
`--panel-blur`.

Signal (`#D4FF3A`) is the **only** warm colour: CTAs, the Sousse beacon, live
readouts, the active HUD stage, section numbers. Do not use it for decoration.

### Contrast (measured, not assumed)

Text sits over a live WebGL canvas, so a DOM-only audit is meaningless. The check
used for this build screenshots the page with all text hidden, samples the
brightest 5% of pixels under each text box, and compares against the real text
colour. Result across 9 scroll positions at 1440×900: all body text ≥ 4.5:1 at
rest. Residual sub-4.5 readings occur only while copy is mid-transit through the
edge fade (it is fading out by design).

| Pair | Ratio |
|---|---|
| Ice on void | 17.7:1 |
| Slate-300 on void | 10.1:1 |
| Slate-400 on void | 6.8:1 |
| Signal-ink on signal (buttons) | 16.6:1 |
| Signal on void | 17.5:1 |

## 3. Typography

| Role | Family | Notes |
|---|---|---|
| Display | **Unbounded** 500 | Very wide: ≈0.82 em per capital. Longest word must fit `viewport − 72px`; display sizes drop to `7–8vw` below 640px |
| Body | **Geist** 400 | 16–18px, line-height 1.6–1.7 |
| HUD / labels | **Geist Mono** | 11px, `0.14em` tracking, uppercase |

**Hollow type:** variable fonts have overlapping contours, so a plain
`-webkit-text-stroke` draws seams inside the letters. `.vn-outline` paints the
stroke *under* an opaque void fill (`paint-order: stroke fill`) to hide them —
use it only over the void. Over imagery or the planet use `.vn-ghost` (a vertical
fade), never a stroke.

## 4. Surfaces & HUD primitives

- `.vn-brackets` — four corner ticks on any box (`--c` colour, `--s` length).
- `.vn-frame` — fixed viewport frame in signal.
- `.vn-duo` — photographs: `grayscale → sepia → hue-rotate(178deg) → saturate` onto
  one blue ramp, plus scanlines and a vignette. Applied to **every** photo.
- `.vn-btn` — clip-path angular cut; `--ghost` variant for secondary actions.
- Panels over the planet: `rgba(7,11,20,.62)` + `blur(14px)` + brackets.

> **Layering rule.** All custom component classes are in `@layer components`.
> Unlayered CSS beats Tailwind's layered utilities, which silently turned
> `absolute` into `relative` on figures during development. State selectors
> (`html.js-motion …`) stay unlayered on purpose.

## 5. Motion contract

The rule is **depth through disagreement**: layers move at different speeds, so
the gaps between them read as distance. Four scales are in use:

| Scale | Mechanism | Example |
|---|---|---|
| World | WebGL camera keyed to scroll (damped, ~5.5/s) | Planet dive, dust fly-by |
| Section | GSAP `scrub` | Manifesto figures cross at 4 speeds + tilts; Mission numerals drift ±38% |
| Container | `containerAnimation` inside the pinned track | Capabilities: frame moves one way, photo the other, numeral faster, copy slightly |
| Pointer | `quickTo` | Hero reticle (+14) and routes panel (−22) |

Rules that stay non-negotiable:

- **One pinned section** (Capabilities, desktop only). Mobile stacks.
- Transforms/opacity only; no layout properties are animated.
- One Lenis loop, driven by GSAP's ticker; ScrollTrigger synced on every scroll.
- **Reduced motion / no JS:** the document never gains `html.js-motion`, so
  nothing is hidden, Capabilities stacks, the Manifesto collapses to one screen,
  and the WebGL scene renders one static hero frame. Verified in-browser.
- Body copy never parallaxes relative to its own container (only whole blocks drift).
- Content fades out beneath the HUD rails (mask on a non-moving wrapper) instead
  of running underneath them.

## 5b. Loader

Boot screen (`components/world/Loader.tsx`). Server-rendered but hidden unless the
pre-paint script adds `html.js-loading`, so a no-JS visit never sees a loader it
cannot dismiss. While loading, scroll is locked.

It waits for **all** of: web fonts, window `load`, the logo, every `<img>` (lazy
ones are forced eager so nothing pops in during the pinned scroll), and the 3D
scene's land dots plus one painted frame (`world.ready`).

Then, in order: pin scroll to 0 → `ScrollTrigger.refresh()` → unlock → lift the
loader → release the hero entrance (`vn:ready`). Scroll restoration is forced to
`manual` and any `#hash` is stripped before first paint, so the page always opens
at the top, including on reload while scrolled.

Bounds: shown ≥ 1.1 s (no flash), ≤ 15 s (a stalled asset cannot trap the
visitor), with a 20 s CSS-level failsafe in the pre-paint script.

## 6. WebGL budget

34k land points (120k Fibonacci samples against `public/textures/earth-water.png`),
3 star layers (3.4k), 1.4k dust, 12 arcs, 3 satellites. DPR capped at 2 (1.5 on
phones). `three` loads as its own deferred chunk (~540 kB raw) and is absent from
the prerendered HTML. If WebGL is unavailable the page adds `html.no-webgl` and a
CSS gradient stands in.

## 7. Anti-patterns (enforced)

- Gradient-filled text; icon-in-rounded-square tiles; emoji icons.
- Unlayered CSS for component classes (see §4).
- `text-stroke` on variable-font display type over imagery.
- Pure-DOM contrast audits over the canvas.
- Parallax on controls; more than one pin; animating layout properties.
- Opaque section backdrops that slice the planet (feather top and bottom).

## 8. Pre-delivery checklist

- [x] 375 / 768 / 1024 / 1440: no horizontal page overflow
- [x] Body text ≥ 4.5:1 at rest over the live canvas (pixel-measured)
- [x] Reduced motion and no-JS render the full static page
- [x] One `h1`, no skipped heading levels, no unnamed controls, no image without alt
- [x] Focus visible on all controls; DOM order = visual order
- [x] Interactive targets ≥ 24px (logo link given vertical padding)
- [x] `three.js` deferred; page paints before the 3D layer loads
- [ ] **Replace placeholders before launch** (see `lib/content.ts` header)
- [ ] Self-host the Pexels photos instead of hot-linking
- [ ] Measure frame rate on a real mid-range phone (headless software GL cannot)
