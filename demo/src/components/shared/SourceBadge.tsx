"use client";

import type { SourceType } from "@/lib/types";

const labels: Record<SourceType, string> = {
  server: "server",
  ui: "ui",
  url: "url",
  persisted: "persisted",
  optimistic: "optimistic",
  derived: "derived",
};

const icons: Record<SourceType, string> = {
  server: "⬡",
  ui: "◈",
  url: "⬢",
  persisted: "◉",
  optimistic: "◇",
  derived: "△",
};

export const SourceBadge = ({
  source,
  size = "sm",
}: {
  source: SourceType;
  size?: "xs" | "sm" | "md";
}) => {
  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 gap-0.5",
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
  };

  return (
    <span
      className={`badge-${source} inline-flex items-center rounded-full border font-mono font-medium ${sizeClasses[size]}`}
    >
      <span>{icons[source]}</span>
      <span>{labels[source]}</span>
    </span>
  );
};
