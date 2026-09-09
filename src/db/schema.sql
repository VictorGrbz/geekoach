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
