"use client";
import Placeholder from "@/components/placeholder";
import Sidebar from "./_components/sidebar";

export default function MonitorPage() {
  return (
    <main className="flex h-full w-full min-h-0 bg-mol-root">
      <Sidebar title="LEFT PANEL" width="w-[260px]" position="left">
        <Placeholder text="CAMERA / STATUS" />
      </Sidebar>

      <section className="flex flex-1 min-w-0 flex-col">
        <header className="border-b border-border-subtle p-3">
          <span className="label">MAP VIEW</span>
        </header>

        <div className="flex-1 p-3">
          <Placeholder text="MAP CANVAS" />
        </div>
      </section>

      <Sidebar title="RIGHT PANEL" width="w-[300px]" position="right">
        <Placeholder text="TOUR / TELEOP / LLM" />
      </Sidebar>
    </main>
  );
}
