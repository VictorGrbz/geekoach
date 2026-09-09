"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addSeance } from "@/db/seances";

const seanceSchema = z.object({
  type: z.string().min(1),
  dureeMinutes: z.coerce.number().int().positive(),
  exercices: z.string(),
  ressenti: z.string().nullable(),
});

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function saveSeance(formData: FormData) {
  const parsed = seanceSchema.parse({
    type: formData.get("type"),
    dureeMinutes: formData.get("dureeMinutes"),
    exercices: (formData.get("exercices") as string) ?? "",
    ressenti: (formData.get("ressenti") as string) || null,
  });

  await addSeance({
    type: parsed.type,
    dureeMinutes: parsed.dureeMinutes,
    exercices: splitList(parsed.exercices),
    ressenti: parsed.ressenti,
  });

  revalidatePath("/seances");
}
