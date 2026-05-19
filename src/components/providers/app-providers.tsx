"use client";

import type { ReactNode } from "react";
import { ConnectionProvider } from "./connection-provider";
import { SimulationLayer } from "./simulation-layer";
import { TourTicker } from "./tour-ticker";

/**
 * Top-level provider composition for the dashboard.
 *
 * Ordering matters: ConnectionProvider must be outermost so that
 * SimulationLayer (which reads connectionStatus) sees up-to-date values.
 *
 *   ConnectionProvider           opens rosbridge, syncs status to store
 *     SimulationLayer            runs mocks when offline / USE_MOCKS
 *       TourTicker               1Hz tour elapsed counter
 *         children               dashboard pages
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConnectionProvider>
      <SimulationLayer>
        <TourTicker>{children}</TourTicker>
      </SimulationLayer>
    </ConnectionProvider>
  );
}
