import type { ReactNode } from "react";

export function AppSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border-subtle p-3">
      <div className="mb-2">
        <span className="label">{title}</span>
      </div>

      <div className="space-y-2">{children}</div>
    </section>
  );
}
