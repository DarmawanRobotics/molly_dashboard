/**
 * UI-side aggregated robot runtime state.
 *
 * This is NOT a raw ROS message — it's a denormalized snapshot derived from
 * multiple topics (battery_state, odom, imu, etc.) for easy consumption by
 * dashboard components.
 */

export type GaitMode = "IDLE" | "TROT" | "WALK" | "STANCE" | "CLIMB";

export type SpeedMode = "LOW" | "MEDIUM" | "FAST";

/** 2D pose in map frame (yaw in radians). */
export interface RobotPose {
  x: number;
  y: number;
  yaw: number;
}

export interface RobotVelocity {
  /** m/s */
  linear: number;
  /** rad/s */
  angular: number;
}

/** IMU orientation in degrees (for human-readable display). */
export interface RobotImu {
  roll: number;
  pitch: number;
  yaw: number;
}

export interface RobotState {
  /** 0..100 */
  battery_percentage: number;
  /** Celsius */
  cpu_temp: number;
  gpu_temp: number;

  gait_mode: GaitMode;
  speed_mode: SpeedMode;

  position: RobotPose;
  velocity: RobotVelocity;
  imu: RobotImu;

  uptime_seconds: number;

  /** 0..100 */
  cpu_usage: number;
  gpu_usage: number;

  ram_used_gb: number;
  ram_total_gb: number;
}
