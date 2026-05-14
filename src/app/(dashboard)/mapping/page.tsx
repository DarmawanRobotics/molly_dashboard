"use client";

import { Download, Play, Upload } from "lucide-react";
import { AppSidebar } from "@/components/layout/app/sidebar";

export default function MappingPage() {
  return (
    <>
      {/* MAP */}
      <div className="flex-1 p-3">
        <div className="panel h-full flex items-center justify-center">
          MAP CANVAS / SLAM
        </div>
      </div>

      <AppSidebar title="MAPPING" width="w-[380px]">
        <div className="p-3 flex gap-2 border-b border-border-subtle">
          <button type="button" className="btn btn-primary flex-1">
            <Play size={13} /> Start
          </button>

          <button type="button" className="btn btn-ghost" title="export map">
            <Upload size={13} />
          </button>

          <button type="button" className="btn btn-ghost" title="import map">
            <Download size={13} />
          </button>
        </div>

        <div className="p-3 text-txt-secondary font-mono text-sm">POI LIST</div>

        <div className="p-3 text-txt-secondary font-mono text-sm">
          SAVED MAPS
        </div>
      </AppSidebar>
    </>
  );
}
