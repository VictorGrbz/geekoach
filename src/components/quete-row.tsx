export function QueteRow({
  titre,
  description,
  progression,
  objectif,
  recompenseXp,
  completee,
}: {
  titre: string;
  description: string;
  progression: number;
  objectif: number;
  recompenseXp: number;
  completee: boolean;
}) {
  return (
    <li className="flex items-start justify-between gap-4 py-3 text-sm">
      <div>
        <p className="text-fg">{titre}</p>
        <p className="mt-1 text-fg-muted">{description}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {completee ? (
          <span className="tracked text-label text-cyan">Complétée</span>
        ) : (
          <span className="tracked text-label-sm text-fg-muted">
            {progression}/{objectif}
          </span>
        )}
        <span className="tracked text-label-sm text-cyan">+{recompenseXp} XP</span>
      </div>
    </li>
  );
}
