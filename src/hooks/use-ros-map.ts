"use client";
import { useEffect, useState } from "react";
import { ros } from "@/lib/ros-bridge";

export interface OccupancyGrid {
  info: {
    resolution: number; // meters/cell
    width: number;
    height: number;
    origin: { x: number; y: number; theta: number };
  };
  data: number[]; // -1=unknown, 0=free, 100=occupied
}

const MOCK_GRID = (() => {
  const W = 120,
    H = 100;
  const data = new Array(W * H).fill(0);
  // outer walls
  for (let x = 0; x < W; x++) {
    data[x] = 100;
    data[(H - 1) * W + x] = 100;
  }
  for (let y = 0; y < H; y++) {
    data[y * W] = 100;
    data[y * W + W - 1] = 100;
  }
  // inner rooms
  [
    [20, 10, 2, 60],
    [60, 10, 2, 60],
    [20, 40, 40, 2],
    [20, 70, 40, 2],
  ].forEach(([x, y, w, h]) => {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++) data[(y + dy) * W + (x + dx)] = 100;
  });
  // doorways (gaps in walls)
  [
    [20, 30, 2, 4],
    [20, 55, 2, 4],
    [60, 25, 2, 4],
    [60, 55, 2, 4],
  ].forEach(([x, y, w, h]) => {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++) data[(y + dy) * W + (x + dx)] = 0;
  });
  // unknown patches
  for (let i = 0; i < 400; i++) {
    const idx = Math.floor(Math.random() * data.length);
    if (data[idx] === 0) data[idx] = -1;
  }
  return {
    info: {
      resolution: 0.05,
      width: W,
      height: H,
      origin: { x: -3, y: -2.5, theta: 0 },
    },
    data,
  };
})();

export function useOccupancyGrid(useMock = false): OccupancyGrid | null {
  const [grid, setGrid] = useState<OccupancyGrid | null>(
    useMock ? MOCK_GRID : null,
  );

  useEffect(() => {
    if (useMock) {
      setGrid(MOCK_GRID);
      return;
    }
    ros.subscribe("/map", "nav_msgs/OccupancyGrid", (msg) => {
      setGrid(msg as OccupancyGrid);
    });
    return () => ros.unsubscribe("/map");
  }, [useMock]);

  return grid;
}
