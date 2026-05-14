"use client";

import { AppPlaceholder } from "@/components/layout/app/placeholder";
import { AppSection } from "@/components/layout/app/section";
import { AppSidebar } from "@/components/layout/app/sidebar";

export default function SettingsPage() {
  return (
    <div className="flex h-full w-full min-h-0">
      <div className="flex-1 p-3">
        <AppPlaceholder label="SETTINGS OVERVIEW" />
      </div>
      <AppSidebar width="w-[380px]">
        <AppSection title="POI Management">
          <AppPlaceholder label="EDIT POI LIST" />
        </AppSection>

        <AppSection title="Stream Quality">
          <AppPlaceholder label="RESOLUTION / FPS / CODEC" />
        </AppSection>

        <AppSection title="Connection">
          <AppPlaceholder label="ROS / VIDEO / UDP" />
        </AppSection>

        <AppSection title="LLM Provider">
          <AppPlaceholder label="MODEL / API CONFIG" />
        </AppSection>

        <AppSection title="Motion System">
          <AppPlaceholder label="MOTION COMMANDS" />
        </AppSection>
      </AppSidebar>
    </div>
  );
}
