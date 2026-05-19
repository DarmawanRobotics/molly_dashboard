"use client";

import {
  ChevronRight,
  Play,
  RotateCcw,
  SkipForward,
  Square,
} from "lucide-react";
import { MollyButton } from "@/components/ui/molly";
import { useTourStore } from "@/stores/use-tour-store";
import type { POI } from "@/types";

interface Props {
  pois: POI[];
}

export function TourControl({ pois }: Props) {
  const { active, activePoi, start, stop, restart, nextWP } = useTourStore();

  const handleStart = () => start(pois[0]?.id || null, pois.length);
  const handleRestart = () => restart(pois[0]?.id || null);

  const handleNext = () => {
    const idx = pois.findIndex((p) => p.id === activePoi);
    if (idx < pois.length - 1) nextWP(pois[idx + 1].id);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* ACTION MollyButtonS */}
      <div className="flex gap-1.5">
        <MollyButton onClick={handleStart} disabled={active} className="flex-1">
          <Play size={14} />
          Start
        </MollyButton>

        <MollyButton
          onClick={stop}
          disabled={!active}
          variant="danger"
          className="flex-1"
        >
          <Square size={14} />
          Stop
        </MollyButton>
      </div>

      <div className="flex gap-1.5">
        <MollyButton
          onClick={handleRestart}
          disabled={!active}
          variant="secondary"
          className="flex-1 text-xs"
        >
          <RotateCcw size={12} />
          Restart
        </MollyButton>

        <MollyButton
          onClick={handleNext}
          disabled={!active}
          variant="secondary"
          className="flex-1 text-xs"
        >
          <SkipForward size={12} />
          Next WP
        </MollyButton>
      </div>

      {/* WAYPOINT LIST */}
      <div className="flex flex-col gap-1">
        <span className="label">Waypoints ({pois.length})</span>

        <div className="max-h-36 overflow-y-auto">
          {pois.map((poi, i) => {
            const isActive = poi.id === activePoi;

            return (
              <div
                key={poi.id}
                className={`px-2.5 py-1.5 flex items-center justify-between border-l-2 transition-colors ${
                  isActive
                    ? "border-l-cyan bg-cyan/5"
                    : "border-l-border-subtle"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-txt-muted font-bold w-4">
                    {i + 1}
                  </span>

                  <span
                    className={`text-xs ${
                      isActive ? "text-cyan" : "text-txt-secondary"
                    }`}
                  >
                    {poi.name}
                  </span>
                </div>

                {isActive && <ChevronRight size={12} className="text-cyan" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
