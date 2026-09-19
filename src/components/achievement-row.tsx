export function AchievementRow({
  titre,
  description,
  debloque,
}: {
  titre: string;
  description: string;
  debloque: boolean;
}) {
  if (!debloque) {
    return (
      <li className="border border-dashed border-line px-4 py-3 text-sm">
        <p className="text-fg-muted">??? — succès non débloqué</p>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-4 py-3 text-sm">
      <div>
        <p className="text-fg">{titre}</p>
        <p className="mt-1 text-fg-muted">{description}</p>
      </div>
      <span className="tracked text-label text-cyan">Débloqué</span>
    </li>
  );
}
