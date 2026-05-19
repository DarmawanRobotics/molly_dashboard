"use client";

import { type ReactNode, useEffect } from "react";
import { useTourStore } from "@/stores/use-tour-store";

const TICK_MS = 1000;

/**
 * Increments the tour `elapsed` counter once per second when a tour is
 * active. Lives in its own component so re-renders from tour state changes
 * don't ripple into the rest of the provider tree.
 */
export function TourTicker({ children }: { children: ReactNode }) {
  const tick = useTourStore((s) => s.tick);

  useEffect(() => {
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [tick]);

  return <>{children}</>;
}
