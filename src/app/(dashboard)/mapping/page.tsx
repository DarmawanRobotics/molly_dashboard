"use client";

import { useState } from "react";

import type { MapMeta, POI } from "@/types";

import { MappingPage } from "./_components/mapping-page";

const initialPois: POI[] = [
  {
    id: "poi-1",
    name: "Entrance Gate",
    description: "Main entrance",
    x: 12,
    y: 44,
    narrationText: "Welcome",
    motionAction: "wave",
    dwellTimeSec: 20,
    orderIndex: 0,
    mapId: "map-1",
  },
];

const initialMaps: MapMeta[] = [
  {
    id: "map-1",
    name: "Museum Jakarta",
    file: "museum_jakarta.map",
    date: "2026-05-14",
    size: "24 MB",
    poi_count: 1,
    active: true,
  },
];

export default function Page() {
  const [pois] = useState<POI[]>(initialPois);

  const [maps] = useState<MapMeta[]>(initialMaps);

  return <MappingPage maps={maps} pois={pois} isMapping={false} />;
}
