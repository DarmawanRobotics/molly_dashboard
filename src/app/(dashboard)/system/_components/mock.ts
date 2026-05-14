export function genLog(i: number) {
  const levels = ["info", "warn", "error", "debug"] as const;

  return {
    timestamp: new Date().toLocaleTimeString(),
    level: levels[Math.floor(Math.random() * 4)],
    node: "/bt_navigator",
    // biome-ignore lint/style/useTemplate: <explanation>
    message: "event " + i,
  };
}
