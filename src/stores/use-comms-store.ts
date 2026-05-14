import { create } from "zustand";

import type { LLMMessage } from "@/types";

interface CommsStore {
  messages: LLMMessage[];

  sttActive: boolean;
  teleopEnabled: boolean;

  addMessage: (message: LLMMessage) => void;

  toggleSTT: () => void;
  toggleTeleop: () => void;
}

/**
 * Communication and teleop store.
 */
export const useCommsStore = create<CommsStore>((set) => ({
  messages: [],

  sttActive: false,
  teleopEnabled: false,

  /**
   * Push new LLM conversation message.
   */
  addMessage: (message) =>
    set((prev) => ({
      messages: [...prev.messages, message],
    })),

  /**
   * Toggle speech-to-text mode.
   */
  toggleSTT: () =>
    set((prev) => ({
      sttActive: !prev.sttActive,
    })),

  /**
   * Toggle teleoperation state.
   */
  toggleTeleop: () =>
    set((prev) => ({
      teleopEnabled: !prev.teleopEnabled,
    })),
}));
