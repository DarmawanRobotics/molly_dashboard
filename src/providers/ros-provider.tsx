"use client";

import { useEffect } from "react";
import {
  useFSMSimulation,
  useRobotSimulation,
  useRosConnection,
} from "@/hooks/use-ros";
import { useRobotStore } from "@/stores/use-robot-store";
import { useTourStore } from "@/stores/use-tour-store";

/**
 * Wrap dashboard layout with this to auto-connect rosbridge
 * and run simulation when disconnected.
 */
export function RosProvider({ children }: { children: React.ReactNode }) {
  const connectionStatus = useRobotStore((s) => s.connectionStatus);
  const isEstop = useRobotStore((s) => s.isEstop);
  const tourActive = useTourStore((s) => s.active);

  // Connect to rosbridge (reads from settings or env)
  useRosConnection(
    process.env.NEXT_PUBLIC_ROSBRIDGE_URL || "ws://192.168.1.120:9090",
  );

  // Run simulation when not connected to real robot
  const shouldSimulate = connectionStatus === "disconnected" && !isEstop;
  useRobotSimulation(shouldSimulate && tourActive);
  useFSMSimulation(shouldSimulate && tourActive);

  // Simulate robot telemetry fluctuations
  const setState = useRobotStore((s) => s.setState);
  useEffect(() => {
    const i = setInterval(() => {
      const t = Date.now() / 3000;
      setState({
        cpu_temp: 42 + Math.round(Math.sin(t) * 4),
        gpu_temp: 38 + Math.round(Math.cos(t) * 3),
        cpu_usage: 30 + Math.round(Math.sin(t * 0.7) * 8),
        gpu_usage: 18 + Math.round(Math.cos(t * 0.5) * 6),
        ram_used_gb: parseFloat((6.0 + Math.sin(t * 0.3) * 0.5).toFixed(1)),
        velocity: {
          linear: parseFloat((0.35 + Math.sin(t) * 0.1).toFixed(2)),
          angular: parseFloat((0.02 + Math.cos(t) * 0.01).toFixed(3)),
        },
        imu: {
          roll: parseFloat((0.8 + Math.sin(t) * 0.3).toFixed(1)),
          pitch: parseFloat((1.2 + Math.cos(t) * 0.4).toFixed(1)),
          yaw: parseFloat((45.3 + t * 0.5).toFixed(1)),
        },
      });
    }, 3000);
    return () => clearInterval(i);
  }, [setState]);

  // Tour elapsed timer
  const tick = useTourStore((s) => s.tick);
  useEffect(() => {
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [tick]);

  return <>{children}</>;
}
