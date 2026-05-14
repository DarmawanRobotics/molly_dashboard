export default function Sidebar({
  title,
  width,
  children,
  position,
}: {
  title: string;
  width: string;
  children: React.ReactNode;
  position: "left" | "right";
}) {
  return (
    <aside
      className={[
        width,
        "shrink-0 flex flex-col bg-mol-primary overflow-y-auto",
        position === "left"
          ? "border-r border-border-subtle"
          : "border-l border-border-subtle",
      ].join(" ")}
    >
      <header className="p-3 border-b border-border-subtle">
        <span className="label">{title}</span>
      </header>

      <div className="flex-1 p-3">{children}</div>
    </aside>
  );
}
