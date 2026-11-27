import type { SVGProps } from "react";

type BloomMarkProps = Omit<SVGProps<SVGSVGElement>, "title"> & {
  idPrefix?: string;
  title?: string;
  /** Flat Bloom Red, for sizes below 32px. */
  solid?: boolean;
};

// The shiftbloom bloom, exactly as shiftbloom.studio draws it (brand book v2,
// "The Mark"): four interleaved petal rings (10 · 10 · 8 · 6) plus the seed.
export const rings = [
  { r: 100, petals: 10, w: 32, l: 90, root: "#D8163F", tip: "#FF2E52", offset: 0 },
  { r: 74, petals: 10, w: 25.16, l: 66.6, root: "#FF2E52", tip: "#FF7E9E", offset: 18 },
  { r: 50, petals: 8, w: 19, l: 45, root: "#FF7E9E", tip: "#FFC2D3", offset: 40.5 },
  { r: 27, petals: 6, w: 12.96, l: 24.3, root: "#FFB4CA", tip: "#FFDCE7", offset: 70.5 },
];

const n = (v: number) => Number(v.toFixed(2));
const petalPath = (w: number, l: number) =>
  `M 0,0 C ${w},0 ${w},${-n(0.55 * l)} 0,${-l} C ${-w},${-n(0.55 * l)} ${-w},0 0,0 Z`;

/** The gradient bloom as a standalone SVG string, for places that need markup (e.g. OG images). */
export const bloomSvgString = (idPrefix = "sb-bloom-ring") => {
  const defs = rings
    .map(
      (ring) =>
        `<linearGradient id="${idPrefix}-${ring.r}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${-ring.l}"><stop offset="0%" stop-color="${ring.root}"/><stop offset="100%" stop-color="${ring.tip}"/></linearGradient>`,
    )
    .join("");
  const petals = rings
    .flatMap((ring) =>
      Array.from({ length: ring.petals }, (_, p) => {
        const angle = n(ring.offset + (360 / ring.petals) * p);
        return `<path d="${petalPath(ring.w, ring.l)}" fill="url(#${idPrefix}-${ring.r})" transform="translate(100 100) rotate(${angle}) translate(0 ${-n(ring.r - ring.l)})"/>`;
      }),
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs>${defs}</defs>${petals}<circle cx="100" cy="100" r="7" fill="#FF2E52"/></svg>`;
};

export const BloomMark = ({
  className,
  idPrefix = "sb-bloom-ring",
  title,
  solid = false,
  ...props
}: BloomMarkProps) => {
  const decorative = !title;

  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={decorative ? true : undefined}
      aria-label={title}
      role={decorative ? undefined : "img"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {solid ? null : (
        <defs>
          {rings.map((ring) => (
            <linearGradient
              key={ring.r}
              id={`${idPrefix}-${ring.r}`}
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={0}
              x2={0}
              y2={-ring.l}
            >
              <stop offset="0%" stopColor={ring.root} />
              <stop offset="100%" stopColor={ring.tip} />
            </linearGradient>
          ))}
        </defs>
      )}

      {rings.map((ring) =>
        Array.from({ length: ring.petals }, (_, p) => {
          const angle = n(ring.offset + (360 / ring.petals) * p);
          return (
            <path
              key={`${ring.r}-${angle}`}
              d={petalPath(ring.w, ring.l)}
              fill={solid ? "#FF2E52" : `url(#${idPrefix}-${ring.r})`}
              transform={`translate(100 100) rotate(${angle}) translate(0 ${-n(ring.r - ring.l)})`}
            />
          );
        }),
      )}

      <circle cx="100" cy="100" r="7" fill="#FF2E52" />
    </svg>
  );
};
