import React, { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useConductor } from "../react/SymphonyProvider";

const truncate = (value: unknown, limit = 120) => {
  const json = JSON.stringify(value);
  if (!json) {
    return String(value);
  }
  if (json.length <= limit) {
    return json;
  }
  return `${json.slice(0, limit)}…`;
};

export type SymphonyDevToolsProps = {
  maxTransactions?: number;
  redact?: (value: unknown, key: string) => unknown;
};

export const SymphonyDevTools = ({
  maxTransactions = 10,
  redact
}: SymphonyDevToolsProps) => {
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  const conductor = useConductor();
  const [paused, setPaused] = useState(false);
  const lastSnapshotRef = useRef(conductor.getSnapshot());

  const subscribe = useCallback(
    (cb: () => void) => {
      const keys = Object.keys(conductor.getSnapshot().sections);
      const unsubs = keys.map((key) => conductor.subscribe(key, cb));
      return () => {
        unsubs.forEach((unsub) => unsub());
      };
    },
    [conductor]
  );

  const getSnapshot = useCallback(() => conductor.getSnapshot(), [conductor]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const displaySnapshot = useMemo(() => {
    if (!paused) {
      lastSnapshotRef.current = snapshot;
    }
    return lastSnapshotRef.current;
  }, [paused, snapshot]);

  const sectionEntries = Object.entries(displaySnapshot.sections).map(
    ([key, value]) => ({
      key,
      value: redact ? redact(value, key) : value
    })
  );

  const exportSnapshot = () => {
    if (typeof window === "undefined") {
      return;
    }
    const blob = new Blob([JSON.stringify(displaySnapshot, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "symphony-snapshot.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        width: 320,
        maxHeight: 420,
        overflow: "auto",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        background: "var(--symphony-devtools-bg, #101114)",
        color: "var(--symphony-devtools-fg, #e6e8ef)",
        border: "1px solid var(--symphony-devtools-border, #2a2d35)",
        borderRadius: 8,
        padding: 12,
        zIndex: 9999
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>Symphony DevTools</strong>
        <button
          type="button"
          onClick={() => setPaused((prev) => !prev)}
          style={{
            fontSize: 12,
            background: "transparent",
            color: "inherit",
            border: "1px solid currentColor",
            borderRadius: 4,
            padding: "2px 6px",
            cursor: "pointer"
          }}
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      <section style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Sections</strong>
          <button
            type="button"
            onClick={exportSnapshot}
            style={{
              fontSize: 12,
              background: "transparent",
              color: "inherit",
              border: "1px solid currentColor",
              borderRadius: 4,
              padding: "2px 6px",
              cursor: "pointer"
            }}
          >
            Export
          </button>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
          {sectionEntries.map(({ key, value }) => (
            <li key={key} style={{ marginBottom: 6 }}>
              <div style={{ fontWeight: 600 }}>{key}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {truncate(value)}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 12 }}>
        <strong>Transactions</strong>
        <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0" }}>
          {displaySnapshot.transactions.slice(0, maxTransactions).map((tx) => (
            <li key={`${tx.timestamp}-${tx.label ?? "tx"}`}
              style={{ marginBottom: 6 }}
            >
              <div style={{ fontWeight: 600 }}>
                {tx.label ?? "transaction"}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {tx.touched.join(", ")}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
