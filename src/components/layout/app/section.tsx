import type { ReactNode } from "react";

export function AppSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border-subtle px-2 py-3">
      <div className="mb-2 flex items-center gap-2">
        {icon && <span className="text-cyan">{icon}</span>}
        <span className="label">{title}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
