"use client";

import type { ReactNode } from "react";

/**
 * @deprecated The 1Hz `elapsed` ticker has moved into `useTourController`.
 * This component is kept only so `app-providers.tsx` doesn't need a
 * coordinated edit in the same commit. It passes children through unchanged.
 *
 * Remove in the next refactor pass once app-providers no longer imports it.
 */
export function TourTicker({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
