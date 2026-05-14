import { MapPin } from "lucide-react";

import type { POI } from "@/types";

interface POIListCardProps {
  pois: POI[];
}

export function POIListCard({ pois }: POIListCardProps) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <MapPin size={18} className="text-violet" />

        <span className="text-sm font-bold">POIs on Map</span>

        <span className="font-mono text-[11px] text-txt-muted">
          ({pois.length})
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {pois.map((poi, index) => (
          <div
            key={poi.id}
            className="panel-inset px-3 py-2 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-violet font-bold w-4">
                {index + 1}
              </span>

              <span className="text-xs text-txt-secondary">{poi.name}</span>
            </div>

            <span className="font-mono text-[10px] text-txt-muted">
              x:{poi.x} y:{poi.y}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
