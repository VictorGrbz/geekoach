"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { enregistrerSeance } from "@/db/activites";
import { deleteSeance } from "@/db/seances";

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

  await enregistrerSeance({
    type: parsed.type,
    dureeMinutes: parsed.dureeMinutes,
    exercices: splitList(parsed.exercices),
    ressenti: parsed.ressenti,
  });

  revalidatePath("/seances");
  revalidatePath("/");
  revalidatePath("/quetes");
}

export async function removeSeance(formData: FormData) {
  const id = z.coerce.number().int().positive().parse(formData.get("id"));
  await deleteSeance(id);
  revalidatePath("/seances");
  revalidatePath("/");
}
