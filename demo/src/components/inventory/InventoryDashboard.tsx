"use client";

import { useEffect, useState } from "react";
import type { Conductor } from "@shiftbloom-studio/symphony-state";
import { SymphonyProvider } from "@shiftbloom-studio/symphony-state/react";
import {
  createDemoConductor,
  destroyDemoConductor,
} from "@/lib/symphony-setup";
import { SummaryBar } from "./SummaryBar";
import { FilterBar } from "./FilterBar";
import { InventoryTable } from "./InventoryTable";
import { ScorePanel } from "../score/ScorePanel";
import { ChaosControls } from "../chaos/ChaosControls";
import { WarehouseSelector } from "./WarehouseSelector";
import { GuidedFlows } from "./GuidedFlows";

export const InventoryDashboard = () => {
  const [conductor] = useState<Conductor>(() => createDemoConductor());

  useEffect(() => {
    return () => {
      destroyDemoConductor();
    };
  }, []);

  return (
    <SymphonyProvider conductor={conductor}>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Inventory Control Center
                </h1>
                <p className="text-sm text-text-secondary">
                  Real-time dashboard orchestrated by Symphony State
                </p>
              </div>
              <WarehouseSelector conductor={conductor} />
            </div>

            <GuidedFlows conductor={conductor} />

            <SummaryBar conductor={conductor} />

            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="space-y-4">
                <FilterBar conductor={conductor} />
                <InventoryTable conductor={conductor} />
              </div>
              <ChaosControls conductor={conductor} />
            </div>
          </div>
        </div>

        {/* Score panel */}
        <ScorePanel conductor={conductor} />
      </div>
    </SymphonyProvider>
  );
};
