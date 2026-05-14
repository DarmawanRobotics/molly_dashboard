export default function Placeholder({ text }: { text: string }) {
  return (
    <div className="panel h-full flex items-center justify-center">
      <span className="text-sm font-mono text-txt-secondary">{text}</span>
    </div>
  );
}
