import type { FSMStateInfo, FSMStateKey } from "@/types";

/**
 * FSM visual metadata.
 */
export const FSM_STATES: Record<FSMStateKey, FSMStateInfo> = {
  IDLE: { color: "#6b7280", label: "Idle" },
  BOOTING: { color: "#eab308", label: "Booting" },
  LOCALIZING: { color: "#3b82f6", label: "Localizing" },
  NAVIGATING: { color: "#06b6d4", label: "Navigating" },
  NARRATING: { color: "#8b5cf6", label: "Narrating" },
  INTERACTING: { color: "#ec4899", label: "Interacting" },
  PERFORMING: { color: "#f97316", label: "Performing" },
  OBSTACLE_BLOCKED: { color: "#ef4444", label: "Blocked" },
  RETURNING: { color: "#14b8a6", label: "Returning" },
  ESTOP: { color: "#dc2626", label: "E-STOP" },
};
