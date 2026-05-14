/**
 * Connection and stream related types.
 */

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

export interface StreamConfig {
  resolution: string;
  fps: number;
  quality: number;
  format: "mjpeg" | "h264" | "vp8";
}
