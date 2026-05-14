// src/types/fsm.ts

/**
 * Finite State Machine state keys for robot lifecycle.
 */

export type FSMStateKey =
  | "IDLE"
  | "BOOTING"
  | "LOCALIZING"
  | "NAVIGATING"
  | "NARRATING"
  | "INTERACTING"
  | "PERFORMING"
  | "OBSTACLE_BLOCKED"
  | "RETURNING"
  | "ESTOP";

/**
 * UI metadata for FSM badge rendering.
 */
export interface FSMStateInfo {
  label: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
  textClass: string;
}
