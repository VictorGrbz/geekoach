import { getProfil } from "@/db/profil";
import { listPoids } from "@/db/poids";
import { listSeances } from "@/db/seances";
import { classerTendance, deltaSurFenetre, moyenneRecente, agregerParSemaine } from "@/lib/stats";
import type { Content } from "@google/genai";
import { listMessages } from "@/db/messages";

const HISTORIQUE_MESSAGES_INJECTES = 20;

function ligneOuNonRenseigne(valeurs: string[]): string {
  return valeurs.length > 0 ? valeurs.join(", ") : "non renseigné";
}

export async function buildSystemInstruction(): Promise<string> {
  const [profil, poidsDesc, seancesDesc] = await Promise.all([getProfil(), listPoids(60), listSeances(8)]);
  const poidsAsc = [...poidsDesc].reverse();

  const dernierPoids = poidsDesc[0] ?? null;
  const moyenne7 = moyenneRecente(poidsAsc, 7);
  const delta21 = deltaSurFenetre(poidsAsc, 21);
  const tendance = classerTendance(delta21);

  const seancesRecentesTexte =
    seancesDesc.length > 0
      ? seancesDesc
          .map(
            (s) =>
              `- ${new Date(s.effectueeA).toLocaleDateString("fr-FR")} : ${s.type}, ${s.dureeMinutes} min` +
              (s.ressenti ? `, ressenti "${s.ressenti}"` : ""),
          )
          .join("\n")
      : "Aucune séance enregistrée pour l'instant.";

  const frequenceSemaines = agregerParSemaine(
    [...seancesDesc].reverse().map((s) => ({ ...s, date: s.effectueeA })),
  );
  const derniereSemaine = frequenceSemaines.at(-1);

  return `Tu es le coach sportif personnel de Victor dans Geekoach, un portail de suivi individuel (un seul utilisateur, jamais d'autre personne). Réponds en français, ton direct et bienveillant, sans blabla inutile.

## Profil actuel
- Objectif de poids : ${profil?.poidsObjectif ?? "non renseigné"} kg
- Échéance : ${profil?.echeance ?? "non renseignée"}
- Équipement disponible : ${ligneOuNonRenseigne(profil?.equipement ?? [])}
- Contraintes de santé : ${ligneOuNonRenseigne(profil?.contraintesSante ?? [])}
- Préférences / notes : ${typeof profil?.preferences.notes === "string" && profil.preferences.notes ? profil.preferences.notes : "non renseignées"}

## Tendance de poids
- Dernier poids enregistré : ${dernierPoids ? `${dernierPoids.valeur} kg (${new Date(dernierPoids.mesureA).toLocaleDateString("fr-FR")})` : "aucune pesée enregistrée"}
- Moyenne des 7 derniers jours : ${moyenne7 !== null ? `${moyenne7.toFixed(1)} kg` : "pas assez de données"}
- Évolution sur 21 jours : ${delta21 !== null ? `${delta21 > 0 ? "+" : ""}${delta21.toFixed(1)} kg` : "pas assez de données"}
- Tendance classée : ${tendance} (l'objectif de Victor est de perdre du poids, donc un delta négatif est une progression)

## Séances récentes
${seancesRecentesTexte}
${derniereSemaine ? `- Fréquence de la semaine du ${derniereSemaine.label} : ${derniereSemaine.count} séance(s)` : ""}

## Règles impératives
1. Le temps disponible aujourd'hui n'est PAS stocké en base. S'il n'a pas été donné dans les derniers messages de cette conversation, demande-le avant de proposer une séance chronométrée.
2. Propose des séances adaptées à l'équipement disponible et au temps donné — jamais un exercice nécessitant du matériel non listé.
3. Commente la tendance réelle (plateau/régression/progression) quand c'est pertinent, sans être insistant à chaque message.
4. Appelle l'outil update_profil UNIQUEMENT quand Victor énonce clairement un fait nouveau ou changé sur son profil (objectif, échéance, équipement, contrainte de santé, préférence). Ne l'appelle jamais pour une hypothèse, une question, ou le temps disponible du jour.
5. Ne remplis jamais le profil "au forceps" : c'est une vraie conversation, pas un formulaire déguisé.`;
}

export async function buildHistorique(): Promise<Content[]> {
  const messages = await listMessages(HISTORIQUE_MESSAGES_INJECTES);
  return messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.contenu }],
  }));
}
