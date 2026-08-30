# Toute URL inconnue sert le CMS en production — dossier de passation

Date : 2026-08-30
Branche : `fix/404-fallback`, partant de `main`
Statut : diagnostic vérifié en production, correctif à écrire

Ce document est autonome. Il a été écrit pour qu'une autre session reprenne le
travail sans contexte préalable.

## Le symptôme

En production, **toute URL qui ne correspond à aucun fichier construit renvoie
HTTP 200 avec l'interface d'administration Keystatic.** Pas un 404 : la page du CMS.

Vérifié le 30 août sur `https://www.wildodyssey.org` :

| URL | Réponse |
|---|---|
| `/en/evenements/` | 200 + Keystatic |
| `/es/evenements/` | 200 + Keystatic |
| `/entreprises/` | 200 + Keystatic |
| `/jeux/` | 200 + Keystatic |
| `/about/` | 200 + Keystatic |
| `/activities/` | 200 + Keystatic |
| `/nimporte-quoi-qui-nexiste-pas/` | 200 + Keystatic |

Commande de reproduction :

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://www.wildodyssey.org/nimporte-quoi/ && curl -s https://www.wildodyssey.org/nimporte-quoi/ | grep -oi keystatic
```

Le corps fait environ 4 Ko et contient « Keystatic » et « Admin ».

## La cause

`public/staticwebapp.config.json`, servi par Azure Static Web Apps :

```json
{
    "navigationFallback": {
        "rewrite": "/keystatic/index.html",
        "exclude": ["/assets/*", "/images/*", "*.css", "*.js", "*.ico"]
    },
    "routes": [
        { "route": "/keystatic/*", "rewrite": "/keystatic/index.html" }
    ],
    "responseOverrides": {
        "404": { "rewrite": "/404.html" }
    },
    "mimeTypes": { ".json": "application/json" }
}
```

`navigationFallback` est le mécanisme prévu pour les applications à routage client :
Azure sert le fichier indiqué, **en HTTP 200**, pour toute navigation qui ne trouve
pas de fichier. Ici il pointe vers l'admin Keystatic, ce qui fait de cette page le
fourre-tout de tout le site.

Trois conséquences en cascade :

- `responseOverrides["404"]` **ne se déclenche jamais**, `navigationFallback` passant
  avant. Et `404.html` n'existe pas dans le build : il n'y a pas de `src/pages/404.astro`.
- le `Disallow: /keystatic/` du `robots.txt` ne protège plus rien, puisque l'admin est
  servie à toutes les URL inconnues, pas seulement sous `/keystatic/`.
- les moteurs reçoivent un 200 pour un nombre illimité d'URL inexistantes, ce qui est
  la définition du soft-404.

La règle est vraisemblablement là pour faire fonctionner le routage côté client de
Keystatic. Mais **le bloc `routes` fait déjà exactement ça** pour `/keystatic/*`. Le
`navigationFallback` est donc redondant autant que nuisible.

## Le correctif proposé

Trois gestes, à vérifier ensemble :

1. **Créer `src/pages/404.astro`**, avec le `Layout` du site pour garder l'en-tête, le
   pied de page et les polices. Astro en produit `dist/404.html`, ce que
   `responseOverrides` attend déjà.

2. **Supprimer le bloc `navigationFallback`** de `public/staticwebapp.config.json`.
   Sans lui, Azure renvoie un vrai 404 pour les URL inconnues, et `responseOverrides`
   sert alors la page personnalisée **avec le bon code HTTP**.

3. **Conserver le bloc `routes`** tel quel : c'est lui qui fait vivre le routage
   interne de l'admin Keystatic (`/keystatic/collection/...` et consorts).

### Le point à vérifier, pas à supposer

Je n'ai pas testé ce correctif contre Azure. L'hypothèse à valider est que **le bloc
`routes` suffit seul au routage client de Keystatic**, une fois `navigationFallback`
retiré. Si l'admin se met à casser sur ses sous-chemins, l'alternative est de garder
`navigationFallback` en le faisant pointer vers `/404.html` — on perd alors le code
HTTP 404 (Azure sert en 200) mais on retrouve une page correcte pour l'utilisateur.
Le vrai 404 est préférable, l'essayer d'abord.

## Comment vérifier

`astro dev` et `astro preview` **ignorent `staticwebapp.config.json`** : ce fichier
n'est lu que par Azure et par son émulateur. Deux façons de tester :

**En local**, avec l'émulateur SWA :

```bash
npm run dev:swa
```

Puis, sur le port « site » qu'il annonce (4280 par défaut) :

- `/nimporte-quoi/` doit renvoyer **404** et afficher la page 404 du site
- `/keystatic/` doit afficher l'admin
- `/keystatic/collection/thematics` doit afficher l'admin, pas un 404
- `/`, `/contact`, `/evenements` doivent répondre normalement

**En preview de PR** : une PR vers `main` déploie un environnement Azure éphémère qui
lit le vrai fichier de configuration. C'est la validation qui compte, l'émulateur
n'étant qu'une approximation.

## Ce qu'il faut savoir du dépôt

- Site **Astro 5 statique**, hébergé sur **Azure Static Web Apps**, contenu géré par
  **Keystatic**. Trois langues : `fr` sans préfixe d'URL, `en` et `es` préfixées.
- Le workflow `.github/workflows/azure-static-web-apps-*.yml` déploie sur push vers
  `main` (production) et vers `qa` (environnement nommé à URL stable), et crée une
  preview éphémère pour toute PR vers l'une ou l'autre.
- **Pas de framework de test**, par choix. On vérifie par build et inspection du HTML
  produit. Ne pas en introduire.
- `npm ci` plutôt que `npm install`. Le build ne demande aucun secret.
- Pour les boucles de vérification, `npx astro build` suffit et évite le scraping
  d'événements que `npm run build` lance d'abord.
- Astro compresse le HTML : compter les occurrences avec `grep -o … | wc -l`, jamais
  avec `grep -c`, qui compte les lignes.
- Vocabulaire du projet : **thematic** et **session**. « Format » et « workshop » ne
  doivent plus apparaître.
- Messages de commit en français, préfixe conventionnel.

## Travaux voisins, à ne pas confondre

**`fix/language-picker-404`** — branche poussée, non mergée. Le sélecteur de langue
construisait ses liens depuis le chemin courant sans savoir si la page existait dans
les autres langues : sur `/evenements`, page française seulement, il proposait
`/en/evenements`. Le correctif fait descendre la prop `alternates` du `Layout`
jusqu'au sélecteur, qui pointe alors vers la racine de chaque locale.

Les deux sujets sont complémentaires et indépendants. Le sélecteur empêche le site de
**fabriquer** des URL inexistantes ; le présent chantier corrige ce qui se passe
quand une URL inconnue arrive quand même, quelle qu'en soit la provenance.

**`feat/universite-cms`** — branche partant de `qa`, portant le design d'une page
université pilotée par le CMS. Sans rapport.

## Contexte de découverte

Le sujet est apparu en vérifiant l'impact réel du bug du sélecteur de langue. On
croyait à un 404 ; la production a répondu 200 avec le CMS, ce qui a fait remonter la
cause commune. Les pages `/entreprises`, `/jeux`, `/about` et `/activities` citées
plus haut sont d'anciennes pages supprimées de `main` le 30 août : elles ne sont plus
dans le sitemap, mais restent probablement dans l'index des moteurs et dans
d'éventuels signets, et servent donc le CMS à qui les visite.
