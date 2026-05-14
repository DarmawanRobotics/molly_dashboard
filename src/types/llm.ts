/**
 * LLM and communication message types.
 */

export interface LLMMessage {
  role: "visitor" | "molly" | "system" | "operator";
  text: string;
  timestamp: string;
}
