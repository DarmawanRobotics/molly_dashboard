"use client";

import { Play, ScanLine, Square } from "lucide-react";

interface MappingSessionCardProps {
  isMapping: boolean;
}

export function MappingSessionCard({ isMapping }: MappingSessionCardProps) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <ScanLine size={18} className="text-cyan" />

        <span className="text-sm font-bold">SLAM Control</span>
      </div>

      <button
        type="button"
        className={`btn w-full justify-center py-3 ${
          isMapping ? "btn-danger" : "btn-primary"
        }`}
      >
        {isMapping ? (
          <>
            <Square size={14} />
            Stop Mapping
          </>
        ) : (
          <>
            <Play size={14} />
            Start Mapping
          </>
        )}
      </button>
    </div>
  );
}
