import { GoogleGenAI, Type, type FunctionDeclaration } from "@google/genai";

export const GEMINI_MODEL = "gemini-2.5-flash";

let _ai: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!_ai) {
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return _ai;
}

export const updateProfilDeclaration: FunctionDeclaration = {
  name: "update_profil",
  description:
    "Met à jour le profil sportif de Victor quand il énonce clairement un fait nouveau ou changé " +
    "(objectif de poids, échéance, équipement, contrainte de santé, préférence). " +
    "Ne jamais appeler pour une hypothèse, une question, ou le temps disponible du jour (non stocké en base).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      poidsObjectif: { type: Type.NUMBER, description: "Nouvel objectif de poids en kg" },
      echeance: { type: Type.STRING, description: "Nouvelle échéance, format YYYY-MM-DD" },
      equipementAjoute: { type: Type.ARRAY, items: { type: Type.STRING } },
      equipementRetire: { type: Type.ARRAY, items: { type: Type.STRING } },
      contraintesSanteAjoutees: { type: Type.ARRAY, items: { type: Type.STRING } },
      contraintesSanteRetirees: { type: Type.ARRAY, items: { type: Type.STRING } },
      preferenceNote: { type: Type.STRING, description: "Préférence ou note libre à retenir" },
    },
  },
};
