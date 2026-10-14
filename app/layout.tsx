import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vironautics.com"),
  title: {
    default: "Vironautics — Marketing, Software, SaaS, Consulting & AI",
    template: "%s · Vironautics",
  },
  description:
    "Vironautics is a technology and growth partner in Sousse, Tunisia: growth marketing, custom software, SaaS products, consulting and applied AI, shipped to production.",
  keywords: [
    "Vironautics",
    "software development Tunisia",
    "AI services",
    "SaaS products",
    "digital marketing Sousse",
    "technology consulting",
  ],
  openGraph: {
    type: "website",
    siteName: "Vironautics",
    title: "Vironautics — We navigate digital atmospheres",
    description:
      "Growth marketing, custom software, SaaS, consulting and AI from one crew in Sousse, Tunisia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vironautics",
    description:
      "Growth marketing, custom software, SaaS, consulting and AI from Sousse, Tunisia.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#04060c",
  colorScheme: "dark",
};

/**
 * Runs before first paint.
 *  - js-loading: shows the loader and locks scroll. Only ever added by JS, so a
 *    no-JS visit never sees a loader it could not dismiss. A 20s failsafe
 *    removes it even if hydration dies.
 *  - scroll restoration is manual and any #hash is stripped, so the page always
 *    opens at the top.
 *  - js-motion: opts into the animated variants unless reduced motion is
 *    requested, so a no-JS or reduced-motion visit sees the complete page.
 */
const MOTION_GATE = `(function(){var d=document.documentElement;try{history.scrollRestoration='manual';if(location.hash){history.replaceState(null,'',location.pathname+location.search)}window.scrollTo(0,0)}catch(e){}d.classList.add('js-loading');setTimeout(function(){d.classList.remove('js-loading')},20000);if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js-motion')}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the MOTION_GATE script adds a class to <html>
    // before React hydrates, by design. Only this one element is exempt.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${unbounded.variable} ${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_GATE }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
