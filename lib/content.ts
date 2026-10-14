/**
 * Copy and imagery for the Vironautics homepage.
 *
 * Voice (docs/brand-guidelines.md): a claim, then the mechanism. No buzzwords.
 *
 * PLACEHOLDERS — replace before launch: every figure in REACH.stats, the
 * product names/metrics in LAB.products, and the contact email are
 * illustrative, not real company data.
 *
 * Photography is Pexels (free licence, no attribution required); every id was
 * resolved against the CDN. All images get the same duotone + scanline
 * treatment in CSS so stock photography reads as one art direction.
 */

export function pexels(id: number, width = 1600): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=${width}`;
}

export const NAV_LINKS = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#mission", label: "Method" },
  { href: "#lab", label: "AI & Products" },
  { href: "#reach", label: "Reach" },
] as const;

export const HUD_STAGES = [
  "Orbit",
  "Brief",
  "Capabilities",
  "Method",
  "AI Lab",
  "Reach",
  "Landing",
] as const;

export const HERO = {
  eyebrow: "Vironautics / Sousse, Tunisia",
  lines: ["We navigate", "digital", "atmospheres."] as const,
  body: "Growth, software and applied AI from one crew in Sousse — built to ship, run in production, and compound.",
  disciplines: ["Marketing", "Software", "SaaS", "Consulting", "AI"],
  primary: { href: "#contact", label: "Start a project" },
  secondary: { href: "#capabilities", label: "See capabilities" },
} as const;

export const MANIFESTO = {
  text: "Most companies hire an agency, a dev shop, an AI lab and a consultancy, then become the translator between them. We are all four. One crew, one plan, one team accountable from the first signal to the live system.",
  figures: [
    {
      id: "a",
      src: pexels(8640331, 900),
      alt: "Glowing blue optical fibres in the dark",
      caption: "FIG.A / SIGNAL",
    },
    {
      id: "b",
      src: pexels(12537427, 900),
      alt: "Abstract blue circuit board pattern",
      caption: "FIG.B / SYSTEM",
    },
    {
      id: "c",
      src: pexels(29735851, 900),
      alt: "Curved blue light tunnel",
      caption: "FIG.C / PATH",
    },
    {
      id: "d",
      src: pexels(14314638, 900),
      alt: "Digital spheres connected by glowing lines",
      caption: "FIG.D / NETWORK",
    },
  ],
} as const;

export type Service = {
  id: string;
  index: string;
  title: string;
  claim: string;
  body: string;
  bullets: readonly string[];
  image: { src: string; alt: string; caption: string };
};

export const SERVICES: readonly Service[] = [
  {
    id: "marketing",
    index: "01",
    title: "Growth Marketing",
    claim: "Demand that compounds.",
    body: "Positioning, performance and content on a single measurement spine, so every euro spent teaches the next one where to go.",
    bullets: ["Brand & positioning", "Paid acquisition", "SEO & content", "Lifecycle automation"],
    image: {
      src: pexels(7698796, 1400),
      alt: "A team reviewing performance charts together",
      caption: "SIGNAL / ACQUISITION",
    },
  },
  {
    id: "software",
    index: "02",
    title: "Custom Software",
    claim: "Built to be handed over.",
    body: "Platforms, internal tools and integrations — documented, tested, and yours on day one. No lock-in, no mystery.",
    bullets: ["Web & mobile platforms", "APIs & integrations", "Cloud architecture", "Legacy modernisation"],
    image: {
      src: pexels(34212916, 1400),
      alt: "Colourful code on developer monitors",
      caption: "BUILD / PLATFORM",
    },
  },
  {
    id: "saas",
    index: "03",
    title: "SaaS Products",
    claim: "We run what we build.",
    body: "Our own products live in production under real customer load — which is why our delivery estimates and architecture opinions hold up.",
    bullets: ["Product strategy", "Multi-tenant architecture", "Billing & entitlements", "Operate & scale"],
    image: {
      src: pexels(17323801, 1400),
      alt: "A server room lit in blue",
      caption: "OPERATE / INFRASTRUCTURE",
    },
  },
  {
    id: "consulting",
    index: "04",
    title: "Consulting",
    claim: "Decisions, de-risked.",
    body: "Audits, architecture reviews and roadmaps that end in a decision you can defend to a board — before budget is committed.",
    bullets: ["Technical due diligence", "Architecture review", "Team & process design", "Digital roadmap"],
    image: {
      src: pexels(36765719, 1400),
      alt: "Professionals discussing strategy in a modern office",
      caption: "ADVISE / STRATEGY",
    },
  },
  {
    id: "ai-services",
    index: "05",
    title: "AI Services",
    claim: "Models in production.",
    body: "Retrieval, agents and fine-tuning — shipped with the evaluation harness and guardrails that keep them honest after launch day.",
    bullets: ["RAG & knowledge systems", "Agentic workflows", "Evaluation & red-teaming", "MLOps & monitoring"],
    image: {
      src: pexels(8386440, 1400),
      alt: "A robotic hand reaching into a glowing blue network",
      caption: "THINK / INTELLIGENCE",
    },
  },
  {
    id: "ai-features",
    index: "06",
    title: "AI Features",
    claim: "Intelligence, embedded.",
    body: "Assistants, semantic search, summarisation and automation — inside the product you already run, behind your existing auth.",
    bullets: ["In-product copilots", "Semantic search", "Document intelligence", "Workflow automation"],
    image: {
      src: pexels(8108728, 1400),
      alt: "A motherboard with neon-lit circuit traces",
      caption: "EMBED / FEATURES",
    },
  },
] as const;

export const MISSION = {
  title: "Four stages. No theatre.",
  steps: [
    {
      index: "01",
      name: "Chart",
      when: "Week 0",
      body: "We map the terrain before touching code: the commercial goal, the constraints, the systems already in place, and the one metric the work must move.",
      output: "Scoped brief + success metric",
    },
    {
      index: "02",
      name: "Design",
      when: "Week 1",
      body: "Architecture and interface designed as one. You see real screens and the real data model before the build is approved.",
      output: "Prototype, architecture, fixed estimate",
    },
    {
      index: "03",
      name: "Build",
      when: "Weeks 2 – N",
      body: "Two-week increments against a visible board. Every increment is deployed, tested and demoed. There is no invisible progress.",
      output: "A shipping increment every 2 weeks",
    },
    {
      index: "04",
      name: "Compound",
      when: "Ongoing",
      body: "We instrument, measure and keep improving. Handover includes the dashboards and the documentation — not just the repository.",
      output: "Instrumentation, docs, ownership",
    },
  ],
} as const;

export const LAB = {
  eyebrow: "AI & Products",
  title: "Intelligence you can ship. Products we run.",
  products: [
    {
      name: "Orbit",
      kind: "Operations suite",
      body: "Projects, resourcing and billing for service companies — one timeline from signed proposal to paid invoice.",
    },
    {
      name: "Beacon",
      kind: "Marketing intelligence",
      body: "Ad, CRM and product data unified into one attribution model, so spend decisions stop being argued from screenshots.",
    },
    {
      name: "Copilot Core",
      kind: "AI enablement",
      body: "The retrieval, evaluation and guardrail layer we drop into products to take an AI feature from demo to production.",
    },
  ],
  terminal: {
    title: "copilot-core // eval stream",
    lines: [
      "$ copilot-core eval --suite support-agent --against v6",
      "› loading 1,240 test cases ............ done",
      "› retrieval@5 ......................... 0.94",
      "› hallucination rate .................. 0.8%",
      "› guardrail violations ................ 0",
      "› regression vs v6 .................... +3.1%",
      "✓ gate passed — promoting v7 to production",
    ],
    caption: "Sample output · illustrative",
  },
  image: {
    src: pexels(17194838, 1400),
    alt: "Fibre-optic strands glowing blue in the dark",
  },
} as const;

export const REACH = {
  eyebrow: "Reach",
  title: "Built in Sousse. Deployed everywhere.",
  image: {
    src: pexels(8640331, 1920),
    alt: "Neon blue optical fibres streaming through darkness",
  },
  stats: [
    { value: 40, suffix: "+", label: "Products in production" },
    { value: 9, suffix: "", label: "Countries served" },
    { value: 14, suffix: "d", label: "Median time to first deploy" },
    { value: 96, suffix: "%", label: "Client retention past year one" },
  ],
  marquee: [
    "Sousse — Tunisia — 35.82°N 10.61°E —",
    "Europe — The Gulf — North Africa — The world —",
  ],
} as const;

export const CONTACT = {
  eyebrow: "Touchdown / Sousse, Tunisia",
  title: "Bring us the hard problem.",
  body: "Tell us the outcome you need. You get a scoped proposal with a fixed first milestone within 48 hours — no discovery invoice attached.",
  email: "hello@vironautics.com",
  address: "Sousse, Tunisia",
  coords: "35.8256° N, 10.6084° E",
  timezone: "Africa/Tunis",
} as const;
