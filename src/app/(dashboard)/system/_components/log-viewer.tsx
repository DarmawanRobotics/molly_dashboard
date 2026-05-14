"use client";

import { Activity, Filter, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type LogLevel = "info" | "warn" | "error" | "debug";

type LogEntry = {
  id: string;
  timestamp: string;
  level: LogLevel;
  node: string;
  message: string;
};

function genLog(i: number): LogEntry {
  const levels: LogLevel[] = ["info", "warn", "error", "debug"];
  const nodes = ["/bt_navigator", "/llm_bridge", "/fsm_controller"];

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toLocaleTimeString(),
    level: levels[Math.floor(Math.random() * levels.length)],
    node: nodes[i % nodes.length],
    message: `System log ${i}`,
  };
}

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | "all">("all");
  const [search, setSearch] = useState("");

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs(Array.from({ length: 30 }, (_, i) => genLog(i)));

    const interval = setInterval(() => {
      setLogs((prev) => [
        ...prev.slice(-200),
        genLog(Math.floor(Math.random() * 1000)),
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    ref.current?.scrollTo(0, ref.current.scrollHeight);
  }, []);

  const filtered = logs.filter((l) => {
    if (filter !== "all" && l.level !== filter) return false;
    if (
      search &&
      !l.message.toLowerCase().includes(search.toLowerCase()) &&
      !l.node.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const color: Record<LogLevel, string> = {
    info: "text-cyan",
    warn: "text-amber",
    error: "text-red",
    debug: "text-txt-muted",
  };

  return (
    <div className="flex flex-col h-full">
      {/* HEADER (RESTORED STYLE) */}
      <div className="h-10 border-b border-border-subtle flex items-center gap-3 px-4 bg-mol-secondary">
        <Activity size={14} className="text-cyan" />
        <span className="label">System Logs</span>

        <div className="flex-1" />

        {/* SEARCH (FIXED ACCESSIBILITY) */}
        <div className="flex items-center gap-1 bg-mol-primary border border-border-subtle px-2 py-1">
          <label htmlFor="log-search" className="sr-only">
            Search logs
          </label>
          <Search size={12} className="text-txt-muted" />
          <input
            id="log-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter logs..."
            className="bg-transparent text-xs outline-none w-32 font-mono"
          />
        </div>

        {/* FILTER (FIXED ACCESSIBILITY) */}
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

      {/* LOG LIST */}
      <div
        ref={ref}
        className="flex-1 overflow-y-auto font-mono text-[11px] p-2"
      >
        {filtered.map((l) => (
          <div
            key={l.id}
            className="flex items-start gap-3 px-2 py-1 hover:bg-mol-secondary transition-colors"
          >
            <span className="text-txt-muted w-20">{l.timestamp}</span>
            <span className={`w-12 font-bold uppercase ${color[l.level]}`}>
              {l.level}
            </span>
            <span className="text-violet w-40 truncate">{l.node}</span>
            <span className="text-txt-secondary flex-1">{l.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
