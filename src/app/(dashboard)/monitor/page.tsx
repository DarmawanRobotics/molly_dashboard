"use client";

import { AppPlaceholder } from "@/components/layout/app/placeholder";
import { AppSection } from "@/components/layout/app/section";
import { AppSidebar } from "@/components/layout/app/sidebar";

export default function MonitorPage() {
  return (
    <div className="flex h-full w-full min-h-0">
      {/* LEFT */}
      <AppSidebar title="CAMERA" side="left" width="w-[260px]">
        <AppSection title="Camera Feed">
          <AppPlaceholder label="RGB FRONT" />
        </AppSection>

        <AppSection title="Depth">
          <AppPlaceholder label="DEPTH STREAM" />
        </AppSection>
      </AppSidebar>

      {/* CENTER */}
      <div className="flex-1 p-3">
        <AppPlaceholder label="MAP CANVAS" />
      </div>

      {/* RIGHT */}
      <AppSidebar title="ROBOT STATUS" width="w-[300px]">
        <AppSection title="State">
          <AppPlaceholder label="FSM STATUS" />
        </AppSection>

        <AppSection title="Telemetry">
          <AppPlaceholder label="CPU / RAM / GPU" />
        </AppSection>
      </AppSidebar>
    </div>
  );
}
