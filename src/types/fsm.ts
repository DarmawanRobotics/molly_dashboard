/**
 * Finite State Machine related types.
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

export interface FSMStateInfo {
  color: string;
  label: string;
}
