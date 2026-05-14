"use client";

import { Camera, ChartNoAxesColumnIncreasing, MapIcon } from "lucide-react";
import { AppPlaceholder } from "@/components/layout/app/placeholder";
import { AppSection } from "@/components/layout/app/section";
import { AppSidebar } from "@/components/layout/app/sidebar";
import type { POI } from "@/types";
import { CameraFeed } from "./_components/camera-feed";
import { RobotStatus } from "./_components/robot-status";
import { TourControl } from "./_components/tour-control";

// Mock POIs for when DB is not connected
const MOCK_POIS: POI[] = [
  {
    id: "1",
    name: "Lobby Entrance",
    description: "Main entrance",
    x: 120,
    y: 280,
    orderIndex: 0,
    dwellTimeSec: 30,
    mapId: "mock",
  },
  {
    id: "2",
    name: "Exhibition Hall A",
    description: "Modern art",
    x: 320,
    y: 180,
    orderIndex: 1,
    dwellTimeSec: 60,
    mapId: "mock",
  },
  {
    id: "3",
    name: "Exhibition Hall B",
    description: "Historical",
    x: 520,
    y: 220,
    orderIndex: 2,
    dwellTimeSec: 45,
    mapId: "mock",
  },
  {
    id: "4",
    name: "Garden Terrace",
    description: "Outdoor",
    x: 450,
    y: 380,
    orderIndex: 3,
    dwellTimeSec: 40,
    mapId: "mock",
  },
  {
    id: "5",
    name: "Gift Shop",
    description: "Souvenirs",
    x: 200,
    y: 150,
    orderIndex: 4,
    dwellTimeSec: 20,
    mapId: "mock",
  },
];

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
        <AppSection title="Tour Control" icon={<MapIcon size={16} />}>
          <TourControl pois={MOCK_POIS} />
        </AppSection>

        <AppSection title="Telemetry">
          <AppPlaceholder label="CPU / RAM / GPU" />
        </AppSection>
      </AppSidebar>
    </div>
  );
}
