# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Victor, seul utilisateur (pas de multi-utilisateur, pas de fonctionnalités sociales ou de partage). Veut perdre du poids mais n'a pas d'appétence pour le sport en tant que tel — motivation et régularité difficiles à maintenir dans la durée.

## Product Purpose

Aider Victor à perdre du poids durablement en combinant suivi factuel (poids, séances, progression), coaching conversationnel contextualisé et gamification JRPG complète, pour transformer une activité qu'il n'apprécie pas intrinsèquement en système de progression qu'il trouve motivant. Succès : le parcours complet fonctionne bout en bout (peser → logger une séance → discuter avec le coach → voir l'XP et la gamification évoluer), et le suivi de poids/séances est effectivement consulté par Victor sur la durée.

## Positioning

Geekoach se distingue par deux mécanismes que peu d'apps combinent : (1) un coach conversationnel qui connaît en permanence le profil, l'équipement et le temps disponible de Victor, sans qu'il ait à tout répéter à chaque échange ; (2) une couche de gamification JRPG complète (XP, niveaux, quêtes, arcs narratifs, boss fights, streaks, achievements) intégrée dès la V1, sans report — divergence assumée par rapport au cahier des charges initial, qui recommandait de prioriser XP/niveaux + quêtes et de reporter le reste.

## Operating Context

Usage solo quotidien, accessible depuis mobile et PC via `geekoach.jess-vic.ovh` (Cloudflare Tunnel + Cloudflare Access, limité à `victor.garbez@gmail.com`). Scénarios types : Victor pèse le matin et enregistre son poids ; il rentre du travail et log une séance ou ouvre le chat pour demander une séance adaptée à son équipement/temps disponible du moment ; il termine une séance, gagne de l'XP, avance dans une quête, et affronte un boss fight au terme d'un arc de 4 à 6 semaines.

## Capabilities and Constraints

- Mono-utilisateur strict : pas de social, pas de partage, pas d'intégration wearables/objets connectés.
- Pas de système d'authentification applicatif — Cloudflare Access suffit (voir Operating Context).
- Coach conversationnel via API Google Gemini, tier gratuit, modèle Gemini 2.5 Flash (10 req/min, 250/jour). Arbitrage confidentialité/coût déjà acté avec Victor : sur ce tier gratuit, Google peut utiliser les échanges — y compris les données de profil et de santé injectées en contexte — pour améliorer ses modèles ; ce n'est pas le cas sur un tier payant, mais Victor a validé ce compromis en connaissance de cause pour la gratuité totale.
- Gamification complète (niveaux/XP, quêtes, arcs narratifs, boss fights, streaks, achievements) livrée dès la V1, sans report à une itération suivante.
- Le profil (objectifs de poids, échéance, équipement, contraintes de santé) doit être modifiable de deux façons : formulaire d'édition classique, et conversation en langage naturel avec le coach (extraction structurée d'une information de profil énoncée au fil de l'échange — pas un simple remplissage de champs déguisé en chat).
- Stack déjà en place : Next.js (App Router, TypeScript), PostgreSQL self-hosted (Coolify, pattern repris de `demo-reservation-btp`), hébergement self-hosted (Coolify + Cloudflare Tunnel, ProDesk) — pas de repli Vercel. Graphiques prévus via Recharts.

## Brand Commitments

Nom du produit : **Geekoach** (cohérent avec le nom du dépôt GitHub `VictorGrbz/geekoach`), à utiliser tel quel dans l'interface (titres, header, etc.).

## Evidence on Hand

Projet en tout début de vie : aucune donnée réelle encore enregistrée (profil, poids, séances vides). Pas de contenu, témoignage ou preuve à préserver ni à inventer à ce stade.

## Product Principles

1. Le suivi de données (courbes, historique) reste lisible et exploitable en toutes circonstances — l'habillage rétro ne doit jamais nuire à la lecture des graphiques.
2. Le coach ne fait jamais répéter à Victor une information qu'il a déjà donnée (profil, équipement, temps disponible).
3. La gamification reflète toujours une action réelle (séance loguée, objectif atteint) — jamais cosmétique ou déconnectée du suivi factuel.
4. La confidentialité déjà négociée est non négociable en exécution : clé API et données de santé restent en variable d'environnement, jamais dans le chat ni committées.
