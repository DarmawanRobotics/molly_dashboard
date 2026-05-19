"use client";
import { useEffect, useState } from "react";
import { getRos, TOPICS } from "@/lib/ros";
import type { OccupancyGrid } from "@/types/ros";

// NOTE: MOCK_GRID will be moved to src/mocks/occupancy-grid.ts in Step 5.
// Keeping inline for now to avoid scope creep in this migration commit.
const MOCK_GRID: OccupancyGrid = (() => {
  const W = 120;
  const H = 100;
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
  // doorways
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
    header: {
      stamp: { sec: 0, nanosec: 0 },
      frame_id: "map",
    },
    info: {
      map_load_time: { sec: 0, nanosec: 0 },
      resolution: 0.05,
      width: W,
      height: H,
      origin: {
        position: { x: -3, y: -2.5, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: 1 },
      },
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
    const unsub = getRos().subscribe(TOPICS.MAP, setGrid);
    return unsub;
  }, [useMock]);

  return grid;
}
