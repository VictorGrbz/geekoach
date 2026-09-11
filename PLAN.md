# PLAN.md — Geekoach

Portail web personnel de coaching sportif pour la perte de poids, à usage strictement individuel (Victor, seul utilisateur). Combine suivi structuré, coach conversationnel (API Gemini, tier gratuit) et gamification complète façon JRPG.

## Cadrage produit

### Vision métier

Geekoach est un portail web personnel destiné à un usage strictement individuel (Victor, seul utilisateur, pas de multi-utilisateur). Il répond à un problème concret : Victor veut perdre du poids mais n'a pas d'appétence pour le sport en tant que tel, ce qui rend la motivation et la régularité difficiles à maintenir dans la durée. Le portail combine trois leviers pour y répondre :
- un suivi structuré et factuel (poids, séances, progression) qui sert lui-même de moteur de motivation par la visualisation de la tendance,
- un coach conversationnel (API Gemini, tier gratuit) qui connaît en permanence le profil, l'équipement et le temps disponible de Victor, sans qu'il ait besoin de tout répéter à chaque échange,
- une couche de gamification complète inspirée des jeux vidéo et des animes (XP, niveaux, quêtes, arcs narratifs, boss fights, streaks, achievements), pour transformer la progression sportive en un système de progression que Victor trouve intrinsèquement motivant.

Ce n'est pas un produit à vendre ni à démontrer à un tiers : c'est un outil d'usage personnel.

### Cas d'usage concrets

1. Victor rentre du travail, ouvre le chat et dit "j'ai 20 min, pas d'équipement" — le coach lui propose une séance adaptée à son équipement et son temps disponible sans qu'il ait à repréciser son profil.
2. Victor pèse le matin et enregistre son poids — la courbe se met à jour, et au prochain échange le coach commente sa tendance (plateau, régression, progression) sans qu'il ait à lui réexpliquer où il en est.
3. Victor termine une séance — il gagne de l'XP et avance dans une quête de la semaine ; au bout d'un arc de 4 à 6 semaines, il affronte un boss fight (défi plus intense) qui clôt le cycle.

### Critères de succès mesurables

- **Critère technique (bout en bout)** : le parcours complet fonctionne réellement — enregistrer un poids, logger une séance, échanger avec le coach qui adapte sa réponse au profil/équipement/temps sans répétition, voir l'XP et la progression de gamification évoluer en conséquence.
- **Critère d'usage dans la durée** : une tendance de poids et de séances est visible et effectivement consultée par Victor sur la durée (pas de chiffre cible rigide type "X séances/semaine") — le suivi lui-même, quand il est consulté régulièrement, constitue le signal de réussite recherché.

### Hors périmètre

- Pas de multi-utilisateur, pas de fonctionnalités sociales ou de partage.
- Pas d'intégration avec des objets connectés / wearables.
- Pas de système d'authentification complexe (Cloudflare Access suffit, voir Étape 6).

**Divergence actée par rapport au cahier des charges initial** : celui-ci recommandait de prioriser XP/niveaux + quêtes comme socle V1 et de reporter le reste (arcs narratifs, boss fights, streaks/combo, achievements) en itération suivante. Victor a explicitement demandé l'inverse : toute la couche de gamification est intégrée dès la V1, sans report, car il vise une version définitive rapidement.

**Exigence transverse** : le profil utilisateur (objectifs de poids, échéance, équipement, contraintes de santé) doit pouvoir être modifié de deux façons : via un formulaire d'édition classique (Étape 1), et via une vraie conversation en langage naturel avec le coach (Étape 4) — le coach doit comprendre une information de profil donnée au fil de l'échange et l'intégrer, sans que ce soit un simple remplissage de champs déguisé en chat.

**Arbitrage confidentialité vs coût (acté avec Victor)** : le projet utilise l'API Gemini en tier gratuit plutôt que l'API Claude (payante). Sur ce tier gratuit, Google peut utiliser les échanges (y compris les données de profil et de santé injectées en contexte) pour améliorer ses modèles — ce n'est pas le cas sur un tier payant. Le coût réel de l'API Claude à ce volume d'usage aurait été négligeable (~0,70€/mois estimé), donc ce choix privilégie la gratuité totale plutôt qu'un gain financier réel. Victor a validé ce compromis en connaissance de cause.

## Stack technique

- **Frontend/backend** : Next.js, hébergé sur le serveur maison (Coolify + Cloudflare Tunnel, ProDesk). Pas de repli Vercel.
- **Base de données** : PostgreSQL self-hosted (Coolify) — même pattern que `demo-reservation-btp`.
- **Coach conversationnel** : API Google Gemini, **tier gratuit**, modèle **Gemini 2.5 Flash** par défaut (10 requêtes/min, 250/jour — largement suffisant pour un usage solo quotidien). SDK officiel Google (`@google/genai` en TypeScript). Clé API (`GEMINI_API_KEY`, générée via Google AI Studio) à stocker en variable d'environnement Coolify, jamais dans le chat ni committée. À noter : sur le tier gratuit, Google peut utiliser les échanges pour améliorer ses modèles (voir "Arbitrage confidentialité vs coût" ci-dessus), et les quotas gratuits peuvent être réduits par Google sans préavis — à surveiller si l'usage réel s'avère plus intensif que prévu.
- **Graphiques** : [Recharts](https://recharts.org/) pour les courbes de poids et de séances — léger, bien maintenu, s'intègre nativement à React/Next.js.
- **Accès distant** : sous-domaine dédié `geekoach.jess-vic.ovh` (Cloudflare Tunnel) protégé par **Cloudflare Access** limité à `victor.garbez@gmail.com` — même pattern que `jess-vic.ovh/priv/nous`. Accessible depuis mobile et PC, sans construire de vrai système d'authentification.

## Étape 0 : initialisation du dépôt Git

- **Objectif** : créer le dépôt Git dédié avant tout code.
- **Fichiers concernés** : ce `PLAN.md`.
- **Destination** : dépôt GitHub `geekoach` (public).
- **Critère de fait** : `git init` exécuté dans le dossier du projet, `gh repo create geekoach --public --source=. --remote=origin --push` exécuté, premier commit poussé (ce `PLAN.md` suffit pour démarrer).

La commande `/commit` est installée globalement (`~/.claude/commands/`) : sers-t'en pour tous les commits et push suivants. Le Jarvis racine ne touche plus au cycle de vie Git de ce projet après cette étape.

## Étape 1 : structure de données (profil + suivi) et formulaire de profil

- **Objectif** : mettre en place le schéma PostgreSQL (profil utilisateur, entrées de poids horodatées, séances avec type/durée/exercices/ressenti) et un formulaire d'édition du profil accessible dans le portail (objectifs de poids/échéance, équipement disponible, contraintes de santé, préférences — champs à structure flexible, remplissables progressivement).
- **Fichiers concernés** : schéma/migrations PostgreSQL, page/route d'édition de profil.
- **Destination** : `livrables/sites-web/geekoach/`.
- **Critère de fait** : le profil peut être créé et modifié via le formulaire, les données persistent en base, une entrée de poids et une séance peuvent être enregistrées.

## Étape 2 : Direction artistique — obtenir le contrat visuel

L'identité visuelle est centrale au projet (gamification RPG, arcs narratifs, boss fights) : elle a été co-rédigée avec Victor en amont plutôt que proposée en solo.

**Prompt de Direction Artistique validé par Victor :**

> Portail web personnel de coaching sportif gamifié, ambiance **JRPG rétro-arcade synthwave**. L'interface doit se sentir comme un jeu vidéo rétro qu'on ouvre pour suivre sa progression, pas comme une app de fitness classique.
>
> - **Références directes** : Final Fantasy et Kingdom Hearts (spectacle JRPG, écrans de statut/combat, effets de progression), Tensei shitara Slime Datta Ken / "Moi quand je me réincarne en Slime" (écrans de statut/rang, progression d'évolution façon guilde), Hollow Knight et Hollow Knight: Silksong (direction artistique atmosphérique, HUD minimaliste et soigné, palette sombre maîtrisée).
> - **Palette** : fond sombre dominant, accents néon (violet/magenta, cyan, rose synthwave) façon écran d'arcade ou couverture d'anime 80s. Contrastes forts, pas de mode clair.
> - **Typographie** : une police pixel/8-bit pour les éléments de jeu (titres, HUD, niveaux, XP) combinée à une police lisible pour le contenu long (historique, formulaires) — l'esthétique rétro ne doit pas nuire à la lisibilité du suivi quotidien.
> - **Éléments d'interface façon JRPG** : barres de vie/XP animées, cadres de menu à la bordure marquée (style fenêtre de dialogue JRPG), icônes de statut/niveau, fanfare visuelle au level-up.
> - **Ambiance** : touches d'arcade rétro (grille synthwave en fond, légers effets scanline/glow néon) sans tomber dans le cliché "gaming RGB" générique — l'inspiration est plus JRPG 16-bit + esthétique synthwave + minimalisme atmosphérique (Hollow Knight) que setup gamer.
> - **Moments clés à styliser distinctement** : level-up, validation de quête, boss fight, enregistrement de séance/poids.
> - Le suivi de données (courbes, historique) reste lisible et exploitable en toutes circonstances : l'habillage rétro ne doit jamais nuire à la lecture des graphiques.

Sous-étapes (tracées ici, exécutées par l'Artisan/Victor, jamais par le Jarvis racine) :
1. **Objectif** : obtenir un brief de direction confirmé. **Fichiers concernés** : le prompt ci-dessus. **Destination** : `/impeccable shape` côté Artisan. **Critère de fait** : prompt validé par Victor — fait, ci-dessus.
2. L'Artisan lance `/impeccable shape` avec ce prompt comme point de départ → obtient un brief de direction confirmé (texte, pas de code, pas de maquette). **Fait, avec divergence** : le prompt synthwave/néon ci-dessus n'a pas convaincu Victor à l'usage (jugé trop générique/cliché). Reprise via le processus de découverte d'Impeccable (`concept-seed.mjs`, plusieurs tirages), pour finalement retenir une direction ancrée sur une référence nommée explicitement par Victor : **Hollow Knight — la carte de Hallownest**. Le portail se lit comme une carte de cartographe qu'on complète à l'encre à mesure qu'on l'explore (régions = Profil/Poids/Séances/Quêtes/Coach, voilées de brume tant que vides, scellées une fois un objectif atteint). Palette gris-bleu patiné + halo cyan pâle unique (pas de multi-néon), typo gravée pour les titres + police lisible pour le contenu. Contexte produit durable capturé dans `PRODUCT.md` (nouveau fichier, écrit via `/impeccable init`).

   **Correction actée à l'Étape 3** : la maquette Claude Design (sous-étape 3 ci-dessous) ajoutait une 6e région "Sommeil" de son propre chef. Victor ne la souhaite pas — c'était une liberté prise par Claude Design, pas une demande de Victor ni une décision actée ici. Retirée du build ; la carte s'arrête à 5 régions (Profil/Poids/Séances/Quêtes/Coach).
3. Victor soumet ce brief à Claude Design (claude.ai) pour générer une maquette haute-fidélité, itère jusqu'à validation visuelle, puis dépose l'image finale dans `.impeccable/mocks/external/`. **Fait** : `Coach Sportif.png` déposé et validé par Victor (écran d'accueil "Carte de progression").
4. L'Artisan reprend la main avec cette image comme référence approuvée et construit dessus : un mock approuvé par Victor est traité comme un contrat visuel (reproduction quasi pixel-perfect), quelle que soit son origine. **Fait** — voir Étape 3 ci-dessous.

Note pour l'Artisan : sans clé `OPENAI_API_KEY` configurée, Impeccable ne génère aucune vraie image en interne (uniquement palette + texte) — c'est pour ça que le brief part vers Claude Design plutôt que de compter sur la génération native d'Impeccable, gratuite via l'abonnement Pro déjà payé. La maquette de Claude Design est statique : pour toute animation ou interaction qu'elle ne capture pas (glow, scanlines, animation de barre XP, transition de level-up), l'Artisan doit chercher une librairie prête à l'emploi (GSAP, AOS, UIverse, Aceternity UI/Magic UI) plutôt que coder l'effet from scratch, avec une recherche web ciblée si besoin d'un effet précis non couvert.

## Étape 3 : interface de suivi avec graphiques — Fait

- **Objectif** : pages de saisie (poids, séances) et visualisation (courbes Recharts d'évolution du poids, fréquence des séances, tendances), historique consultable et filtrable dans le temps — construites sur le contrat visuel de l'Étape 2.
- **Fichiers concernés** : pages/composants de suivi, composants graphiques Recharts.
- **Destination** : `livrables/sites-web/geekoach/`.
- **Critère de fait** : logger un poids ou une séance met à jour les courbes en temps réel, l'historique est filtrable par période.

**Fait** — reprise du mock approuvé (`Coach Sportif.png`) comme contrat visuel quasi pixel-perfect, étendu aux pages que le mock ne montrait pas directement :
- Accueil "Carte de Progression" : régions I (Profil), II (Poids), III (Séances) branchées sur la base réelle ; régions IV (Quêtes) et V (Coach) affichées honnêtement "sous la brume" en attendant les Étapes 5 et 4.
- Pages `/poids` et `/seances` : formulaire, graphique Recharts (ligne de poids + ligne d'objectif en pointillés ; barres de fréquence des séances), historique filtrable par période, état vide "sous la brume" quand la base est vide.
- Page `/profil` restylée dans le même langage visuel.
- Revue finale Impeccable : **ship**, après un tour de correctifs (fond ardoise trop sombre par rapport au mock, eyebrows retirés car interdits par la charte qualité même si présents dans le mock, bandeau "région scellée" à double anneau, preuve manquante recapturée).
- `DESIGN.md` rédigé à partir du système livré (palette, typographie, composants, règles nommées : *The One Halo Rule*, *The Tracked-Label Rule*, *The No-Shadow Rule*).
- Bug corrigé au passage : `echeance` (colonne DATE) remontait de Postgres en objet `Date` et non en string, faisait planter la page Profil dès qu'une échéance était enregistrée (`src/db/profil.ts`).
- Dette de type flaggée par le hook Impeccable après coup (tailles de police en dur dupliquées dans 6 fichiers) : corrigée en introduisant deux tokens Tailwind nommés (`text-label` = 0.65rem, `text-label-sm` = 0.6rem) plutôt que suppressée.
- `recharts` ajouté aux dépendances.
- Rien n'est commité (le cycle Git de ce projet passe par `/commit`, jamais déclenché automatiquement) — à faire par Victor quand il le souhaite.

## Étape 4 : chat coach conversationnel (API Gemini)

- **Objectif** : interface de chat qui injecte automatiquement à chaque échange le profil, l'équipement disponible, le temps disponible du jour et l'historique récent (séances, tendance de poids) en contexte. Le coach propose des séances adaptées à l'équipement/temps disponible, ajuste ses propositions selon la progression réelle (plateau, régression, progression rapide), et peut mettre à jour un champ du profil énoncé en langage naturel dans la conversation (extraction structurée depuis le chat).
- **Fichiers concernés** : route API de chat, service d'appel SDK Google Gemini (`@google/genai`), configuration `GEMINI_API_KEY` en variable d'environnement Coolify.
- **Destination** : `livrables/sites-web/geekoach/`.
- **Critère de fait** : le coach répond en tenant compte du profil/équipement/temps sans que Victor ait à les répéter, adapte ses propositions à la tendance de progression, et une information de profil donnée en langage naturel dans le chat est bien répercutée dans le profil structuré.

Note pour l'Artisan : cette étape gagnerait à être menée avec des subagents Explore/Plan pour l'architecture d'injection de contexte et la gestion du volume de requêtes sous le quota gratuit (250/jour) plutôt qu'en direct.

**Code écrit, non encore vérifié de bout en bout** — implémenté via subagents Explore/Plan comme suggéré ci-dessus :
- Table `messages` ajoutée au schéma (historique de conversation, persistant pour un accès mobile/PC cohérent).
- `src/lib/coach-context.ts` injecte à chaque appel le profil, la tendance de poids (`classerTendance`, nouvelle fonction dans `src/lib/stats.ts`) et les séances récentes ; règle explicite dans le prompt système : le temps disponible du jour n'est pas stocké, à redemander s'il n'a pas été donné dans la conversation en cours.
- Mise à jour de profil en langage naturel via function calling Gemini (mode AUTO, outil `update_profil` en deltas additifs/soustractifs plutôt qu'en remplacement de champ) — `src/lib/profil-merge.ts` fait la fusion réelle et génère la confirmation, jamais le texte du modèle telle quelle ; passe par `upsertProfil` (`src/db/profil.ts`), le même chemin que le formulaire `/profil`.
- Route `src/app/api/chat/route.ts` (non streamée), garde-fou quota quotidien (seuil de sécurité à 230 requêtes/jour) + désactivation du bouton d'envoi pendant une requête côté UI.
- Page `/coach` (`src/components/chat-panel.tsx`) dans le langage visuel existant (liste `divide-y`, labels tracés Cinzel, pas de bulles colorées). Région V de l'accueil : ne montre plus jamais "sous la brume", remplacée par un aperçu du dernier échange ou un CTA vers `/coach`.
- `@google/genai` ajouté aux dépendances, `GEMINI_API_KEY` documentée dans `.env.example`.
- **Reste à faire par Victor avant de considérer l'étape faite** : exécuter `npm run db:migrate` une fois le tunnel SSH vers Postgres actif (la table `messages` n'a pas pu être créée depuis cette session, tunnel non monté), obtenir une clé sur Google AI Studio et la renseigner dans `.env.local` (placeholder vide déjà présent), puis vérifier manuellement les critères de fait (réponse tenant compte du profil sans répétition, mise à jour de profil en langage naturel bien répercutée sur `/profil`, commentaire de tendance, persistance de l'historique au rechargement).
- Rien n'est commité (même règle qu'à l'Étape 3 : cycle Git via `/commit`, à faire par Victor quand il le souhaite).

## Étape 5 : gamification complète (V1 sans report)

- **Objectif** : implémenter dès la V1 l'intégralité de la couche de gamification — système de niveaux et d'XP, quêtes quotidiennes/hebdomadaires avec récompenses, arcs narratifs (cycles de 4-6 semaines avec thème et objectif clé), boss fights (défi mensuel clôturant un arc), streaks/combo (régularité, cassure en cas d'arrêt), succès/achievements à des jalons. Habillée dans l'identité visuelle JRPG rétro-arcade synthwave de l'Étape 2.
- **Fichiers concernés** : modèles de données de gamification, logique de calcul XP/niveaux/streaks, UI dédiée (barres XP, cadres de quête, écran de boss fight, écran de succès).
- **Destination** : `livrables/sites-web/geekoach/`.
- **Critère de fait** : chaque séance/objectif complété rapporte de l'XP visible et peut faire monter de niveau, une quête peut être suivie et validée, un arc peut se clore par un boss fight, un streak est suivi et peut se casser, un achievement peut se débloquer à un jalon.

Note pour l'Artisan : étape la plus lourde en architecture (plusieurs systèmes de progression interdépendants) — subagents Explore/Plan recommandés pour concevoir le modèle de données avant d'implémenter.

## Étape 6 : accès distant sécurisé

- **Objectif** : exposer le portail sur `geekoach.jess-vic.ovh` (Cloudflare Tunnel) protégé par Cloudflare Access limité à `victor.garbez@gmail.com`, pour un accès mobile et PC depuis n'importe où sans système d'authentification applicatif.
- **Fichiers concernés** : configuration Coolify (déploiement + sous-domaine), politique Cloudflare Access.
- **Destination** : infrastructure self-hosted (voir `context/infra.md`, à mettre à jour une fois cette étape faite).
- **Critère de fait** : le portail est accessible depuis un mobile hors réseau local uniquement après authentification Cloudflare Access.

## Étape 7 : Finalisation

- **Objectif** : rattraper les clichés génériques (polices/motifs surexploités, anti-patterns) que le passage par Claude Design ne filtre pas lui-même.
- **Fichiers concernés** : ensemble du projet.
- **Destination** : `livrables/sites-web/geekoach/`.
- **Critère de fait** : `/finaliser` exécuté (audit → critique → validation → polish → doctor côté Impeccable) avant toute mise en accès distant définitive.

## Vérification automatique

- [ ] Proposer un hook `PostToolUse` adapté à la stack Next.js/TypeScript (ex. `tsc --noEmit` + `next lint` après édition de fichiers `.ts`/`.tsx`), à configurer dans `.claude/settings.json` avant que l'Artisan commence.
