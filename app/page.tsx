import Cursor from "@/components/hud/Cursor";
import Hud from "@/components/hud/Hud";
import SiteNav from "@/components/hud/SiteNav";
import Capabilities from "@/components/sections/Capabilities";
import Contact from "@/components/sections/Contact";
import Hero from "@/components/sections/Hero";
import Lab from "@/components/sections/Lab";
import Projects from "@/components/sections/Projects";
import Manifesto from "@/components/sections/Manifesto";
import Mission from "@/components/sections/Mission";
import Reach from "@/components/sections/Reach";
import Loader from "@/components/world/Loader";
import ScrollEngine from "@/components/world/ScrollEngine";
import WorldLoader from "@/components/world/WorldLoader";

/**
 * One continuous descent. A fixed WebGL planet sits behind everything and the
 * camera falls toward Sousse as you scroll (lib/world.ts STAGES, one per
 * section below). Every section is real HTML, so the page is fully readable
 * before — and without — the 3D layer.
 */
export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <Loader />
      <WorldLoader />
      <ScrollEngine />
      <SiteNav />

      <main id="main" className="relative z-[var(--z-content)]">
        <Hero />
        <Projects />
        <Manifesto />
        <Capabilities />
        <Mission />
        <Lab />
        <Reach />
        <Contact />
      </main>

      {/* Fixed-position overlays live after <main> so keyboard order follows the
          visual one: nav, then content, then the section rail. */}
      <Hud />
      <Cursor />
    </>
  );
}
