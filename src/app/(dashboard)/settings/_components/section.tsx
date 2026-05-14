interface SectionProps {
  icon: React.ReactNode;
  title: string;
  color?: string;
  children: React.ReactNode;
}

export function Section({
  icon,
  title,
  color = "text-cyan",
  children,
}: SectionProps) {
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
