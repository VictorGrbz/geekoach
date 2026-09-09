"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { upsertProfil } from "@/db/profil";

const profilSchema = z.object({
  poidsObjectif: z.coerce.number().positive().nullable(),
  echeance: z.string().nullable(),
  equipement: z.string(),
  contraintesSante: z.string(),
  preferencesNotes: z.string(),
});

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function saveProfil(formData: FormData) {
  const raw = {
    poidsObjectif: formData.get("poidsObjectif") || null,
    echeance: (formData.get("echeance") as string) || null,
    equipement: (formData.get("equipement") as string) ?? "",
    contraintesSante: (formData.get("contraintesSante") as string) ?? "",
    preferencesNotes: (formData.get("preferencesNotes") as string) ?? "",
  };
  const parsed = profilSchema.parse(raw);

  await upsertProfil({
    poidsObjectif: parsed.poidsObjectif,
    echeance: parsed.echeance,
    equipement: splitList(parsed.equipement),
    contraintesSante: splitList(parsed.contraintesSante),
    preferences: { notes: parsed.preferencesNotes },
  });

  revalidatePath("/profil");
}
