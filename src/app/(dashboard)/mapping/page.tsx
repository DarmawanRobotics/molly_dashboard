"use client";

import { AppPlaceholder } from "@/components/layout/app/placeholder";
import { AppSection } from "@/components/layout/app/section";
import { AppSidebar } from "@/components/layout/app/sidebar";

export default function MappingPage() {
  return (
    <div className="flex h-full w-full min-h-0">
      <div className="flex-1 p-3">
        <AppPlaceholder label="SLAM MAP CANVAS" />
      </div>

      <AppSidebar title="MAPPING" width="w-[380px]">
        <AppSection title="SLAM Control">
          <AppPlaceholder label="START / STOP SLAM" />
        </AppSection>

        <AppSection title="POI Management">
          <AppPlaceholder label="POI LIST + EDITOR" />
        </AppSection>

        <AppSection title="Saved Maps">
          <AppPlaceholder label="MAPS STORAGE" />
        </AppSection>
      </AppSidebar>
    </div>
  );
}
