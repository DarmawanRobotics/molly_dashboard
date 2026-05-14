export function AppPlaceholder({ label }: { label: string }) {
  return (
    <div className="panel flex min-h-40 items-center justify-center">
      <span className="font-mono text-sm text-txt-secondary">{label}</span>
    </div>
  );
}
