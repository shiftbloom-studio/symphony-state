// SPDX-License-Identifier: AGPL-3.0-or-later
import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Symphony State, a React library for orchestrating state sources";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SOURCES = ["TanStack Query", "Zustand", "Redux", "URL params", "localStorage"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#FFFFFF",
          color: "#1A1216",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#C81040" }}>
          SYMPHONY STATE / OPEN SOURCE
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700, lineHeight: 1, letterSpacing: -3 }}>
            Every state source,
          </div>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3, color: "#FF2E52" }}>
            in concert.
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {SOURCES.map((source) => (
            <div
              key={source}
              style={{ display: "flex", padding: "10px 20px", borderRadius: 999, background: "#FFE9EF", fontSize: 26 }}
            >
              {source}
            </div>
          ))}
          <div style={{ display: "flex", padding: "10px 0 10px 12px", fontSize: 26, color: "#1A1216", opacity: 0.6 }}>
            npm i @shiftbloom-studio/symphony-state
          </div>
        </div>
      </div>
    ),
    size,
  );
}
