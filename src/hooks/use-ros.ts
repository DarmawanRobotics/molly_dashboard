"use client";
import { useEffect, useRef, useState } from "react";
import { getRos, type TopicDef } from "@/lib/ros";
import { useRobotStore } from "@/stores/use-robot-store";

/**
 * Subscribe to a typed ROS topic.
 *
 * Usage:
 *   const odom = useRosTopic(TOPICS.ODOM, null);
 */
export function useRosTopic<TMsg>(topic: TopicDef<TMsg>, initial: TMsg): TMsg {
  const [data, setData] = useState<TMsg>(initial);

  useEffect(() => {
    const unsub = getRos().subscribe(topic, setData);
    return unsub;
  }, [topic]);

  return data;
}

/** Simulates robot motion for dev (when rosbridge disconnected). */
export function useRobotSimulation(active: boolean) {
  const setPose = useRobotStore((s) => s.setPose);
  const pose = useRobotStore((s) => s.pose);
  const yawRef = useRef(pose.yaw);

  useEffect(() => {
    if (!active) return;
    const i = setInterval(() => {
      yawRef.current += (Math.random() - 0.5) * 0.06;
      const x = Math.max(
        60,
        Math.min(620, pose.x + Math.cos(yawRef.current) * 0.5),
      );
      const y = Math.max(
        100,
        Math.min(400, pose.y + Math.sin(yawRef.current) * 0.5),
      );
      setPose({ x, y, yaw: yawRef.current });
    }, 100);
    return () => clearInterval(i);
  }, [active, pose, setPose]);
}

const FSM_STATES = [
  "NAVIGATING",
  "NARRATING",
  "INTERACTING",
  "NAVIGATING",
  "PERFORMING",
] as const;

/** Simulates FSM state cycling. */
export function useFSMSimulation(active: boolean) {
  const setFSM = useRobotStore((s) => s.setFSM);
  const idx = useRef(0);

  useEffect(() => {
    if (!active) return;
    const i = setInterval(() => {
      idx.current = (idx.current + 1) % FSM_STATES.length;
      setFSM(FSM_STATES[idx.current]);
    }, 8000);
    return () => clearInterval(i);
  }, [active, setFSM]);
}

/** Ticking timer (uptime, tour elapsed, etc.). */
export function useTicker(active: boolean, start = 0): number {
  const [v, setV] = useState(start);
  useEffect(() => {
    if (!active) return;
    const i = setInterval(() => setV((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, [active]);
  return v;
}

export function formatUptime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
