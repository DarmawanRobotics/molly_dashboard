/**
 * Typed registry of ROS topics and services used by the dashboard.
 *
 * Centralizing topic names + types here means:
 *   - one place to update when the robot side renames anything
 *   - subscribe/publish call sites get full type inference
 *   - no string typos silently breaking subscriptions
 *
 * Naming convention follows ROS 2: `package_name/msg/Type`.
 * If your rosbridge build still uses ROS 1 style (`package_name/Type`), update
 * the `type` strings here only; call sites stay the same.
 */

import type { Twist } from "@/types/ros/geometry";
import type { OccupancyGrid, Odometry } from "@/types/ros/nav";
import type { BatteryState, CompressedImage, Imu } from "@/types/ros/sensor";
import type { StdEmpty, StdString } from "@/types/ros/std";

/* ----------------------------------------------------------------------------
 * Topic definitions
 * ------------------------------------------------------------------------- */

export interface TopicDef<TMsg> {
  readonly name: string;
  readonly type: string;
  /** Phantom — never read at runtime, only used to carry TMsg into call sites */
  readonly __msg?: TMsg;
}

function topic<TMsg>(name: string, type: string): TopicDef<TMsg> {
  return { name, type };
}

export const TOPICS = {
  // Motion
  CMD_VEL: topic<Twist>("/cmd_vel", "geometry_msgs/msg/Twist"),

  // Localization & mapping
  MAP: topic<OccupancyGrid>("/map", "nav_msgs/msg/OccupancyGrid"),
  ODOM: topic<Odometry>("/odom", "nav_msgs/msg/Odometry"),

  // Sensors
  IMU: topic<Imu>("/imu/data", "sensor_msgs/msg/Imu"),
  BATTERY: topic<BatteryState>(
    "/battery_state",
    "sensor_msgs/msg/BatteryState",
  ),
  CAMERA_RGB: topic<CompressedImage>(
    "/camera/color/image_raw/compressed",
    "sensor_msgs/msg/CompressedImage",
  ),
  CAMERA_DEPTH: topic<CompressedImage>(
    "/camera/depth/image_raw/compressed",
    "sensor_msgs/msg/CompressedImage",
  ),

  // Molly-specific (custom namespace on the robot)
  FSM_STATE: topic<StdString>("/molly/fsm_state", "std_msgs/msg/String"),
  FSM_COMMAND: topic<StdString>("/molly/fsm_command", "std_msgs/msg/String"),
  MOTION: topic<StdString>("/molly/motion", "std_msgs/msg/String"),

  // SLAM control
  SLAM_START: topic<StdEmpty>("/slam_toolbox/start_slam", "std_msgs/msg/Empty"),
  SLAM_STOP: topic<StdEmpty>("/slam_toolbox/stop_slam", "std_msgs/msg/Empty"),
} as const;

export type TopicKey = keyof typeof TOPICS;

/** Extract the message type for a given topic key. */
export type TopicMsg<K extends TopicKey> = (typeof TOPICS)[K] extends TopicDef<
  infer M
>
  ? M
  : never;

/* ----------------------------------------------------------------------------
 * Service definitions
 * ------------------------------------------------------------------------- */

export interface ServiceDef<TReq, TRes> {
  readonly name: string;
  readonly type: string;
  readonly __req?: TReq;
  readonly __res?: TRes;
}

function service<TReq, TRes>(
  name: string,
  type: string,
): ServiceDef<TReq, TRes> {
  return { name, type };
}

export const SERVICES = {
  SAVE_MAP: service<{ name: string }, { result: boolean }>(
    "/slam_toolbox/save_map",
    "slam_toolbox/srv/SaveMap",
  ),

  SET_NAV2_PARAMS: service<Record<string, unknown>, { result: boolean }>(
    "/nav2_param_server/set_parameters",
    "rcl_interfaces/srv/SetParameters",
  ),
} as const;

export type ServiceKey = keyof typeof SERVICES;
