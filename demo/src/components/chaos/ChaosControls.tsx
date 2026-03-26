"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Conductor } from "@shiftbloom-studio/symphony-state";
import type { ChaosConfig } from "@/lib/types";
import { simulateServerFetch } from "@/lib/symphony-setup";

export const ChaosControls = ({ conductor }: { conductor: Conductor }) => {
  const getSnapshot = useCallback(
    () => conductor.getSectionValue<ChaosConfig>("chaos"),
    [conductor]
  );
  const subscribe = useCallback(
    (cb: () => void) => conductor.subscribe("chaos", cb),
    [conductor]
  );
  const chaos = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const update = (partial: Partial<ChaosConfig>) => {
    conductor.transaction(() => {
      conductor.getSection<ChaosConfig>("chaos").patch(partial);
    }, "chaos-config-change");
  };

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-xs font-semibold text-text-primary">
            Simulate Problems
          </h3>
          <p className="text-[10px] text-text-muted mt-0.5">
            Real users deal with slow networks and conflicting data. Try it.
          </p>
        </div>
        <button
          onClick={() => simulateServerFetch(conductor)}
          className="rounded-md bg-source-server/10 px-2.5 py-1 text-[11px] font-medium text-source-server hover:bg-source-server/20"
        >
          Reload Data
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Network delay */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-text-primary">Slow Network</label>
            <span className="font-mono text-[11px] text-text-secondary">
              {chaos.networkDelay === 0 ? "Off" : `${chaos.networkDelay / 1000}s delay`}
            </span>
          </div>
          <p className="text-[10px] text-text-muted mb-2">
            Adds a delay before the server responds. Makes optimistic updates visible.
          </p>
          <input
            type="range"
            min={0}
            max={5000}
            step={500}
            value={chaos.networkDelay}
            onChange={(e) => update({ networkDelay: Number(e.target.value) })}
            className="w-full accent-accent"
          />
        </div>

        {/* Server conflicts */}
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-3">
            <label className="text-xs font-medium text-text-primary">Server Conflicts</label>
            <p className="text-[10px] text-text-muted mt-0.5">
              After you edit stock, the server automatically responds with different data —
              simulating another user editing at the same time.
            </p>
          </div>
          <button
            onClick={() => update({ conflictMode: !chaos.conflictMode })}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
              chaos.conflictMode ? "bg-accent" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                chaos.conflictMode ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>

        {/* Offline */}
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-3">
            <label className="text-xs font-medium text-text-primary">Offline</label>
            <p className="text-[10px] text-text-muted mt-0.5">
              Blocks server requests. Filters & UI still work from local sources.
            </p>
          </div>
          <button
            onClick={() => update({ offline: !chaos.offline })}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
              chaos.offline ? "bg-accent" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                chaos.offline ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
