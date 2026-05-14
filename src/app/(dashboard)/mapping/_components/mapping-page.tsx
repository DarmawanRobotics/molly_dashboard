"use client";

import { AppSidebar } from "@/components/layout/app/sidebar";
import type { MapMeta, POI } from "@/types";

import { MapCanvasPlaceholder } from "./map-canvas-placeholder";
import { MappingSessionCard } from "./mapping-session-card";
import { POIListCard } from "./poi-list-card";
import { SavedMapsCard } from "./saved-maps-card";

interface MappingPageProps {
  maps: MapMeta[];
  pois: POI[];
  isMapping: boolean;
}

export function MappingPage({ maps, pois, isMapping }: MappingPageProps) {
  return (
    <div className="flex h-full w-full min-h-0">
      <div className="flex-1 p-3">
        <MapCanvasPlaceholder />
      </div>

      <AppSidebar width="w-[380px]">
        <MappingSessionCard isMapping={isMapping} />

        <POIListCard pois={pois} />

        <SavedMapsCard maps={maps} />
      </AppSidebar>
    </div>
  );
}
