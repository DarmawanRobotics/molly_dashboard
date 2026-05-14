"use client";

import { AppPlaceholder } from "@/components/layout/app/placeholder";
import { AppSection } from "@/components/layout/app/section";
import { AppSidebar } from "@/components/layout/app/sidebar";

export default function SystemPage() {
  return (
    <div className="flex h-full w-full min-h-0">
      {/* MAIN */}
      <div className="flex-1 p-3">
        <AppPlaceholder label="SYSTEM OVERVIEW" />
      </div>

      {/* SIDEBAR */}
      <AppSidebar width="w-[320px]">
        <AppSection title="Network">
          <AppPlaceholder label="ROS / WS / VIDEO" />
        </AppSection>

        <AppSection title="Hardware">
          <AppPlaceholder label="JETSON / CPU / GPU" />
        </AppSection>

        <AppSection title="LLM">
          <AppPlaceholder label="MODEL CONFIG" />
        </AppSection>

        <AppSection title="Navigation">
          <AppPlaceholder label="NAV2 PARAMS" />
        </AppSection>
      </AppSidebar>
    </div>
  );
}
