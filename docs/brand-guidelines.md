# Vironautics — Brand Guidelines

> Source of truth for voice, messaging and visual identity.
> Synced to `design-system/vironautics/MASTER.md` and `app/globals.css`.

## 1. Positioning

**Vironautics** — Sousse, Tunisia.
A technology partner that takes a company from *signal* to *system*: demand generation,
custom software, productised SaaS, strategic consulting, and applied AI.

**One-liner:** We navigate companies through their digital atmosphere.
**Category:** Full-stack technology & growth partner.
**Proof of place:** Mediterranean engineering talent, European time zone, global delivery.

## 2. Voice Framework

| Dimension | We are | We are not |
|---|---|---|
| Tone | Precise, confident, forward-leaning | Hypey, buzzword-stacked |
| Register | Engineer explaining to a founder | Agency pitching a buzzword |
| Proof | Numbers, systems, shipped work | Adjectives |
| Rhythm | Short claim → concrete mechanism | Long abstract paragraphs |

**Lexicon (use):** navigate, trajectory, altitude, system, ship, instrument, compound.
**Lexicon (avoid):** synergy, disruptive, ninja, rockstar, game-changing, revolutionary.

Aviation/aeronautic metaphor is the brand's native language (from the name and the
swoosh in the mark) — use it for structure, never as decoration. One metaphor per section, maximum.

## 3. Messaging Framework

- **Core promise:** One partner across the whole stack — growth, product, and intelligence.
- **Pillar 1 — Marketing:** Demand that compounds, not campaigns that expire.
- **Pillar 2 — Software:** Custom systems built to be handed over, not rented back.
- **Pillar 3 — SaaS:** Our own products, shipped and operated in production.
- **Pillar 4 — Consulting:** Decisions de-risked before budget is committed.
- **Pillar 5 — AI Services:** Models in production, with evals and guardrails.
- **Pillar 6 — AI Features:** Intelligence embedded into the product you already have.

**Primary CTA:** *Start a project* — **Secondary CTA:** *Book a consultation*

## 4. Visual Identity

**Logo:** `public/logo.svg` — horizontal wordmark, gradient electric-blue → navy,
with an ascending swoosh terminating in an arrow and an orbital dot on the "A".

| Rule | Spec |
|---|---|
| Clear space | ≥ 0.5× the cap height of the wordmark on all sides |
| Minimum width | 120px digital |
| Placement | Light wordmark on dark surfaces only (never on mid-tone imagery without a scrim) |
| Never | Recolour, stretch, outline, add shadow, rotate, or crop the swoosh |

**Palette** — void black, ice, the logo's electric blue, and one signal colour.

| Role | Hex | Use |
|---|---|---|
| Void | `#04060C` | page floor |
| Ice | `#E8F0FF` | text |
| Electric blue | `#2B7FFF` | planet, atmosphere, logo ramp |
| Signal (volt) | `#D4FF3A` | CTAs, beacon, live readouts — nothing decorative |

**Typography:** Unbounded (display, wide), Geist (body), Geist Mono (HUD labels).
Full token tables and the motion contract live in
`design-system/vironautics/MASTER.md`.

**Photography:** Pexels stock, always processed through the same duotone + scanline
treatment so it reads as one art direction.

## 5. Consistency Checklist

- [ ] Logo on a dark surface (mask-filled with the brand ramp), clear space respected
- [ ] No emoji used as an icon — Lucide only, 1.5px stroke, or HUD primitives
- [ ] Body text ≥ 4.5:1 against its actual surface (measured, not assumed)
- [ ] One primary CTA per viewport
- [ ] Signal colour used only for interactive / live elements
- [ ] Motion disabled and final state rendered under `prefers-reduced-motion`
