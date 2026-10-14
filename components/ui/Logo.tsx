/**
 * Vironautics wordmark, dark-surface treatment, tightly cropped.
 *
 * The supplied `public/logo.png` is drawn for light backgrounds: its gradient
 * ends in navy (#001449) which is invisible on the void. The file's own alpha
 * channel is used as a mask and filled with the brand ramp read the other way
 * round. Letterforms, proportions and the swoosh are the original artwork;
 * only the ink changes (docs/brand-guidelines.md, "light wordmark on dark").
 *
 * The PNG carries a lot of transparent padding. Its measured alpha bounding box
 * is 595 x 77 px at offset (56, 131) inside a 707 x 353 canvas, so the box is
 * cropped to that rectangle: the mask is scaled to 707/595 of the box width and
 * positioned so (56, 131) lands on the top-left corner. That makes the mark
 * size predictably, from a 150px nav lockup to a full-bleed footer monument.
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
        aspectRatio: "595 / 77",
        background:
          "linear-gradient(100deg, var(--vn-cyan-300) 0%, var(--vn-blue-400) 38%, var(--vn-paper) 100%)",
        maskImage: "url(/logo.png)",
        WebkitMaskImage: "url(/logo.png)",
        maskSize: "118.82% auto",
        WebkitMaskSize: "118.82% auto",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "50% 47.46%",
        WebkitMaskPosition: "50% 47.46%",
      }}
    />
  );
}
