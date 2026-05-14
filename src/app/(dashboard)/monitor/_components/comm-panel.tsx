"use client";

import { Mic, MicOff, Send } from "lucide-react";
import { useRef, useState } from "react";
import { useCommsStore } from "@/stores/use-comms-store";

export function CommsPanel() {
  const { addMessage, sttActive, toggleSTT } = useCommsStore();

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const createMessage = (text: string) => {
    addMessage({
      role: "operator",
      text,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour12: false,
      }),
    });
  };

  const send = () => {
    if (!input.trim()) return;

    createMessage(input.trim());
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex gap-1.5">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={sttActive ? "Listening via STT..." : "Send command..."}
          className="input-base flex-1 text-xs resize-none min-h-15 max-h-30 pr-10"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />

        <button
          onClick={send}
          disabled={!input.trim()}
          className="absolute bottom-2 right-2 btn btn-primary px-2 py-1"
          type="button"
          title="Send command"
        >
          <Send size={13} />
        </button>
      </div>

      <button
        onClick={toggleSTT}
        type="button"
        className={`btn w-full justify-center py-2 transition-colors ${
          sttActive
            ? "bg-red/10 text-red border-red/25 animate-pulse"
            : "btn-ghost"
        }`}
      >
        {sttActive ? (
          <>
            <MicOff size={13} /> Listening (STT Active)
          </>
        ) : (
          <>
            <Mic size={13} /> Enable Voice Input
          </>
        )}
      </button>
    </div>
  );
}
