"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OccupancyGrid } from "@/hooks/use-ros-map";
import type { POI, RobotPose } from "@/types";

interface Props {
  grid: OccupancyGrid | null;
  pose: RobotPose | null;
  pois?: POI[];
  activePoi?: string | null;
  onMapClick?: (
    worldX: number,
    worldY: number,
    pixelX: number,
    pixelY: number,
  ) => void;
  className?: string;
  /** Max number of past poses kept for the trail. Default 120. */
  trailLength?: number;
  /** Show 1m scale bar + compass. Default true. */
  showOverlays?: boolean;
}

type View = { zoom: number; panX: number; panY: number };
type Hover = { poi: POI; sx: number; sy: number } | null;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.15;

// --- color palette (matches existing dashboard tokens) ----------------------
const C = {
  bg: "#0a0a0a",
  gridLine: "rgba(255,255,255,0.025)",
  gridLineMajor: "rgba(34,211,238,0.06)",
  unknown: [70, 70, 75] as const,
  free: [232, 234, 237] as const,
  freeShadow: [210, 213, 218] as const,
  occupied: [12, 14, 18] as const,
  occupiedEdge: "rgba(34,211,238,0.35)",
  robot: "#22d3ee",
  robotGlow: "rgba(34,211,238,0.45)",
  trail: "rgba(34,211,238,0.55)",
  poi: "#a855f7",
  poiActive: "#22d3ee",
  text: "#d4d4d8",
  textMuted: "rgba(212,212,216,0.6)",
  overlay: "rgba(10,10,10,0.78)",
  overlayBorder: "rgba(255,255,255,0.08)",
};

/**
 * Project a world coordinate (m) onto canvas pixel space.
 * Accounts for: map origin, resolution, fit-to-canvas scale, user pan & zoom.
 * Returns null if values would be non-finite (grid not ready).
 */
function project(
  wx: number,
  wy: number,
  grid: OccupancyGrid,
  view: View,
  cW: number,
  cH: number,
): [number, number] {
  const { width: W, height: H, resolution, origin } = grid.info;
  const fit = Math.min(cW / W, cH / H);
  const scale = fit * view.zoom;
  const gx = (wx - origin.x) / resolution;
  const gy = (wy - origin.y) / resolution;
  const cx = cW / 2 + view.panX;
  const cy = cH / 2 + view.panY;
  // map cell (gx, gy) where origin is bottom-left in ROS convention
  const px = cx + (gx - W / 2) * scale;
  const py = cy - (gy - H / 2) * scale;
  return [px, py];
}

function unproject(
  px: number,
  py: number,
  grid: OccupancyGrid,
  view: View,
  cW: number,
  cH: number,
): { wx: number; wy: number; gx: number; gy: number } {
  const { width: W, height: H, resolution, origin } = grid.info;
  const fit = Math.min(cW / W, cH / H);
  const scale = fit * view.zoom;
  const cx = cW / 2 + view.panX;
  const cy = cH / 2 + view.panY;
  const gx = (px - cx) / scale + W / 2;
  const gy = -(py - cy) / scale + H / 2;
  return {
    wx: gx * resolution + origin.x,
    wy: gy * resolution + origin.y,
    gx,
    gy,
  };
}

// Pre-bake the occupancy grid to an offscreen canvas. This is the slow path;
// we only redo it when the grid object identity changes.
function bakeGrid(grid: OccupancyGrid): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const { width: W, height: H } = grid.info;
  const off = document.createElement("canvas");
  off.width = W;
  off.height = H;
  const octx = off.getContext("2d");
  if (!octx) return off;

  const img = octx.createImageData(W, H);
  const data = grid.data;
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    let r: number,
      g: number,
      b: number,
      a = 255;
    if (v < 0) {
      // unknown — slightly transparent so grid lines show through
      [r, g, b] = C.unknown;
      a = 180;
    } else if (v < 25) {
      [r, g, b] = C.free;
    } else if (v < 65) {
      // soft gradient between free and occupied
      const t = (v - 25) / 40;
      r = Math.round(C.free[0] * (1 - t) + C.occupied[0] * t);
      g = Math.round(C.free[1] * (1 - t) + C.occupied[1] * t);
      b = Math.round(C.free[2] * (1 - t) + C.occupied[2] * t);
    } else {
      [r, g, b] = C.occupied;
    }
    const o = i * 4;
    img.data[o] = r;
    img.data[o + 1] = g;
    img.data[o + 2] = b;
    img.data[o + 3] = a;
  }
  octx.putImageData(img, 0, 0);
  return off;
}

export function OccupancyCanvas({
  grid,
  pose,
  pois = [],
  activePoi,
  onMapClick,
  className = "",
  trailLength = 120,
  showOverlays = true,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bakedRef = useRef<{
    src: OccupancyGrid;
    canvas: HTMLCanvasElement;
  } | null>(null);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const sizeRef = useRef({ w: 800, h: 600, dpr: 1 });
  const animRef = useRef<number>(0);
  const dragRef = useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    origPanX: number;
    origPanY: number;
  } | null>(null);

  const [view, setView] = useState<View>({ zoom: 1, panX: 0, panY: 0 });
  const [hover, setHover] = useState<Hover>(null);
  const [pulse, setPulse] = useState(0);

  // -------- bake grid when it changes -----------------------------------
  const baked = useMemo(() => {
    if (!grid) return null;
    if (bakedRef.current?.src === grid) return bakedRef.current.canvas;
    const c = bakeGrid(grid);
    if (c) bakedRef.current = { src: grid, canvas: c };
    return c;
  }, [grid]);

  // -------- track robot trail -------------------------------------------
  useEffect(() => {
    if (!pose) return;
    const t = trailRef.current;
    const last = t[t.length - 1];
    if (
      !last ||
      Math.hypot(last.x - pose.x, last.y - pose.y) > 0.05 // 5cm
    ) {
      t.push({ x: pose.x, y: pose.y });
      if (t.length > trailLength) t.splice(0, t.length - trailLength);
    }
  }, [pose, trailLength]);

  // -------- pulse animation for active POI ------------------------------
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setPulse((p) => (p + 0.04) % (Math.PI * 2));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // -------- HiDPI + responsive sizing -----------------------------------
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const sync = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      if (
        sizeRef.current.w === w &&
        sizeRef.current.h === h &&
        sizeRef.current.dpr === dpr
      )
        return;
      sizeRef.current = { w, h, dpr };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(wrap);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  // -------- render loop -------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const { w: cW, h: cH, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cW, cH);

      // background
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, cW, cH);

      if (!grid || !baked) {
        drawEmptyState(ctx, cW, cH);
        return;
      }

      const { width: W, height: H, resolution } = grid.info;
      const fit = Math.min(cW / W, cH / H);
      const scale = fit * view.zoom;
      const drawW = W * scale;
      const drawH = H * scale;
      const cx = cW / 2 + view.panX;
      const cy = cH / 2 + view.panY;
      const ox = cx - drawW / 2;
      const oy = cy - drawH / 2;

      // map image
      ctx.imageSmoothingEnabled = view.zoom < 1.2; // crisp pixels when zoomed in
      ctx.drawImage(baked, ox, oy, drawW, drawH);

      // grid lines — minor every 1m, major every 5m
      drawGridLines(ctx, grid, view, cW, cH);

      // trail
      {
        const pts = trailRef.current;
        if (pts.length >= 2) {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineWidth = 1.5;
          for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1];
            const b = pts[i];
            const [ax, ay] = project(a.x, a.y, grid, view, cW, cH);
            const [bx, by] = project(b.x, b.y, grid, view, cW, cH);
            const alpha = (i / pts.length) * 0.7;
            ctx.strokeStyle = `rgba(34,211,238,${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }

      // POIs
      for (const poi of pois) {
        const isActive = poi.id === activePoi;
        const isHovered = hover?.poi.id === poi.id;
        const wx = poi.x * resolution + grid.info.origin.x;
        const wy = poi.y * resolution + grid.info.origin.y;
        const [px, py] = project(wx, wy, grid, view, cW, cH);
        drawPOI(ctx, px, py, poi.name, isActive, isHovered, pulse);
      }

      // robot
      if (pose) {
        const [rx, ry] = project(pose.x, pose.y, grid, view, cW, cH);
        drawRobot(ctx, rx, ry, pose.yaw, pulse);
      }

      // overlays
      if (showOverlays) {
        drawScaleBar(ctx, grid, view, cW, cH);
        drawCompass(ctx, cW, cH);
        drawZoomBadge(ctx, view.zoom, cW, cH);
      }

      // hover tooltip
      if (hover) drawTooltip(ctx, hover, cW, cH);
    };

    // schedule via rAF so we coalesce updates
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [grid, baked, pose, pois, activePoi, view, hover, pulse, showOverlays]);

  // -------- input handlers ----------------------------------------------
  const getLocal = useCallback((e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      if (!grid) return;
      e.preventDefault();
      const { x, y } = getLocal(e);
      const { w: cW, h: cH } = sizeRef.current;
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      setView((v) => {
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom * factor));
        const k = next / v.zoom;
        // keep the point under the cursor stable
        const dx = x - (cW / 2 + v.panX);
        const dy = y - (cH / 2 + v.panY);
        return {
          zoom: next,
          panX: v.panX - dx * (k - 1),
          panY: v.panY - dy * (k - 1),
        };
      });
    },
    [grid, getLocal],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // middle, right, or shift+left starts pan
      const isPan = e.button === 1 || e.button === 2 || e.shiftKey;
      if (!isPan && e.button !== 0) return;
      const { x, y } = getLocal(e);
      dragRef.current = {
        active: true,
        moved: false,
        startX: x,
        startY: y,
        origPanX: view.panX,
        origPanY: view.panY,
      };
      if (isPan) e.preventDefault();
    },
    [getLocal, view.panX, view.panY],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getLocal(e);
      const drag = dragRef.current;
      if (drag?.active) {
        const dx = x - drag.startX;
        const dy = y - drag.startY;
        if (Math.hypot(dx, dy) > 3) drag.moved = true;
        if (drag.moved) {
          setView((v) => ({
            ...v,
            panX: drag.origPanX + dx,
            panY: drag.origPanY + dy,
          }));
        }
        return;
      }
      // hover detection (skip while dragging)
      if (!grid) return;
      const { w: cW, h: cH } = sizeRef.current;
      let nearest: Hover = null;
      let nearestDist = 14; // px threshold
      for (const poi of pois) {
        const wx = poi.x * grid.info.resolution + grid.info.origin.x;
        const wy = poi.y * grid.info.resolution + grid.info.origin.y;
        const [px, py] = project(wx, wy, grid, view, cW, cH);
        const d = Math.hypot(px - x, py - y);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = { poi, sx: px, sy: py };
        }
      }
      setHover(nearest);
    },
    [getLocal, grid, pois, view],
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag) return;
      // only fire click if it didn't drag and was left button
      if (drag.moved || e.button !== 0 || !onMapClick || !grid) return;
      const { x, y } = getLocal(e);
      const { w: cW, h: cH } = sizeRef.current;
      const { wx, wy, gx, gy } = unproject(x, y, grid, view, cW, cH);
      onMapClick(wx, wy, gx, gy);
    },
    [getLocal, grid, onMapClick, view],
  );

  const onMouseLeave = useCallback(() => {
    dragRef.current = null;
    setHover(null);
  }, []);

  const onDoubleClick = useCallback(() => {
    setView({ zoom: 1, panX: 0, panY: 0 });
  }, []);

  const cursor = dragRef.current?.active
    ? "grabbing"
    : onMapClick
      ? "crosshair"
      : "default";

  return (
    <div
      ref={wrapRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onDoubleClick={onDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
        className="block w-full h-full select-none"
        style={{ cursor }}
      />
      {/* keyboard / mouse hint */}
      <div className="pointer-events-none absolute bottom-2 left-2 text-[10px] font-mono text-txt-muted opacity-60">
        scroll: zoom · shift+drag: pan · dbl-click: reset
      </div>
    </div>
  );
}

// ============================================================================
// Draw helpers
// ============================================================================

function drawEmptyState(ctx: CanvasRenderingContext2D, cW: number, cH: number) {
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  for (let x = 0; x < cW; x += 24) {
    ctx.fillRect(x, 0, 1, cH);
  }
  for (let y = 0; y < cH; y += 24) {
    ctx.fillRect(0, y, cW, 1);
  }
  ctx.fillStyle = C.textMuted;
  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("WAITING FOR MAP…", cW / 2, cH / 2);
  ctx.textAlign = "left";
}

function drawGridLines(
  ctx: CanvasRenderingContext2D,
  grid: OccupancyGrid,
  view: View,
  cW: number,
  cH: number,
) {
  const { resolution } = grid.info;
  // 1m in pixels at current zoom
  const fit = Math.min(cW / grid.info.width, cH / grid.info.height);
  const oneMeter = fit * view.zoom * (1 / resolution);
  if (oneMeter < 14) return; // too dense, skip

  // find a meter-aligned point near canvas center
  const { wx: cwx, wy: cwy } = unproject(cW / 2, cH / 2, grid, view, cW, cH);
  const startWX = Math.floor(cwx - cW / oneMeter / 2) - 1;
  const endWX = Math.ceil(cwx + cW / oneMeter / 2) + 1;
  const startWY = Math.floor(cwy - cH / oneMeter / 2) - 1;
  const endWY = Math.ceil(cwy + cH / oneMeter / 2) + 1;

  ctx.lineWidth = 1;
  for (let wx = startWX; wx <= endWX; wx++) {
    const [px] = project(wx, 0, grid, view, cW, cH);
    if (px < -2 || px > cW + 2) continue;
    ctx.strokeStyle = wx % 5 === 0 ? C.gridLineMajor : C.gridLine;
    ctx.beginPath();
    ctx.moveTo(px + 0.5, 0);
    ctx.lineTo(px + 0.5, cH);
    ctx.stroke();
  }
  for (let wy = startWY; wy <= endWY; wy++) {
    const [, py] = project(0, wy, grid, view, cW, cH);
    if (py < -2 || py > cH + 2) continue;
    ctx.strokeStyle = wy % 5 === 0 ? C.gridLineMajor : C.gridLine;
    ctx.beginPath();
    ctx.moveTo(0, py + 0.5);
    ctx.lineTo(cW, py + 0.5);
    ctx.stroke();
  }
}

function drawRobot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  yaw: number,
  pulse: number,
) {
  // outer pulsing ring
  const r = 14 + Math.sin(pulse) * 1.5;
  const grad = ctx.createRadialGradient(x, y, 2, x, y, r * 1.8);
  grad.addColorStop(0, C.robotGlow);
  grad.addColorStop(1, "rgba(34,211,238,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // heading line
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-yaw);
  ctx.strokeStyle = "rgba(34,211,238,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -24);
  ctx.stroke();

  // arrow body
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(7, 7);
  ctx.lineTo(0, 3);
  ctx.lineTo(-7, 7);
  ctx.closePath();
  ctx.fillStyle = C.robot;
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawPOI(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  name: string,
  active: boolean,
  hovered: boolean,
  pulse: number,
) {
  const color = active ? C.poiActive : C.poi;
  // halo
  if (active) {
    const r = 10 + Math.sin(pulse * 1.5) * 2;
    ctx.strokeStyle = `rgba(34,211,238,${(0.4 + Math.sin(pulse * 1.5) * 0.2).toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // dot
  ctx.beginPath();
  ctx.arc(x, y, hovered || active ? 5.5 : 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.stroke();

  // label with bg
  ctx.font = "bold 10px 'JetBrains Mono', monospace";
  const tw = ctx.measureText(name).width;
  const lx = x + 10;
  const ly = y - 4;
  ctx.fillStyle = C.overlay;
  ctx.fillRect(lx - 3, ly - 9, tw + 6, 13);
  ctx.strokeStyle = active ? color : C.overlayBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(lx - 3 + 0.5, ly - 9 + 0.5, tw + 6, 13);
  ctx.fillStyle = active ? color : C.text;
  ctx.fillText(name, lx, ly);
}

function drawScaleBar(
  ctx: CanvasRenderingContext2D,
  grid: OccupancyGrid,
  view: View,
  cW: number,
  cH: number,
) {
  const fit = Math.min(cW / grid.info.width, cH / grid.info.height);
  const pxPerMeter = (fit * view.zoom) / grid.info.resolution;

  // pick a nice round meter value: 1, 2, 5, 10, 20, 50...
  const candidates = [0.5, 1, 2, 5, 10, 20, 50, 100];
  let meters = 1;
  for (const c of candidates) {
    if (c * pxPerMeter >= 60 && c * pxPerMeter <= 180) {
      meters = c;
      break;
    }
    if (c * pxPerMeter > 180) {
      meters = c;
      break;
    }
  }
  const w = meters * pxPerMeter;
  const x = cW - w - 16;
  const y = cH - 20;

  ctx.fillStyle = C.overlay;
  ctx.fillRect(x - 6, y - 12, w + 12, 22);
  ctx.strokeStyle = C.overlayBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 6 + 0.5, y - 12 + 0.5, w + 12, 22);

  ctx.strokeStyle = C.text;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - 4);
  ctx.lineTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y - 4);
  ctx.stroke();

  ctx.fillStyle = C.text;
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${meters} m`, x + w / 2, y - 4);
  ctx.textAlign = "left";
}

function drawCompass(ctx: CanvasRenderingContext2D, cW: number, _cH: number) {
  const cx = cW - 28;
  const cy = 28;
  const r = 14;
  ctx.fillStyle = C.overlay;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.overlayBorder;
  ctx.stroke();

  // N arrow
  ctx.fillStyle = C.robot;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r + 2);
  ctx.lineTo(cx + 4, cy + 2);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx - 4, cy + 2);
  ctx.closePath();
  ctx.fill();

  // S half
  ctx.fillStyle = C.textMuted;
  ctx.beginPath();
  ctx.moveTo(cx, cy + r - 2);
  ctx.lineTo(cx + 4, cy - 2);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx - 4, cy - 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = C.text;
  ctx.font = "bold 8px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("N", cx, cy - r - 2);
  ctx.textAlign = "left";
}

function drawZoomBadge(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  _cW: number,
  _cH: number,
) {
  const text = `${zoom.toFixed(2)}×`;
  ctx.font = "10px 'JetBrains Mono', monospace";
  const tw = ctx.measureText(text).width;
  const x = 12;
  const y = 22;
  ctx.fillStyle = C.overlay;
  ctx.fillRect(x - 4, y - 12, tw + 8, 16);
  ctx.strokeStyle = C.overlayBorder;
  ctx.strokeRect(x - 4 + 0.5, y - 12 + 0.5, tw + 8, 16);
  ctx.fillStyle = C.text;
  ctx.fillText(text, x, y);
}

function drawTooltip(
  ctx: CanvasRenderingContext2D,
  hover: NonNullable<Hover>,
  cW: number,
  cH: number,
) {
  const lines = [
    hover.poi.name,
    `id: ${hover.poi.id}`,
    `x: ${hover.poi.x.toFixed(2)}  y: ${hover.poi.y.toFixed(2)}`,
  ];
  ctx.font = "10px 'JetBrains Mono', monospace";
  const widths = lines.map((l) => ctx.measureText(l).width);
  const w = Math.max(...widths) + 16;
  const h = lines.length * 13 + 10;
  let tx = hover.sx + 14;
  let ty = hover.sy + 14;
  if (tx + w > cW - 4) tx = hover.sx - w - 14;
  if (ty + h > cH - 4) ty = hover.sy - h - 14;

  ctx.fillStyle = C.overlay;
  ctx.fillRect(tx, ty, w, h);
  ctx.strokeStyle = C.robot;
  ctx.lineWidth = 1;
  ctx.strokeRect(tx + 0.5, ty + 0.5, w, h);
  for (let i = 0; i < lines.length; i++) {
    ctx.fillStyle = i === 0 ? C.robot : C.text;
    ctx.font =
      i === 0
        ? "bold 10px 'JetBrains Mono', monospace"
        : "10px 'JetBrains Mono', monospace";
    ctx.fillText(lines[i], tx + 8, ty + 14 + i * 13);
  }
}
