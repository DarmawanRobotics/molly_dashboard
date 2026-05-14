"use client";

import { Cpu, Server, Wifi } from "lucide-react";
import { AppSidebar } from "@/components/layout/app/sidebar";

export default function SystemPage() {
  return (
    <>
      <div className="flex-1 p-3">
        <div className="panel h-full flex items-center justify-center">
          SYSTEM OVERVIEW
        </div>
      </div>

      <AppSidebar title="SYSTEM" width="w-[320px]">
        <div className="p-3 flex items-center gap-2 text-sm text-txt-secondary">
          <Cpu size={14} /> CPU
        </div>

        <div className="p-3 flex items-center gap-2 text-sm text-txt-secondary">
          <Wifi size={14} /> Network
        </div>

        <div className="p-3 flex items-center gap-2 text-sm text-txt-secondary">
          <Server size={14} /> ROS
        </div>
      </AppSidebar>
    </>
  );
}
