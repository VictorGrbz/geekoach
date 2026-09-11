"use client";

import { useState, type FormEvent } from "react";
import { buttonClass, inputClass } from "@/components/field";
import type { Message } from "@/db/messages";

type MessageAffiche = Pick<Message, "role" | "contenu" | "profilMaj"> & { id: number | string; creeA: string };

export function ChatPanel({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState<MessageAffiche[]>(initialMessages);
  const [saisie, setSaisie] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    const message = saisie.trim();
    if (!message || enCours) return;

    setErreur(null);
    setSaisie("");
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: "user", contenu: message, profilMaj: null, creeA: new Date().toISOString() },
    ]);
    setEnCours(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429 || data.error === "quota") {
          setErreur("Le coach a atteint sa limite de requêtes gratuites pour l'instant. Réessaie dans quelques minutes.");
        } else {
          setErreur("Le coach n'a pas pu répondre. Réessaie dans un instant.");
        }
        return;
      }

      const data = (await res.json()) as { reply: string; profilMaj: Record<string, unknown> | null };
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}-reponse`,
          role: "model",
          contenu: data.reply,
          profilMaj: data.profilMaj,
          creeA: new Date().toISOString(),
        },
      ]);
    } catch {
      setErreur("Le coach n'a pas pu répondre. Réessaie dans un instant.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {messages.length > 0 ? (
        <ul className="flex flex-col divide-y divide-line border border-line bg-ink-900/60">
          {messages.map((m) => (
            <li key={m.id} className="px-6 py-4 sm:px-8">
              <div className="flex items-baseline justify-between gap-4">
                <span className="tracked text-label text-fg-muted">{m.role === "user" ? "Victor" : "Coach"}</span>
                <span className="tracked text-label-sm text-fg-muted">
                  {new Date(m.creeA).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-fg">{m.contenu}</p>
              {m.profilMaj && Object.keys(m.profilMaj).length > 0 && (
                <p className="tracked text-label-sm mt-2 text-cyan">Profil mis à jour</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="border border-dashed border-line px-6 py-8 text-center text-sm text-fg-muted sm:px-8">
          Aucun échange pour l&apos;instant. Dis au coach ce que tu as comme équipement et combien de temps tu as
          aujourd&apos;hui.
        </div>
      )}

      {erreur && (
        <div className="border border-dashed border-line px-6 py-4 text-sm text-fg-muted sm:px-8">{erreur}</div>
      )}

      <form onSubmit={envoyer} className="flex gap-3">
        <input
          type="text"
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          placeholder="J'ai 20 min, pas d'équipement..."
          className={`${inputClass} flex-1`}
          disabled={enCours}
        />
        <button type="submit" className={buttonClass} disabled={enCours || !saisie.trim()}>
          {enCours ? "···" : "Envoyer"}
        </button>
      </form>
    </div>
  );
}
