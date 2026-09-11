import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Geekoach — Carte de progression",
  description: "Suivi de poids, séances et profil, cartographié comme une exploration de Hallownest.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${cinzel.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          THESIS: le portail se lit comme une carte de cartographe en cours de relevé, pas comme
          une app de fitness — chaque section est une région tracée à l'encre, jamais une carte de dashboard.
          OWN-WORLD: fond ardoise sombre patiné, halo cyan pâle unique, hairlines gravées, titres en
          petites capitales espacées (Cinzel), corps en Inter. Un sceau numéroté marque une région scellée.
          STORY: Victor relève sa progression comme on complète une carte — le vide se comble région par
          région ; ce qui n'est pas encore cartographié reste sous la brume, honnêtement, sans façade.
          FIRST VIEWPORT: l'accueil "Carte de Progression" empile les régions I à VI en une colonne unique
          à bordure fine ; la région Poids expose immédiatement la valeur courante et sa tendance tracée.
          FORM: contrat visuel externe approuvé par Victor (Claude Design, .impeccable/mocks/external/
          Coach Sportif.png) — reprise directe, aucun tirage de direction dans cette session.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
          verdict, DESIGN.md, and every shipping raster carrying its provenance.
        */}
        {children}
      </body>
    </html>
  );
}
