"use client";

import { Camera, ChartNoAxesColumnIncreasing } from "lucide-react";
import { AppPlaceholder } from "@/components/layout/app/placeholder";
import { AppSection } from "@/components/layout/app/section";
import { AppSidebar } from "@/components/layout/app/sidebar";
import { CameraFeed } from "./_components/camera-feed";
import { RobotStatus } from "./_components/robot-status";

export default function MonitorPage() {
  return (
    <div className="flex h-full w-full min-h-0">
      <AppSidebar side="left" width="w-[260px]">
        <AppSection title="Camera Feed" icon={<Camera size={16} />}>
          <CameraFeed label="RGB" />
          <CameraFeed label="Depth" />
        </AppSection>
        <AppSection
          title="RobotStatus"
          icon={<ChartNoAxesColumnIncreasing size={16} />}
        >
          <RobotStatus />
        </AppSection>
      </AppSidebar>

      <div className="flex-1 p-3">
        <AppPlaceholder label="MAP CANVAS" />
      </div>

      <AppSidebar width="w-[300px]">
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
