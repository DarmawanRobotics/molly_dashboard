import type { ReactNode } from "react";

export function AppSidebar({
  title,
  children,
  width = "w-[320px]",
  side = "right",
}: {
  title: string;
  children: ReactNode;
  width?: string;
  side?: "left" | "right";
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

      {children}
    </aside>
  );
}
