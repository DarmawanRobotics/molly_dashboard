import { create } from "zustand";

import type {
  ConnectionStatus,
  FSMStateKey,
  RobotPose,
  RobotState,
} from "@/types";

interface RobotStore {
  state: RobotState;
  pose: RobotPose;

  fsmState: FSMStateKey;
  connectionStatus: ConnectionStatus;

  isEstop: boolean;

  setState: (state: Partial<RobotState>) => void;
  setPose: (pose: RobotPose) => void;

  setFSM: (fsmState: FSMStateKey) => void;
  setConnection: (status: ConnectionStatus) => void;

  toggleEstop: () => void;
}

const DEFAULT_STATE: RobotState = {
  battery_percentage: 78,
  cpu_temp: 42,
  gpu_temp: 38,

  gait_mode: "TROT",

  velocity: {
    linear: 0.35,
    angular: 0.02,
  },

  imu: {
    roll: 0.8,
    pitch: 1.2,
    yaw: 45.3,
  },

  uptime_seconds: 9257,

  cpu_usage: 34,
  gpu_usage: 21,

  ram_used_gb: 6.2,
  ram_total_gb: 16,
};

/**
 * Global robot runtime state store.
 */
export const useRobotStore = create<RobotStore>((set) => ({
  state: DEFAULT_STATE,

  pose: {
    x: 280,
    y: 250,
    yaw: -0.5,
  },

  fsmState: "IDLE",
  connectionStatus: "disconnected",

  isEstop: false,

  /**
   * Merge robot telemetry state.
   */
  setState: (state) =>
    set((prev) => ({
      state: {
        ...prev.state,
        ...state,
      },
    })),

  /**
   * Update robot pose.
   */
  setPose: (pose) => set({ pose }),

  /**
   * Update FSM state.
   */
  setFSM: (fsmState) => set({ fsmState }),

  /**
   * Update websocket/ROS connection state.
   */
  setConnection: (connectionStatus) => set({ connectionStatus }),

  /**
   * Toggle emergency stop state.
   */
  toggleEstop: () =>
    set((prev) => {
      const next = !prev.isEstop;

      return {
        isEstop: next,
        fsmState: next ? "ESTOP" : "IDLE",
      };
    }),
}));
