import type { ReactNode } from "react";

export function AppSidebar({
  title,
  children,
  side = "right",
  width = "w-[320px]",
}: {
  title: string;
  children: ReactNode;
  side?: "left" | "right";
  width?: string;
}) {
  return (
    <aside
      className={[
        width,
        "shrink-0 flex flex-col overflow-y-auto bg-mol-primary",
        side === "left"
          ? "border-r border-border-subtle"
          : "border-l border-border-subtle",
      ].join(" ")}
    >
      <header className="border-b border-border-subtle p-3">
        <span className="label">{title}</span>
      </header>

      <div className="flex flex-col">{children}</div>
    </aside>
  );
}
