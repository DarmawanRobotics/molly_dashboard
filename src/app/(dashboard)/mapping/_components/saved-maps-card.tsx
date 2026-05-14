import { Layers, MapIcon } from "lucide-react";

import type { MapMeta } from "@/types";

interface SavedMapsCardProps {
  maps: MapMeta[];
}

export function SavedMapsCard({ maps }: SavedMapsCardProps) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <Layers size={18} className="text-orange" />

        <span className="text-sm font-bold">Saved Maps</span>
      </div>

      <div className="flex flex-col gap-2">
        {maps.map((map) => (
          <div
            key={map.id}
            className="panel-inset px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <MapIcon
                size={14}
                className={map.active ? "text-cyan" : "text-txt-muted"}
              />

              <div>
                <div className="text-sm font-semibold text-txt-secondary">
                  {map.name}
                </div>

                <div className="font-mono text-[11px] text-txt-muted mt-0.5">
                  {map.date} · {map.size}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-ghost py-1.5 px-3 text-[10px]"
            >
              {map.active ? "Current" : "Load"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
