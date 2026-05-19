export const env = {
  ROSBRIDGE_URL: process.env.NEXT_PUBLIC_ROSBRIDGE_URL ?? "ws://localhost:9090",
  VIDEO_SERVER_URL:
    process.env.NEXT_PUBLIC_VIDEO_SERVER_URL ?? "http://localhost:8080",
  USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS === "true",
};
