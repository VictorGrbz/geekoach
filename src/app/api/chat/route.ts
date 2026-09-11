import { NextResponse } from "next/server";
import { z } from "zod";
import { FunctionCallingConfigMode } from "@google/genai";
import { addMessage, countMessagesModelDepuis } from "@/db/messages";
import { getProfil, upsertProfil } from "@/db/profil";
import { getGenAI, GEMINI_MODEL, updateProfilDeclaration } from "@/lib/gemini";
import { buildHistorique, buildSystemInstruction } from "@/lib/coach-context";
import { applyProfilDelta, profilDeltaSchema } from "@/lib/profil-merge";

const QUOTA_QUOTIDIEN_SEUIL = 230;

const bodySchema = z.object({ message: z.string().trim().min(1) });

function debutJournee(): Date {
  const debut = new Date();
  debut.setHours(0, 0, 0, 0);
  return debut;
}

export async function POST(request: Request) {
  const body = bodySchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  await addMessage({ role: "user", contenu: body.data.message });

  const requetesAujourdhui = await countMessagesModelDepuis(debutJournee());
  if (requetesAujourdhui >= QUOTA_QUOTIDIEN_SEUIL) {
    return NextResponse.json({ error: "quota" }, { status: 429 });
  }

  try {
    const [systemInstruction, historique] = await Promise.all([buildSystemInstruction(), buildHistorique()]);

    const response = await getGenAI().models.generateContent({
      model: GEMINI_MODEL,
      contents: historique,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [updateProfilDeclaration] }],
        toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO } },
      },
    });

    const appelFonction = response.functionCalls?.find((fc) => fc.name === "update_profil");
    let profilMaj: Record<string, unknown> | null = null;
    let reponse = response.text ?? "";

    if (appelFonction) {
      const delta = profilDeltaSchema.parse(appelFonction.args ?? {});
      const profilActuel = await getProfil();
      if (profilActuel) {
        const { next, resumeFr } = applyProfilDelta(profilActuel, delta);
        await upsertProfil(next);
        profilMaj = delta;
        if (!reponse) reponse = resumeFr;
      }
    }

    if (!reponse) reponse = "Je n'ai pas de réponse à te proposer pour l'instant, reformule ta demande.";

    await addMessage({ role: "model", contenu: reponse, profilMaj });

    return NextResponse.json({ reply: reponse, profilMaj });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
      return NextResponse.json({ error: "quota" }, { status: 429 });
    }
    console.error("Erreur chat coach:", error);
    return NextResponse.json({ error: "unknown" }, { status: 500 });
  }
}
