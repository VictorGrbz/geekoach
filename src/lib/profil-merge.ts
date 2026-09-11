import { z } from "zod";
import type { Profil } from "@/db/profil";

export const profilDeltaSchema = z.object({
  poidsObjectif: z.number().positive().optional(),
  echeance: z.string().optional(),
  equipementAjoute: z.array(z.string()).optional(),
  equipementRetire: z.array(z.string()).optional(),
  contraintesSanteAjoutees: z.array(z.string()).optional(),
  contraintesSanteRetirees: z.array(z.string()).optional(),
  preferenceNote: z.string().optional(),
});

export type ProfilDelta = z.infer<typeof profilDeltaSchema>;

export type UpsertProfilInput = {
  poidsObjectif: number | null;
  echeance: string | null;
  equipement: string[];
  contraintesSante: string[];
  preferences: Record<string, unknown>;
};

function appliquerListe(actuelle: string[], ajouts: string[] | undefined, retraits: string[] | undefined): string[] {
  const retraitsSet = new Set((retraits ?? []).map((v) => v.trim().toLowerCase()));
  const base = actuelle.filter((v) => !retraitsSet.has(v.trim().toLowerCase()));
  const existants = new Set(base.map((v) => v.trim().toLowerCase()));
  const nouveaux = (ajouts ?? []).filter((v) => !existants.has(v.trim().toLowerCase()));
  return [...base, ...nouveaux];
}

export function applyProfilDelta(
  current: Profil,
  delta: ProfilDelta,
): { next: UpsertProfilInput; resumeFr: string } {
  const phrases: string[] = [];

  const poidsObjectif = delta.poidsObjectif ?? current.poidsObjectif;
  if (delta.poidsObjectif !== undefined && delta.poidsObjectif !== current.poidsObjectif) {
    phrases.push(`objectif de poids fixé à ${delta.poidsObjectif} kg`);
  }

  const echeance = delta.echeance ?? current.echeance;
  if (delta.echeance !== undefined && delta.echeance !== current.echeance) {
    phrases.push(`échéance fixée au ${delta.echeance}`);
  }

  const equipement = appliquerListe(current.equipement, delta.equipementAjoute, delta.equipementRetire);
  if (delta.equipementAjoute?.length) {
    phrases.push(`équipement ajouté : ${delta.equipementAjoute.join(", ")}`);
  }
  if (delta.equipementRetire?.length) {
    phrases.push(`équipement retiré : ${delta.equipementRetire.join(", ")}`);
  }

  const contraintesSante = appliquerListe(
    current.contraintesSante,
    delta.contraintesSanteAjoutees,
    delta.contraintesSanteRetirees,
  );
  if (delta.contraintesSanteAjoutees?.length) {
    phrases.push(`contrainte de santé ajoutée : ${delta.contraintesSanteAjoutees.join(", ")}`);
  }
  if (delta.contraintesSanteRetirees?.length) {
    phrases.push(`contrainte de santé retirée : ${delta.contraintesSanteRetirees.join(", ")}`);
  }

  const preferences = { ...current.preferences };
  if (delta.preferenceNote !== undefined) {
    const notesActuelles = typeof current.preferences.notes === "string" ? current.preferences.notes : "";
    preferences.notes = notesActuelles ? `${notesActuelles}\n${delta.preferenceNote}` : delta.preferenceNote;
    phrases.push(`préférence notée : ${delta.preferenceNote}`);
  }

  return {
    next: { poidsObjectif, echeance, equipement, contraintesSante, preferences },
    resumeFr: phrases.length > 0 ? `Profil mis à jour — ${phrases.join(" ; ")}.` : "Aucun changement de profil détecté.",
  };
}
