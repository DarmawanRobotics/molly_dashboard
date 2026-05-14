/**
 * Robot related shared types.
 */

export type GaitMode = "IDLE" | "TROT" | "WALK" | "STANCE" | "CLIMB";

export interface RobotState {
  battery_percentage: number;
  cpu_temp: number;
  gpu_temp: number;

  gait_mode: GaitMode;
  speed_mode: "LOW" | "MEDIUM" | "FAST";

  position: {
    x: number;
    y: number;
    yaw: number;
  };

  velocity: {
    linear: number;
    angular: number;
  };

  imu: {
    roll: number;
    pitch: number;
    yaw: number;
  };

  uptime_seconds: number;

  cpu_usage: number;
  gpu_usage: number;

  ram_used_gb: number;
  ram_total_gb: number;
}

export interface RobotPose {
  x: number;
  y: number;
  yaw: number;
}
