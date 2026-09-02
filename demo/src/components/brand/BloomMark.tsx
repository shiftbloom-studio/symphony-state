import type { SVGProps } from "react";

type BloomMarkProps = Omit<SVGProps<SVGSVGElement>, "title"> & {
  idPrefix?: string;
  title?: string;
};

type Ring = {
  petals: number;
  length: number;
  width: number;
  fill: "outer" | "middle" | "inner" | "heart";
  offset: number;
};

const rings: Ring[] = [
  { petals: 10, length: 88, width: 36, fill: "outer", offset: 0 },
  { petals: 10, length: 68, width: 31, fill: "middle", offset: 18 },
  { petals: 8, length: 48, width: 25, fill: "inner", offset: 0 },
  { petals: 6, length: 27, width: 17, fill: "heart", offset: 0 },
];

const petalPath = (length: number, width: number) => {
  const tipY = 100 - length;
  const shoulderY = 100 - length * 0.58;
  const halfWidth = width / 2;

  return [
    "M 100 100",
    `C ${100 - halfWidth * 0.9} ${100 - length * 0.24}, ${100 - halfWidth} ${shoulderY}, 100 ${tipY}`,
    `C ${100 + halfWidth} ${shoulderY}, ${100 + halfWidth * 0.9} ${100 - length * 0.24}, 100 100`,
    "Z",
  ].join(" ");
};

export const BloomMark = ({
  className,
  idPrefix = "bloom",
  title,
  ...props
}: BloomMarkProps) => {
  const decorative = !title;
  const gradientIds = {
    outer: `${idPrefix}-outer`,
    middle: `${idPrefix}-middle`,
    inner: `${idPrefix}-inner`,
    heart: `${idPrefix}-heart`,
  };

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden={decorative ? true : undefined}
      aria-label={title}
      role={decorative ? undefined : "img"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={gradientIds.outer} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#C81040" />
          <stop offset="54%" stopColor="#FF2E52" />
          <stop offset="100%" stopColor="#FF8FAB" />
        </linearGradient>
        <linearGradient id={gradientIds.middle} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FF2E52" />
          <stop offset="100%" stopColor="#FF8FAB" />
        </linearGradient>
        <linearGradient id={gradientIds.inner} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FF7E9E" />
          <stop offset="100%" stopColor="#FFC2D3" />
        </linearGradient>
        <linearGradient id={gradientIds.heart} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FFB4CA" />
          <stop offset="100%" stopColor="#FFDCE7" />
        </linearGradient>
      </defs>

      {rings.map((ring, ringIndex) => (
        <g key={`${ring.petals}-${ring.length}`} opacity={ringIndex === 0 ? 0.92 : 0.9}>
          {Array.from({ length: ring.petals }, (_, petalIndex) => (
            <path
              key={petalIndex}
              d={petalPath(ring.length, ring.width)}
              fill={`url(#${gradientIds[ring.fill]})`}
              transform={`rotate(${ring.offset + (360 / ring.petals) * petalIndex} 100 100)`}
            />
          ))}
        </g>
      ))}

      <circle cx="100" cy="100" r="7" fill="#FF2E52" />
    </svg>
  );
};
