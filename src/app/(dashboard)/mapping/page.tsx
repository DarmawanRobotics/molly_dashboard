"use client";
import { MapPin, Navigation, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { AppSection } from "@/components/layout/app/section";
import { AppSidebar } from "@/components/layout/app/sidebar";
import { OccupancyCanvas } from "@/components/map/occupancy-canvas";
import { useOccupancyGrid } from "@/hooks/use-ros-map";
import { ros } from "@/lib/ros-bridge";
import { useRobotStore } from "@/stores/use-robot-store";
import type { POI } from "@/types";

type SlamState = "idle" | "running" | "saving";

interface POIForm {
  name: string;
  description: string;
  dwellTimeSec: number;
  narrationText: string;
  motionAction: string;
}

const DEFAULT_FORM: POIForm = {
  name: "",
  description: "",
  dwellTimeSec: 30,
  narrationText: "",
  motionAction: "none",
};

export default function MappingPage() {
  const connectionStatus = useRobotStore((s) => s.connectionStatus);
  const pose = useRobotStore((s) => s.pose);
  const grid = useOccupancyGrid(connectionStatus === "disconnected");

  const [slamState, setSlamState] = useState<SlamState>("idle");
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [pendingCoord, setPendingCoord] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [form, setForm] = useState<POIForm>(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSlamToggle = () => {
    if (slamState === "idle") {
      setSlamState("running");
      ros.publish("/slam_toolbox/start_slam", "std_msgs/Empty", {});
    } else if (slamState === "running") {
      setSlamState("idle");
      ros.publish("/slam_toolbox/stop_slam", "std_msgs/Empty", {});
    }
  };

  const handleSaveMap = () => {
    setSlamState("saving");
    ros
      .callService("/slam_toolbox/save_map", { name: `map_${Date.now()}` })
      .then(() => setSlamState("idle"))
      .catch(() => setSlamState("running"));
  };

  const handleMapClick = (_wx: number, _wy: number, gx: number, gy: number) => {
    if (!addMode) return;
    setPendingCoord({ x: gx, y: gy });
    setAddMode(false);
  };

  const handleSavePoi = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      setPois((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, ...form, dwellTimeSec: Number(form.dwellTimeSec) }
            : p,
        ),
      );
      setEditingId(null);
    } else if (pendingCoord) {
      const poi: POI = {
        id: crypto.randomUUID(),
        ...form,
        dwellTimeSec: Number(form.dwellTimeSec),
        x: pendingCoord.x,
        y: pendingCoord.y,
        orderIndex: pois.length,
        mapId: "current",
      };
      setPois((prev) => [...prev, poi]);
      setPendingCoord(null);
    }
    setForm(DEFAULT_FORM);
  };

  const handleEditPoi = (poi: POI) => {
    setEditingId(poi.id);
    setForm({
      name: poi.name,
      description: poi.description,
      dwellTimeSec: poi.dwellTimeSec,
      narrationText: poi.narrationText ?? "",
      motionAction: poi.motionAction ?? "none",
    });
  };

  const handleDeletePoi = (id: string) => {
    setPois((prev) => prev.filter((p) => p.id !== id));
    if (selectedPoi === id) setSelectedPoi(null);
  };

  const showForm = !!pendingCoord || !!editingId;

  return (
    <div className="flex h-full w-full min-h-0">
      <div className="flex-1 p-3 min-w-0 relative">
        <div className="panel w-full h-full relative overflow-hidden">
          {grid ? (
            <OccupancyCanvas
              grid={grid}
              pose={pose}
              pois={pois}
              activePoi={selectedPoi}
              onMapClick={addMode ? handleMapClick : undefined}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="label">
                No map data — start SLAM or connect ROS
              </span>
            </div>
          )}

          {addMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-cyan text-mol-root font-mono text-xs font-bold px-4 py-2">
              CLICK ON MAP TO PLACE POI
              <button
                title="Cancel"
                type="button"
                onClick={() => setAddMode(false)}
                className="ml-3 opacity-60 hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="absolute bottom-3 right-3 label">
            {grid
              ? `${grid.info.width}×${grid.info.height} @ ${grid.info.resolution}m/cell`
              : ""}
          </div>
        </div>
      </div>

      <AppSidebar width="w-[360px]">
        {/* SLAM Control */}
        <AppSection title="SLAM Control" icon={<Navigation size={16} />}>
          <div className="flex flex-col gap-2">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleSlamToggle}
                disabled={slamState === "saving"}
                className={`btn flex-1 justify-center ${
                  slamState === "running" ? "btn-danger" : "btn-primary"
                }`}
              >
                {slamState === "running" ? "Stop SLAM" : "Start SLAM"}
              </button>
              <button
                type="button"
                onClick={handleSaveMap}
                disabled={slamState !== "running"}
                className="btn btn-ghost gap-1.5"
              >
                <Save size={13} />
                Save Map
              </button>
            </div>
            <div className="panel-inset px-3 py-2 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${slamState === "running" ? "bg-green animate-pulse" : "bg-txt-muted"}`}
              />
              <span className="font-mono text-xs text-txt-secondary">
                {slamState === "idle"
                  ? "SLAM idle"
                  : slamState === "running"
                    ? "SLAM active — building map"
                    : "Saving map…"}
              </span>
            </div>
          </div>
        </AppSection>

        {/* POI Management */}
        <AppSection title="POI Management" icon={<MapPin size={16} />}>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setAddMode(true);
                setEditingId(null);
                setForm(DEFAULT_FORM);
              }}
              className="btn btn-ghost w-full justify-center gap-1.5"
            >
              <Plus size={13} />
              Click map to add POI
            </button>

            {/* POI Form */}
            {showForm && (
              <div className="panel-inset p-3 flex flex-col gap-2">
                <span className="label">
                  {editingId ? "Edit POI" : "New POI"}
                </span>
                <input
                  className="input-base w-full text-xs"
                  placeholder="Name *"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                <input
                  className="input-base w-full text-xs"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
                <textarea
                  className="input-base w-full text-xs resize-none min-h-16"
                  placeholder="Narration text (spoken by robot)"
                  value={form.narrationText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, narrationText: e.target.value }))
                  }
                />
                <div className="flex gap-1.5">
                  <select
                    aria-label="Motion action at POI"
                    className="input-base flex-1 text-xs"
                    value={form.motionAction}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, motionAction: e.target.value }))
                    }
                  >
                    <option value="none">No motion</option>
                    <option value="wave">Wave</option>
                    <option value="bow">Bow</option>
                    <option value="sit">Sit</option>
                    <option value="dance">Dance</option>
                  </select>
                  <input
                    type="number"
                    className="input-base w-20 text-xs"
                    placeholder="Dwell s"
                    value={form.dwellTimeSec}
                    min={5}
                    max={300}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        dwellTimeSec: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleSavePoi}
                    className="btn btn-primary flex-1 justify-center text-xs py-1.5"
                  >
                    {editingId ? "Update" : "Add POI"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingCoord(null);
                      setEditingId(null);
                      setForm(DEFAULT_FORM);
                    }}
                    className="btn btn-ghost px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* POI List */}
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
              {pois.length === 0 && (
                <div className="text-xs text-txt-muted text-center py-4">
                  No POIs yet
                </div>
              )}
              {pois.map((poi, i) => (
                <button
                  key={poi.id}
                  type="button"
                  onClick={() =>
                    setSelectedPoi(poi.id === selectedPoi ? null : poi.id)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPoi(poi.id === selectedPoi ? null : poi.id);
                    }
                  }}
                  className={`panel-inset px-2.5 py-2 cursor-pointer flex items-start justify-between gap-2 ${
                    poi.id === selectedPoi ? "border-cyan/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="font-mono text-[10px] text-txt-muted w-4 shrink-0 pt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs text-txt-primary truncate">
                        {poi.name}
                      </div>
                      <div className="text-[10px] text-txt-muted truncate">
                        {poi.description}
                      </div>
                      {poi.narrationText && (
                        <div className="text-[10px] text-violet truncate">
                          {poi.narrationText}
                        </div>
                      )}
                      <div className="flex gap-2 mt-0.5">
                        {poi.motionAction && poi.motionAction !== "none" && (
                          <span className="label text-orange">
                            {poi.motionAction}
                          </span>
                        )}
                        <span className="label">{poi.dwellTimeSec}s dwell</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPoi(poi);
                      }}
                      className="btn btn-ghost px-2 py-1 text-[10px]"
                    >
                      Edit
                    </button>
                    <button
                      title="Delete POI"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePoi(poi.id);
                      }}
                      className="btn btn-danger px-2 py-1"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </AppSection>

        {/* Saved Maps */}
        <AppSection title="Saved Maps">
          <div className="text-xs text-txt-muted text-center py-4">
            No saved maps — save after SLAM
          </div>
        </AppSection>
      </AppSidebar>
    </div>
  );
}
