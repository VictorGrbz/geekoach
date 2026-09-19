export function ArcPanel({
  arc,
}: {
  arc: {
    titre: string;
    theme: string;
    objectifCle: string;
    dureeSemaines: number;
    semaineCourante: number;
    statut: "en_cours" | "boss_en_cours" | "clos";
    bossTitre: string;
    bossDescription: string;
  } | null;
}) {
  if (!arc) {
    return (
      <p className="text-sm text-fg-muted">
        Aucun arc en cours pour l&apos;instant — le prochain chapitre reste à écrire.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="tracked text-label text-fg-muted">{arc.titre}</h3>
        <span className="tracked text-label-sm text-fg-muted">
          Semaine {Math.min(arc.semaineCourante, arc.dureeSemaines)}/{arc.dureeSemaines}
        </span>
      </div>
      <p className="text-sm text-fg-muted">{arc.theme}</p>
      <p className="text-sm text-fg">Objectif : {arc.objectifCle}</p>

      {arc.statut === "boss_en_cours" && (
        <div className="border-l-2 border-amber pl-4">
          <p className="tracked text-label text-amber">Boss Fight</p>
          <p className="mt-1 text-sm text-fg">{arc.bossTitre}</p>
          <p className="mt-1 text-sm text-fg-muted">{arc.bossDescription}</p>
        </div>
      )}
    </div>
  );
}
