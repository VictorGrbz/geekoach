# Déployer un sous-domaine jess-vic.ovh sur Coolify + Cloudflare Tunnel

Ce guide couvre les étapes manuelles (aucun outil ne permet de les automatiser depuis Claude Code) pour exposer un projet self-hosted sur un sous-domaine de `jess-vic.ovh`, protégé si besoin par Cloudflare Access. C'est le pattern déjà utilisé pour `restaurant.`, `boutique.`, `reservation.jess-vic.ovh` et `jess-vic.ovh` lui-même (depuis le décommissionnement de Vercel/Neon le 2026-09-03) — ce doc remplace `docs/CLOUDFLARE.md` du repo `portfolio-victor`, qui documentait encore l'ancien pattern Vercel (DNS vers `76.76.21.21`, `vercel domains verify`) devenu obsolète.

**Ne touche jamais aux nameservers du domaine** (doivent rester sur Cloudflare) — on ajoute des routes, on ne migre rien.

## 1. Coolify : déployer l'application

Dans le dashboard Coolify (ProDesk) :
1. **New Resource** > **Application**, source = repo GitHub du projet (ici `VictorGrbz/geekoach`).
2. Build pack : Nixpacks détecte Next.js automatiquement (`npm run build` / `npm run start`), pas de Dockerfile nécessaire sauf besoin spécifique.
3. Port exposé : `3000` (port par défaut Next.js).
4. Variables d'environnement (Coolify > l'app > **Environment Variables**) : reprendre exactement les clés de `.env.example`/`.env.local`, avec des valeurs adaptées à la prod, en particulier :
   - `DATABASE_URL` : **jamais** l'URL locale via tunnel SSH (`localhost:5433`) utilisée en dev — l'app tourne sur le même serveur/réseau Coolify que Postgres, donc utiliser l'adresse interne du service Postgres (même principe que pour `demo-reservation-btp`, à reprendre depuis sa configuration Coolify).
   - Toute autre clé spécifique au projet (ici `GEMINI_API_KEY`), jamais committée, toujours en variable d'environnement Coolify.
5. Déployer, vérifier que le build passe et que l'app répond en interne (Coolify affiche généralement une preview URL ou les logs de démarrage).

## 2. Cloudflare Tunnel : router le sous-domaine

Le tunnel existant sur le ProDesk sert déjà plusieurs sous-domaines (`restaurant.`, `boutique.`, `reservation.jess-vic.ovh`) — **réutiliser ce même tunnel**, ne pas en créer un nouveau.

Dans **Zero Trust** > **Networks** > **Tunnels** > le tunnel du ProDesk > **Public Hostnames** :
1. **Add a public hostname**.
2. Sous-domaine : `geekoach` (ou le nom retenu), domaine : `jess-vic.ovh`.
3. Service : même type/cible que les entrées existantes pour restaurant/boutique/reservation (reprendre exactement la même configuration réseau — c'est la partie propre à la topologie du serveur, à copier depuis une entrée existante plutôt qu'à redéviner).
4. Enregistrer, attendre la propagation, tester `https://geekoach.jess-vic.ovh` (doit répondre sans être protégé pour l'instant).

## 3. Cloudflare Zero Trust Access : restreindre à un seul compte

Contrairement à `/priv/nous` (Victor + Jess) ou `/priv/famille` (groupe), ici l'accès doit être limité à `victor.garbez@gmail.com` uniquement, sur le sous-domaine entier (pas un sous-chemin).

Dans **Zero Trust** > **Access** > **Applications** :
1. **Add an application** > **Self-hosted**.
2. Nom : `Geekoach`.
3. Domaine : `geekoach.jess-vic.ovh` (chemin racine, pas de sous-chemin).
4. Durée de session : au choix (usage perso quotidien, une session longue de type 7-30 jours évite de se reconnecter sans cesse).
5. Policy :
   - Nom : `Victor uniquement`.
   - Action : `Allow`.
   - Include : `Emails` → `victor.garbez@gmail.com` (une seule adresse, pas de groupe).
6. Enregistrer.

## 4. Vérification finale

- `https://geekoach.jess-vic.ovh` en navigation privée affiche l'écran de connexion Cloudflare Access (code par email), puis laisse passer seulement `victor.garbez@gmail.com`.
- Testé depuis un mobile hors réseau local (4G/5G, pas le WiFi de la maison) — critère de fait de l'Étape 6 du `PLAN.md`.
- Un email non autorisé (test avec un second compte si besoin) doit être bloqué par Cloudflare Access, jamais atteindre l'application.

## À corriger une fois cette étape faite

- `context/infra.md` (racine du workspace jarvis-v2) : ajouter la ligne `geekoach.jess-vic.ovh` au tableau, et mettre à jour la référence "Guide détaillé dans docs/CLOUDFLARE.md" pour pointer vers ce fichier à la place (proposition à valider avec Victor avant modification, `infra.md` n'étant pas piloté par ce projet).
