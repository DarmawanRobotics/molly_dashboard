"use client";

import { Bot, Compass, Radio, Save, Video, Zap } from "lucide-react";

import { Field } from "./_components/field";
import { Section } from "./_components/section";

export default function SettingsPage() {
  return (
    <div className="w-full overflow-y-auto p-6">
      <h2 className="text-lg font-bold mb-0.5">Settings</h2>

      <p className="text-[13px] text-txt-tertiary mb-6">
        Configure system parameters, POI details, and connections.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Section
          icon={<Video size={18} />}
          title="Stream Quality"
          color="text-green"
        >
          <div className="flex flex-col gap-3">
            <Field label="Resolution" htmlFor="stream-resolution">
              <select
                aria-label="Stream Resolution"
                id="stream-resolution"
                defaultValue="640x480"
                className="input-base w-full"
              >
                <option value="320x240">320×240</option>

                <option value="640x480">640×480</option>

                <option value="1280x720">1280×720</option>
              </select>
            </Field>

            <button type="button" className="btn btn-primary self-start">
              <Save size={13} />
              Apply
            </button>
          </div>
        </Section>

        <Section
          icon={<Radio size={18} />}
          title="Connection"
          color="text-cyan"
        >
          <div className="flex flex-col gap-3">
            <Field label="Rosbridge WebSocket URL" htmlFor="rosbridge-url">
              <input
                aria-label="Rosbridge WebSocket URL"
                id="rosbridge-url"
                defaultValue="ws://192.168.1.120:9090"
                className="input-base w-full"
              />
            </Field>

            <button type="button" className="btn btn-primary self-start">
              <Save size={13} />
              Save & Reconnect
            </button>
          </div>
        </Section>

        <Section
          icon={<Zap size={18} />}
          title="LLM Provider"
          color="text-violet"
        >
          <div className="flex flex-col gap-3">
            <Field label="Provider" htmlFor="llm-provider">
              <select
                aria-label="LLM Provider"
                id="llm-provider"
                defaultValue="gemini"
                className="input-base w-full"
              >
                <option value="gemini">Google Gemini</option>

                <option value="openai">OpenAI GPT-4</option>
              </select>
            </Field>

            <button type="button" className="btn btn-primary self-start">
              <Save size={13} />
              Save
            </button>
          </div>
        </Section>

        <Section
          icon={<Compass size={18} />}
          title="Navigation Parameters"
          color="text-orange"
        >
          <div className="flex flex-col gap-2.5">
            <Field label="Max Linear Vel (m/s)" htmlFor="max-linear-vel">
              <input
                aria-label="Max Linear Velocity in meters per second"
                id="max-linear-vel"
                defaultValue="0.5"
                className="input-base w-full"
              />
            </Field>

            <button type="button" className="btn btn-primary self-start">
              <Save size={13} />
              Apply to Nav2
            </button>
          </div>
        </Section>

        <Section
          icon={<Bot size={18} />}
          title="Motion Expressions"
          color="text-green"
        >
          <div className="flex flex-col gap-1.5">
            {["wave", "bow", "sit", "stand"].map((motion) => (
              <div
                key={motion}
                className="panel-inset px-3 py-2 flex items-center justify-between"
              >
                <span className="capitalize text-sm">{motion}</span>

                <button
                  type="button"
                  className="btn btn-ghost py-1 px-3 text-[10px]"
                >
                  Test
                </button>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
