"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addPoids } from "@/db/poids";

const poidsSchema = z.object({
  valeur: z.coerce.number().positive(),
  mesureA: z.string().nullable(),
});

export async function saveEntreePoids(formData: FormData) {
  const parsed = poidsSchema.parse({
    valeur: formData.get("valeur"),
    mesureA: (formData.get("mesureA") as string) || null,
  });

  await addPoids({
    valeur: parsed.valeur,
    mesureA: parsed.mesureA ?? undefined,
  });

  revalidatePath("/poids");
}
