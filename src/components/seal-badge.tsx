export function SealBadge({ label }: { label: string }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-dim/60 p-0.5">
      <span className="tracked text-label-sm flex h-full w-full items-center justify-center rounded-full border border-dashed border-cyan-dim/50 text-cyan">
        {label}
      </span>
    </span>
  );
}
