-- Usage strictement mono-utilisateur (Victor) : `profil` n'a qu'une seule ligne,
-- forcée par la contrainte id = 1.
CREATE TABLE IF NOT EXISTS profil (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  poids_objectif NUMERIC(5, 2),
  echeance DATE,
  equipement JSONB NOT NULL DEFAULT '[]',
  contraintes_sante JSONB NOT NULL DEFAULT '[]',
  preferences JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poids (
  id BIGSERIAL PRIMARY KEY,
  valeur NUMERIC(5, 2) NOT NULL,
  mesure_a TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seances (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  duree_minutes INTEGER NOT NULL,
  exercices JSONB NOT NULL DEFAULT '[]',
  ressenti TEXT,
  effectuee_a TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Historique de conversation avec le coach (Étape 4). `role` reprend le
-- vocabulaire `Content.role` du SDK Gemini pour éviter un mapping supplémentaire.
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  contenu TEXT NOT NULL,
  profil_maj JSONB,
  cree_a TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Étape 5 (gamification) : état unique de progression (XP, streak). Singleton
-- comme `profil`. Le niveau n'est jamais stocké : toujours dérivé de xp_total
-- via src/lib/xp.ts, pour éviter toute dérive entre une valeur cachée et la formule.
CREATE TABLE IF NOT EXISTS gamification_etat (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  xp_total INTEGER NOT NULL DEFAULT 0,
  streak_actuel INTEGER NOT NULL DEFAULT 0,
  streak_record INTEGER NOT NULL DEFAULT 0,
  derniere_activite DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO gamification_etat (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Journal des gains d'XP (carnet de progression affiché sur /quetes).
CREATE TABLE IF NOT EXISTS xp_evenements (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('seance', 'poids', 'quete', 'boss')),
  montant INTEGER NOT NULL,
  libelle TEXT NOT NULL,
  survenu_a TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Arcs narratifs (cycles de 4-6 semaines). Contenu en données, pas en code :
-- Victor ajoute la suite par un simple INSERT, sans toucher au code. Un seul
-- arc actif à la fois, imposé par un index unique partiel.
CREATE TABLE IF NOT EXISTS arcs_narratifs (
  id BIGSERIAL PRIMARY KEY,
  ordre INTEGER NOT NULL UNIQUE,
  titre TEXT NOT NULL,
  theme TEXT NOT NULL,
  objectif_cle TEXT NOT NULL,
  objectif_mesure JSONB NOT NULL DEFAULT '{}',
  duree_semaines SMALLINT NOT NULL,
  boss_titre TEXT NOT NULL,
  boss_description TEXT NOT NULL,
  boss_condition JSONB NOT NULL DEFAULT '{}',
  statut TEXT NOT NULL DEFAULT 'a_venir' CHECK (statut IN ('a_venir', 'en_cours', 'boss_en_cours', 'clos')),
  demarre_a TIMESTAMPTZ,
  clos_a TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS arcs_narratifs_un_seul_actif
  ON arcs_narratifs ((true)) WHERE statut IN ('en_cours', 'boss_en_cours');

-- Arc pilote : "Sortir de Dirtmouth" — voir PLAN.md Étape 5 pour le contexte narratif complet.
INSERT INTO arcs_narratifs (ordre, titre, theme, objectif_cle, objectif_mesure, duree_semaines, boss_titre, boss_description, boss_condition, statut, demarre_a)
VALUES (
  1, 'Sortir de Dirtmouth',
  'Le vagabond quitte Dirtmouth, ville-sommeil au bord du gouffre, et redescend dans les galeries oubliées de Hallownest. Les premiers pas sont les plus lourds : le corps a désappris le mouvement, l''ancienne route est ensevelie sous la poussière. Chaque séance rouvre un passage ; chaque pesée plante un repère sur la carte.',
  '12 séances loguées et une tendance de poids en progression avant la fin des 5 semaines.',
  '{"type": "seances_min", "count": 12}', 5,
  'La Sentinelle de la Crypte Oubliée',
  'Une masse de pierre immobile depuis des siècles garde l''accès à Greenpath — elle incarne l''inertie qu''il faut vaincre pour continuer la descente.',
  '{"type": "seance_duree_min", "minutes": 45}',
  'en_cours', now()
) ON CONFLICT (ordre) DO NOTHING;

-- Quêtes : instances générées depuis un catalogue statique en code
-- (src/lib/quetes-catalogue.ts). template_id référence une clé du catalogue
-- (ou "boss-<arcId>" pour une quête boss rattachée à un arc) — ajouter une
-- quête = ajouter une entrée TS, jamais une migration.
CREATE TABLE IF NOT EXISTS quetes_instances (
  id BIGSERIAL PRIMARY KEY,
  template_id TEXT NOT NULL,
  portee TEXT NOT NULL CHECK (portee IN ('jour', 'semaine', 'boss')),
  periode_debut DATE NOT NULL,
  progression INTEGER NOT NULL DEFAULT 0,
  objectif INTEGER NOT NULL,
  recompense_xp INTEGER NOT NULL,
  statut TEXT NOT NULL DEFAULT 'active' CHECK (statut IN ('active', 'completee', 'expiree')),
  completee_a TIMESTAMPTZ,
  arc_id BIGINT REFERENCES arcs_narratifs(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (template_id, periode_debut)
);

-- Succès : définitions statiques en code (src/lib/achievements-catalogue.ts),
-- cette table ne stocke que le déblocage (état), jamais la définition.
CREATE TABLE IF NOT EXISTS achievements_debloques (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  debloque_a TIMESTAMPTZ NOT NULL DEFAULT now(),
  contexte JSONB NOT NULL DEFAULT '{}'
);
