"use client";
import { AppSidebar } from "@/components/layout/app/sidebar";

export default function MonitorPage() {
  return (
    <>
      {/* LEFT */}
      <AppSidebar title="CAMERA" side="left" width="w-[260px]">
        <div className="p-3 text-txt-secondary font-mono text-sm">
          CAMERA FEEDS
        </div>
      </AppSidebar>

      <div className="flex-1 min-w-0 p-3">
        <div className="panel h-full flex items-center justify-center">
          MAP VIEW
        </div>
      </div>

      <AppSidebar title="STATUS" width="w-[300px]">
        <div className="p-3 text-txt-secondary font-mono text-sm">
          ROBOT STATUS
        </div>
      </AppSidebar>
    </>
  );
}
