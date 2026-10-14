# Vironautics

Homepage for Vironautics (Sousse, Tunisia): marketing, software, SaaS, consulting and AI.

The page is a single scroll-driven descent from orbit to Sousse. A fixed WebGL
planet (three.js) sits behind the DOM and the camera falls toward Tunisia as you
scroll; sections are HTML layered in front of it with multi-scale parallax (GSAP
ScrollTrigger + Lenis).

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Map

| Path | What |
|---|---|
| `app/page.tsx` | Composition. Section order = camera stage order |
| `lib/world.ts` | Shared state between scroll engine and 3D scene, `STAGES` |
| `components/world/` | `Scene` (three.js), `ScrollEngine` (Lenis + stage mapping), `WorldLoader` |
| `components/sections/` | Hero, Manifesto, Capabilities (pinned horizontal), Mission, Lab, Reach, Contact |
| `components/hud/` | Nav, HUD rails, cursor |
| `lib/content.ts` | All copy and imagery. **Placeholders are listed in its header** |
| `design-system/vironautics/MASTER.md` | Tokens, motion contract, QA record |

## Notes

- Reduced motion and no-JS render the complete static page (no `html.js-motion`).
- Adding a section? Add its id to `STAGES` in `lib/world.ts`, a `data-stage`
  attribute on its root, and a keyframe row in `components/world/Scene.tsx`
  (desktop **and** mobile arrays).
- Next.js 16: see `AGENTS.md` — read `node_modules/next/dist/docs/` before changing framework APIs.
