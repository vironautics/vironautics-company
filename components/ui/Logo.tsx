/**
 * Vironautics wordmark, dark-surface treatment.
 *
 * `public/logo.svg` is drawn for light backgrounds: its gradient ends in navy
 * (#021647) which is invisible on the void. The file's own alpha is used as a
 * mask and filled with the brand ramp read the other way round. Letterforms,
 * proportions and the swoosh are the original artwork; only the ink changes
 * (docs/brand-guidelines.md, "light wordmark on dark").
 *
 * The SVG viewBox (1348 x 177) is already cropped to the artwork, so the mask
 * simply fills the box.
 */
export default function Logo({
  className = "w-[150px]",
  title = "Vironautics",
  decorative = false,
}: {
  className?: string;
  title?: string;
  decorative?: boolean;
}) {
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? true : undefined}
      className={`block ${className}`}
      style={{
        aspectRatio: "1348 / 177",
        background:
          "linear-gradient(100deg, var(--vn-cyan-300) 0%, var(--vn-blue-400) 38%, var(--vn-paper) 100%)",
        maskImage: "url(/logo.svg)",
        WebkitMaskImage: "url(/logo.svg)",
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}
