"use client";

import {
  Activity,
  Battery,
  Gauge,
  Thermometer,
  Wifi,
  WifiOff,
} from "lucide-react";
import { FSM_STATES } from "@/constants/fsm-states";
import { cn } from "@/lib/utils";
import { useRobotStore } from "@/stores/use-robot-store";

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="panel-inset px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-txt-muted">{icon}</span>
        <span className="label">{label}</span>
      </div>
      <span className={cn("font-mono text-base font-bold", color)}>
        {value}
      </span>
    </div>
  );
}

export function RobotStatus() {
  const state = useRobotStore((s) => s.state);
  const conn = useRobotStore((s) => s.connectionStatus);
  const fsmState = useRobotStore((s) => s.fsmState);

  const fsm = FSM_STATES[fsmState];

  const speedModeColor: Record<string, string> = {
    LOW: "#22c55e",
    MEDIUM: "#facc15",
    FAST: "#ef4444",
  };

  const stats = [
    {
      icon: <Battery size={13} />,
      label: "Battery",
      value: `${state.battery_percentage}%`,
      color: state.battery_percentage > 30 ? "#22c55e" : "#ef4444",
    },
    {
      icon: <Thermometer size={13} />,
      label: "CPU Temp",
      value: `${state.cpu_temp}°C`,
      color: state.cpu_temp > 70 ? "#ef4444" : "#a0a0b0",
    },
    {
      icon: <Gauge size={13} />,
      label: "Linear Speed",
      value: `${state.velocity.linear.toFixed(2)} m/s`,
      color: "#22d3ee",
    },
    {
      icon: <Activity size={13} />,
      label: "Speed Mode",
      value: state.speed_mode,
      color: speedModeColor[state.speed_mode],
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* STATS GRID */}
      <div className="grid grid-cols-2 gap-1.5">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      {/* FSM */}
      <div className="panel-inset px-3 py-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Activity size={13} className="text-txt-muted" />
          <span className="label">FSM State</span>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 border px-2.5 py-1 w-full",
            fsm.bgClass,
            fsm.borderClass,
          )}
        >
          <div className={cn("h-2 w-2 animate-pulse-dot", fsm.dotClass)} />
          <span
            className={cn("font-mono text-xs font-semibold", fsm.textClass)}
          >
            {fsm.label}
          </span>
        </div>
      </div>

      {/* POSITION */}
      <div className="panel-inset px-3 py-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Activity size={13} className="text-txt-muted" />
          <span className="label">Position (X / Y / θ)</span>
        </div>

        <div className="font-mono text-[13px] font-semibold text-txt-secondary">
          {state.position.x.toFixed(2)} m / {state.position.y.toFixed(2)} m /{" "}
        </div>
      </div>

      {/* IMU */}
      <div className="panel-inset px-3 py-2">
        <span className="label">IMU (R / P / Y)</span>
        <div className="font-mono text-[13px] font-semibold text-txt-secondary mt-1">
          {state.imu.roll.toFixed(1)}° / {state.imu.pitch.toFixed(1)}° /{" "}
          {state.imu.yaw.toFixed(1)}°
        </div>
      </div>

      {/* CONNECTION */}
      <div className="panel-inset px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {conn === "connected" ? (
            <Wifi size={13} className="text-green" />
          ) : (
            <WifiOff size={13} className="text-red" />
          )}
          <span className="text-xs text-txt-secondary">rosbridge</span>
        </div>

        <span
          className={cn(
            "font-mono text-[11px]",
            conn === "connected" ? "text-green" : "text-red",
          )}
        >
          {conn}
        </span>
      </div>
    </div>
  );
}
