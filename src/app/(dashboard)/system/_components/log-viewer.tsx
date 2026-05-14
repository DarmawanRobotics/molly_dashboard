"use client";
import { Activity, Filter, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LogLevel = "info" | "warn" | "error" | "debug";
type LogEntry = {
  id: number;
  timestamp: string;
  level: LogLevel;
  node: string;
  message: string;
};

let _idCounter = 0;
function genLog(i: number): LogEntry {
  const levels: LogLevel[] = ["info", "warn", "error", "debug"];
  const nodes = [
    "/bt_navigator",
    "/llm_bridge",
    "/fsm_controller",
    "/nav2_core",
    "/slam_toolbox",
  ];
  const messages = [
    "Initialized successfully",
    "Goal accepted",
    "Publishing cmd_vel",
    "Map update received",
    "Costmap clearing",
    "Plan computed",
    "BT tick",
    "Connection timeout",
    "Recovery started",
    "Waypoint reached",
    "LLM response received",
    "FSM state change",
    "Sensor data ok",
  ];
  return {
    id: _idCounter++,
    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    level: levels[i % levels.length],
    node: nodes[i % nodes.length],
    message: `${messages[i % messages.length]} (#${i})`,
  };
}

const ROW_HEIGHT = 28;
const OVERSCAN = 5;

const COLOR: Record<LogLevel, string> = {
  info: "text-cyan",
  warn: "text-amber",
  error: "text-red",
  debug: "text-txt-muted",
};

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    Array.from({ length: 50 }, (_, i) => genLog(i)),
  );
  const [filter, setFilter] = useState<LogLevel | "all">("all");
  const [search, setSearch] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerHeight = useRef(400);

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      containerHeight.current = entries[0].contentRect.height;
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLogs((prev) => {
        const next = [...prev.slice(-2000), genLog(prev.length)];
        return next;
      });
    }, 800);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filter !== "all" && l.level !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !l.message.toLowerCase().includes(q) &&
          !l.node.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [logs, filter, search]);

  // auto-scroll when new logs arrive
  useEffect(() => {
    if (!autoScroll || !containerRef.current) return;
    requestAnimationFrame(() => {
      if (containerRef.current)
        containerRef.current.scrollTop = filtered.length * ROW_HEIGHT;
    });
  }, [filtered.length, autoScroll]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setScrollTop(el.scrollTop);
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < ROW_HEIGHT * 2;
    setAutoScroll(atBottom);
  }, []);

  const totalHeight = filtered.length * ROW_HEIGHT;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIdx = Math.min(
    filtered.length,
    Math.ceil((scrollTop + containerHeight.current) / ROW_HEIGHT) + OVERSCAN,
  );
  const visibleLogs = filtered.slice(startIdx, endIdx);

  return (
    <div className="flex flex-col h-full">
      <div className="h-10 border-b border-border-subtle flex items-center gap-3 px-4 bg-mol-secondary shrink-0">
        <Activity size={14} className="text-cyan" />
        <span className="label">System Logs</span>
        <span className="font-mono text-[10px] text-txt-muted ml-1">
          ({filtered.length})
        </span>
        <div className="flex-1" />

        {!autoScroll && (
          <button
            type="button"
            onClick={() => {
              setAutoScroll(true);
              if (containerRef.current)
                containerRef.current.scrollTop = totalHeight;
            }}
            className="btn btn-ghost py-0.5 px-2 text-[10px] text-cyan border-cyan/30"
          >
            ↓ Follow
          </button>
        )}

        <div className="flex items-center gap-1 bg-mol-primary border border-border-subtle px-2 py-1">
          <label htmlFor="log-search" className="sr-only">
            Search logs
          </label>
          <Search size={12} className="text-txt-muted" />
          <input
            id="log-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter…"
            className="bg-transparent text-xs outline-none w-28 font-mono"
          />
        </div>

        <div className="flex items-center gap-1 bg-mol-primary border border-border-subtle px-2 py-1">
          <label htmlFor="log-filter" className="sr-only">
            Filter level
          </label>
          <Filter size={12} className="text-txt-muted" />
          <select
            id="log-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as LogLevel | "all")}
            className="bg-transparent text-xs outline-none font-mono cursor-pointer"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto font-mono text-[11px]"
      >
        <div>
          <div>
            {visibleLogs.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 px-2 hover:bg-mol-secondary transition-colors border-b border-border-subtle/30"
              >
                <span className="text-txt-muted w-20 shrink-0">
                  {l.timestamp}
                </span>
                <span
                  className={`w-12 font-bold uppercase shrink-0 ${COLOR[l.level]}`}
                >
                  {l.level}
                </span>
                <span className="text-violet w-36 truncate shrink-0">
                  {l.node}
                </span>
                <span className="text-txt-secondary flex-1 truncate">
                  {l.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
