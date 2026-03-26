"use client";

import { useEffect, useState } from "react";

type Instrument = {
  id: string;
  label: string;
  color: string;
  icon: string;
  role: string;
};

const instruments: Instrument[] = [
  { id: "server", label: "Server Cache", color: "var(--color-source-server)", icon: "⬡", role: "TanStack Query / SWR" },
  { id: "ui", label: "UI State", color: "var(--color-source-ui)", icon: "◈", role: "Local component state" },
  { id: "url", label: "URL Params", color: "var(--color-source-url)", icon: "⬢", role: "Search params / routing" },
  { id: "persisted", label: "Persistence", color: "var(--color-source-persisted)", icon: "◉", role: "localStorage / IndexedDB" },
];

export const OrchestraVisual = () => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [wave, setWave] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => {
        if (i >= instruments.length - 1) {
          setWave(true);
          setTimeout(() => setWave(false), 800);
          return -1;
        }
        return i + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="border-b border-border bg-surface-2/50 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-text-muted">
          Architecture
        </h2>
        <p className="mb-12 text-center text-2xl font-semibold text-text-primary">
          Four sources, one conductor
        </p>

        <div className="flex flex-col items-center gap-10">
          {/* Instruments row */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {instruments.map((inst, i) => (
              <div
                key={inst.id}
                className="flex flex-col items-center gap-3 transition-all duration-300"
                style={{
                  opacity: activeIndex === -1 || activeIndex === i ? 1 : 0.4,
                  transform: activeIndex === i ? "translateY(-4px)" : "translateY(0)",
                }}
              >
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl border text-2xl transition-all duration-300"
                  style={{
                    borderColor: activeIndex === i ? inst.color : "var(--color-border)",
                    background: activeIndex === i ? `color-mix(in srgb, ${inst.color} 10%, transparent)` : "var(--color-surface-2)",
                    boxShadow: activeIndex === i ? `0 0 24px color-mix(in srgb, ${inst.color} 20%, transparent)` : "none",
                  }}
                >
                  {inst.icon}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-text-primary">{inst.label}</div>
                  <div className="text-xs text-text-muted">{inst.role}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Connection lines */}
          <div className="flex items-center gap-3">
            {instruments.map((inst, i) => (
              <div
                key={inst.id}
                className="h-px w-16 transition-all duration-300"
                style={{
                  background: activeIndex === i
                    ? `linear-gradient(90deg, transparent, ${inst.color}, transparent)`
                    : "var(--color-border)",
                  height: activeIndex === i ? 2 : 1,
                }}
              />
            ))}
          </div>

          {/* Conductor */}
          <div
            className="flex flex-col items-center gap-2 transition-all duration-500"
            style={{
              transform: wave ? "scale(1.05)" : "scale(1)",
            }}
          >
            <div
              className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 transition-all duration-500"
              style={{
                borderColor: wave ? "var(--color-accent)" : "var(--color-border)",
                background: wave
                  ? "color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-2))"
                  : "var(--color-surface-2)",
                boxShadow: wave
                  ? "0 0 40px color-mix(in srgb, var(--color-accent) 25%, transparent)"
                  : "none",
              }}
            >
              <span className="text-3xl">🎼</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-text-primary">Conductor</div>
              <div className="text-xs text-text-muted">Symphony State</div>
            </div>
          </div>

          {/* Output */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-xs">
            <span className="text-text-muted">→</span>
            <span className="text-text-primary">deterministic, single-wave commit</span>
            <span className="text-text-muted">→</span>
            <span className="text-accent">UI</span>
          </div>
        </div>
      </div>
    </section>
  );
};
