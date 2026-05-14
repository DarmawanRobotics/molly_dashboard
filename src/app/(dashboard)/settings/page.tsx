"use client";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Compass,
  Radio,
  RotateCcw,
  RotateCw,
  Save,
  Square,
  Video,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { ros } from "@/lib/ros-bridge";

function Section({
  icon,
  title,
  color = "text-cyan",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className={color}>{icon}</span>
        <span className="text-sm font-bold">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactElement;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label block mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const CMD_VEL = "/cmd_vel";
const CMD_VEL_TYPE = "geometry_msgs/Twist";

function makeTwist(lx: number, az: number) {
  return { linear: { x: lx, y: 0, z: 0 }, angular: { x: 0, y: 0, z: az } };
}

export default function SettingsPage() {
  const [linearVel, setLinearVel] = useState(0.3);
  const [angularVel, setAngularVel] = useState(0.5);
  const [held, setHeld] = useState<string | null>(null);

  const publish = (key: string) => {
    const cmds: Record<string, ReturnType<typeof makeTwist>> = {
      fwd: makeTwist(linearVel, 0),
      back: makeTwist(-linearVel, 0),
      left: makeTwist(0, angularVel),
      right: makeTwist(0, -angularVel),
      stop: makeTwist(0, 0),
    };
    ros.publish(CMD_VEL, CMD_VEL_TYPE, cmds[key] ?? cmds.stop);
  };

  const startHold = (key: string) => {
    setHeld(key);
    publish(key);
    const interval = setInterval(() => publish(key), 100);
    const stop = () => {
      clearInterval(interval);
      publish("stop");
      setHeld(null);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
  };

  const TeleopBtn = ({
    dir,
    icon,
    label,
    className = "",
  }: {
    dir: string;
    icon: React.ReactNode;
    label: string;
    className?: string;
  }) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={() => startHold(dir)}
      onTouchStart={() => startHold(dir)}
      className={`btn ${held === dir ? "btn-primary" : "btn-ghost"} px-4 py-3 justify-center ${className}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="w-full overflow-y-auto p-6">
      <h2 className="text-lg font-bold mb-0.5">Settings</h2>
      <p className="text-[13px] text-txt-tertiary mb-6">
        System parameters, connections, and teleop controls.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* TELEOP */}
        <Section
          icon={<ArrowUp size={18} />}
          title="Teleop Control"
          color="text-cyan"
        >
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Linear vel (m/s)" htmlFor="linear-vel">
                <input
                  title="Linear velocity in meters per second"
                  id="linear-vel"
                  type="number"
                  step={0.05}
                  min={0.05}
                  max={1.5}
                  value={linearVel}
                  onChange={(e) => setLinearVel(Number(e.target.value))}
                  className="input-base w-full"
                />
              </Field>
              <Field label="Angular vel (rad/s)" htmlFor="angular-vel">
                <input
                  title="Angular velocity in radians per second"
                  id="angular-vel"
                  type="number"
                  step={0.1}
                  min={0.1}
                  max={2.0}
                  value={angularVel}
                  onChange={(e) => setAngularVel(Number(e.target.value))}
                  className="input-base w-full"
                />
              </Field>
            </div>

            <div className="flex flex-col items-center gap-1 mt-1">
              <TeleopBtn
                dir="fwd"
                label="Move forward"
                icon={<ArrowUp size={16} />}
              />
              <div className="flex gap-1">
                <TeleopBtn
                  dir="left"
                  label="Rotate left"
                  icon={<RotateCcw size={16} />}
                />
                <button
                  type="button"
                  aria-label="Stop"
                  title="Stop"
                  onMouseDown={() => publish("stop")}
                  className="btn btn-danger px-4 py-3 justify-center"
                >
                  <Square size={16} />
                </button>
                <TeleopBtn
                  dir="right"
                  label="Rotate right"
                  icon={<RotateCw size={16} />}
                />
              </div>
              <TeleopBtn
                dir="back"
                label="Move backward"
                icon={<ArrowDown size={16} />}
              />
            </div>
            <p className="text-[10px] text-txt-muted text-center">
              Hold button to move · Release to stop
            </p>
          </div>
        </Section>

        {/* CONNECTION */}
        <Section
          icon={<Radio size={18} />}
          title="Connection"
          color="text-cyan"
        >
          <div className="flex flex-col gap-3">
            <Field label="Rosbridge WebSocket URL" htmlFor="rosbridge-url">
              <input
                title="Rosbridge url"
                id="rosbridge-url"
                defaultValue="ws://192.168.1.120:9090"
                className="input-base w-full"
              />
            </Field>
            <Field label="Web Video Server URL" htmlFor="video-url">
              <input
                title="Web video server url"
                id="video-url"
                defaultValue="http://192.168.1.120:8080"
                className="input-base w-full"
              />
            </Field>
            <button
              type="button"
              className="btn btn-primary self-start gap-1.5"
            >
              <Save size={13} /> Save & Reconnect
            </button>
          </div>
        </Section>

        {/* STREAM QUALITY */}
        <Section
          icon={<Video size={18} />}
          title="Stream Quality"
          color="text-green"
        >
          <div className="flex flex-col gap-3">
            <Field label="Resolution" htmlFor="stream-res">
              <select
                aria-label="Stream resolution"
                id="stream-res"
                defaultValue="640x480"
                className="input-base w-full"
              >
                <option value="320x240">320×240</option>
                <option value="640x480">640×480</option>
                <option value="1280x720">1280×720</option>
              </select>
            </Field>
            <Field label="FPS" htmlFor="stream-fps">
              <select
                aria-label="Stream frames per second"
                id="stream-fps"
                defaultValue="30"
                className="input-base w-full"
              >
                <option value="10">10 fps</option>
                <option value="15">15 fps</option>
                <option value="30">30 fps</option>
              </select>
            </Field>
            <button
              type="button"
              className="btn btn-primary self-start gap-1.5"
            >
              <Save size={13} /> Apply
            </button>
          </div>
        </Section>

        {/* NAV2 PARAMS */}
        <Section
          icon={<Compass size={18} />}
          title="Nav2 Parameters"
          color="text-orange"
        >
          <div className="flex flex-col gap-2.5">
            <Field label="Max linear velocity (m/s)" htmlFor="nav-max-lin">
              <input
                title="Max linear velocity for navigation in meters per second"
                id="nav-max-lin"
                defaultValue="0.5"
                type="number"
                step={0.05}
                className="input-base w-full"
              />
            </Field>
            <Field label="Max angular velocity (rad/s)" htmlFor="nav-max-ang">
              <input
                title="Max angular velocity for navigation in radians per second"
                id="nav-max-ang"
                defaultValue="1.0"
                type="number"
                step={0.1}
                className="input-base w-full"
              />
            </Field>
            <Field label="Min obstacle distance (m)" htmlFor="nav-obs">
              <input
                title="Minimum distance to obstacles for navigation in meters"
                id="nav-obs"
                defaultValue="0.25"
                type="number"
                step={0.05}
                className="input-base w-full"
              />
            </Field>
            <Field label="Goal tolerance (m)" htmlFor="nav-goal-tol">
              <input
                title="Goal tolerance for navigation in meters"
                id="nav-goal-tol"
                defaultValue="0.1"
                type="number"
                step={0.01}
                className="input-base w-full"
              />
            </Field>
            <Field label="Planner" htmlFor="nav-planner">
              <select
                title="Global planner algorithm for navigation"
                id="nav-planner"
                defaultValue="NavFn"
                className="input-base w-full"
              >
                <option value="NavFn">NavFn (Dijkstra)</option>
                <option value="Smac2d">Smac 2D</option>
                <option value="SmacHybrid">Smac Hybrid-A*</option>
                <option value="ThetaStar">Theta*</option>
              </select>
            </Field>
            <Field label="Controller" htmlFor="nav-controller">
              <select
                title="Local controller algorithm for navigation"
                id="nav-controller"
                defaultValue="DWB"
                className="input-base w-full"
              >
                <option value="DWB">DWB (Dynamic Window)</option>
                <option value="RPP">Regulated Pure Pursuit</option>
                <option value="Graceful">Graceful Motion</option>
              </select>
            </Field>
            <button
              type="button"
              onClick={() => {
                ros
                  .callService("/nav2_param_server/set_parameters", {
                    max_vel_x: 0.5,
                    max_vel_theta: 1.0,
                  })
                  .catch(() => {});
              }}
              className="btn btn-primary self-start gap-1.5"
            >
              <Save size={13} /> Apply to Nav2
            </button>
          </div>
        </Section>

        {/* LLM PROVIDER */}
        <Section
          icon={<Zap size={18} />}
          title="LLM Provider"
          color="text-violet"
        >
          <div className="flex flex-col gap-3">
            <Field label="Provider" htmlFor="llm-provider">
              <select
                aria-label="LLM provider"
                id="llm-provider"
                defaultValue="anthropic"
                className="input-base w-full"
              >
                <option value="anthropic">Anthropic Claude</option>
                <option value="openai">OpenAI GPT-4</option>
                <option value="gemini">Google Gemini</option>
                <option value="local">Local (Ollama)</option>
              </select>
            </Field>
            <Field label="API Key" htmlFor="llm-key">
              <input
                id="llm-key"
                type="password"
                placeholder="sk-…"
                className="input-base w-full"
              />
            </Field>
            <Field label="Model" htmlFor="llm-model">
              <input
                title="Model name or path for the selected LLM provider"
                id="llm-model"
                defaultValue="claude-sonnet-4-20250514"
                className="input-base w-full"
              />
            </Field>
            <button
              type="button"
              className="btn btn-primary self-start gap-1.5"
            >
              <Save size={13} /> Save
            </button>
          </div>
        </Section>

        {/* MOTION EXPRESSIONS */}
        <Section
          icon={<Bot size={18} />}
          title="Motion Expressions"
          color="text-green"
        >
          <div className="flex flex-col gap-1.5">
            {["wave", "bow", "sit", "stand", "dance"].map((motion) => (
              <div
                key={motion}
                className="panel-inset px-3 py-2 flex items-center justify-between"
              >
                <span className="capitalize text-sm">{motion}</span>
                <button
                  type="button"
                  onClick={() =>
                    ros.publish("/molly/motion", "std_msgs/String", {
                      data: motion,
                    })
                  }
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
