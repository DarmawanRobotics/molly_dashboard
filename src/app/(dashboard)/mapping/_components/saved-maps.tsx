"use client";

import { AppSection } from "@/components/layout/app/section";

/**
 * Placeholder until persisted map registry lands (queued for a later step
 * once Prisma adapter is wired up properly).
 */
export function SavedMaps() {
  return (
    <AppSection title="Saved Maps">
      <div className="text-xs text-txt-muted text-center py-4">
        No saved maps — save after SLAM
      </div>
    </AppSection>
  );
}
