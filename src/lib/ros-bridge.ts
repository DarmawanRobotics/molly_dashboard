/**
 * ROS Bridge Service
 * Connects to rosbridge_suite via WebSocket.
 * In production: ws://192.168.1.120:9090
 * Auto-reconnects on disconnect (expected on page navigation).
 */

import type { ConnectionStatus } from "@/types";

type MsgHandler = (msg: unknown) => void;

interface Sub {
  topic: string;
  type: string;
  handler: MsgHandler;
  throttle_rate: number;
}

class RosBridgeService {
  private url = "";
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = "disconnected";
  private subs = new Map<string, Sub>();
  private listeners = new Set<(s: ConnectionStatus) => void>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000;

  connect(url: string): void {
    if (this.url === url && this.ws?.readyState === WebSocket.OPEN) return;
    this.disconnect();
    this.url = url;
    this.attempt();
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.ws?.close();
    this.ws = null;
    this.setStatus("disconnected");
    this.reconnectAttempts = 0;
  }

  subscribe(
    topic: string,
    type: string,
    handler: MsgHandler,
    throttle_rate = 100,
  ): void {
    this.subs.set(topic, { topic, type, handler, throttle_rate });
    this.sendOp({ op: "subscribe", topic, type, throttle_rate });
  }

  unsubscribe(topic: string): void {
    this.subs.delete(topic);
    this.sendOp({ op: "unsubscribe", topic });
  }

  publish(topic: string, type: string, msg: unknown): void {
    this.sendOp({ op: "publish", topic, type, msg });
  }

  async callService<T = unknown>(
    service: string,
    args: Record<string, unknown> = {},
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        reject(new Error("Not connected"));
        return;
      }
      const id = `call:${service}:${Date.now()}`;
      const handler = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.op === "service_response" && msg.id === id) {
            this.ws?.removeEventListener("message", handler);
            msg.result
              ? resolve(msg.values as T)
              : reject(new Error("Service call failed"));
          }
        } catch {
          /* skip */
        }
      };
      this.ws?.addEventListener("message", handler);
      this.sendOp({ op: "call_service", id, service, args });
      setTimeout(() => {
        this.ws?.removeEventListener("message", handler);
        reject(new Error("Timeout"));
      }, 10000);
    });
  }

  onStatusChange(fn: (s: ConnectionStatus) => void): () => void {
    this.listeners.add(fn);
    fn(this.status);
    return () => {
      this.listeners.delete(fn);
    };
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  private attempt(): void {
    this.setStatus("reconnecting");
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        this.setStatus("connected");
        this.reconnectAttempts = 0;
        this.resubAll();
      };
      this.ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.op === "publish") this.subs.get(msg.topic)?.handler(msg.msg);
        } catch {
          /* skip */
        }
      };
      this.ws.onclose = () => {
        this.setStatus("disconnected");
        this.scheduleReconnect();
      };
      this.ws.onerror = () => {
        this.setStatus("disconnected");
      };
    } catch {
      this.setStatus("disconnected");
      this.scheduleReconnect();
    }
  }

  private setStatus(s: ConnectionStatus): void {
    this.status = s;
    this.listeners.forEach((fn) => {
      fn(s);
    });
  }

  private sendOp(data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN)
      this.ws.send(JSON.stringify(data));
  }

  private resubAll(): void {
    this.subs.forEach((s) => {
      this.sendOp({
        op: "subscribe",
        topic: s.topic,
        type: s.type,
        throttle_rate: s.throttle_rate,
      });
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delay = Math.min(
      1000 * 2 ** this.reconnectAttempts,
      this.maxReconnectDelay,
    );
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      if (this.status === "disconnected" && this.url) this.attempt();
    }, delay);
  }
}

export const ros = new RosBridgeService();
