"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { enregistrerPoids } from "@/db/activites";

const poidsSchema = z.object({
  valeur: z.coerce.number().positive(),
  mesureA: z.string().nullable(),
});

export async function saveEntreePoids(formData: FormData) {
  const parsed = poidsSchema.parse({
    valeur: formData.get("valeur"),
    mesureA: (formData.get("mesureA") as string) || null,
  });

  await enregistrerPoids({
    valeur: parsed.valeur,
    mesureA: parsed.mesureA ?? undefined,
  });

  revalidatePath("/poids");
  revalidatePath("/");
  revalidatePath("/quetes");
}
