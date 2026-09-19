export function XpBar({
  niveau,
  xpDansNiveau,
  xpRequisNiveau,
  ratio,
}: {
  niveau: number;
  xpDansNiveau: number;
  xpRequisNiveau: number;
  ratio: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-4">
        <span className="tracked text-label text-fg-muted">Niveau {niveau}</span>
        <span className="tracked text-label-sm text-fg-muted">
          {xpDansNiveau} / {xpRequisNiveau} XP
        </span>
      </div>
      <div className="h-1.5 border border-line bg-ink-950/60">
        <div
          className="h-full bg-cyan-dim transition-[width] duration-500"
          style={{ width: `${Math.min(ratio, 1) * 100}%` }}
        />
      </div>
    </div>
  );
}
