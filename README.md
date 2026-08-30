# Wild Odyssey — Site Web

Site vitrine + agenda pour Wild Odyssey. Généré statiquement avec Astro, hébergé sur Azure Static Web Apps, contenu géré via Keystatic CMS.

## Stack

| Outil | Usage |
|---|---|
| [Astro 5](https://astro.build) | Framework statique (pages, i18n, content collections) |
| [Tailwind CSS v4](https://tailwindcss.com) | Styles (via plugin Vite, pas de config file) |
| [Keystatic](https://keystatic.com) | CMS headless — Lionel édite le contenu sans toucher au code |
| [React](https://react.dev) | Uniquement l'interface d'admin Keystatic (`KeystaticAdmin.tsx`, montée en `client:only`). Aucun autre composant React sur le site |
| Azure Static Web Apps | Hébergement + preview environments automatiques sur PR |
| Azure Functions (Node) | API managée `api/` : envoi des leads du formulaire de contact |
| SMTP Infomaniak + nodemailer | Transport des emails (pas d'API email tierce) |

---

## Prérequis

| Prérequis | Détail |
|---|---|
| **Node.js 20 ou 22** | ⚠️ **Node 23+ ne marche pas** avec les Azure Functions Core Tools (nécessaires pour `dev:swa`). Le site seul (`npm run dev`) tourne avec n'importe quelle version récente. |
| **PowerShell** | Utilisé par `npm run dev:swa` (Windows). |
| **Ne pas cloner dans OneDrive / Dropbox** | La synchro verrouille les fichiers et fait échouer les `git checkout` en plein milieu (« Deletion of directory failed »). Cloner par ex. dans `C:\Users\<toi>\perso\`. |

**Node 23+ sans droits admin ?** Poser un Node 22 portable (zip de nodejs.org, aucun installeur) dans
`%LOCALAPPDATA%\wild-odyssey-tools\node-v22.x-win-x64` : `scripts/dev-swa.ps1` le détecte et l'utilise
**uniquement pour ce process**, sans toucher au Node global.

---

## Quick Start

```bash
npm ci
npm run dev        # site seul : http://localhost:4321
```

`npm ci` plutôt que `npm install` : il lit uniquement `package-lock.json` sans refaire la résolution
des versions, ce qui est plus rapide et donne exactement les mêmes versions qu'en CI.

**Le build ne demande aucun secret.** Pas de `.env` à créer : `PUBLIC_UMAMI_SITE_ID` est optionnel
(son absence désactive simplement le tracking) et le scraping d'événements ne touche pas le réseau
tant que `events-cache.json` couvre les URLs. Un clone frais construit le site tel quel.

### Clone rapide

Les dépendances pèsent bien plus lourd que le dépôt : **442 Mo de `node_modules`** contre 130 Mo
d'historique Git. Pour un clone jetable ou un runner, `--depth 1` évite les trois quarts du
téléchargement Git (37 Mo au lieu de 130) — mais prive de `git log` et `git blame`, donc à réserver
aux clones qu'on ne garde pas.

```bash
git clone --depth 1 https://github.com/pollau/wild-odyssey.git && cd wild-odyssey && npm ci && npm run build
```

Pour travailler **sur le formulaire de contact**, il faut le site **et** l'API (voir section suivante) :

```bash
npm run dev:swa    # site + API : http://localhost:4280
```

Si tu viens d'ajouter des événements (URLs dans `src/content/events.json`), lance d'abord le scraping :

```bash
npm run scrape     # fetch JSON-LD depuis les URLs d'événements → met à jour events-cache.json
npm run dev
```

### Toutes les commandes

| Commande | Action |
|---|---|
| `npm run dev` | Site seul, HMR. `/api/*` n'existe pas → le formulaire affiche une erreur 500 (normal) |
| `npm run dev:swa` | **Site + API** via l'émulateur Azure SWA, comme en prod. Ouvrir le port « site » |
| `npm run scrape` | Scrape les nouvelles URLs d'événements (JSON-LD + fallback OG) |
| `npm run build` | Build statique complet (inclut le scraping automatiquement) |
| `npm run preview` | Prévisualisation du build statique local |

---

## Formulaire de contact (API locale)

Le formulaire `/contact` poste sur `POST /api/contact`, une Azure Function (`api/src/functions/contact.js`)
qui valide les champs puis envoie le lead **par SMTP Infomaniak** (`mail.infomaniak.com:587`, nodemailer)
vers `CONTACT_TO`, avec le `Reply-To` sur l'email du prospect.

### Setup local (une fois)

```bash
npm ci                      # racine
npm install --prefix api    # dépendances de la Function (1,6 Mo, inutiles hors formulaire)
cp api/local.settings.json.example api/local.settings.json
```

Puis remplir `api/local.settings.json` (**gitignoré, ne jamais le committer**) :

| Variable | Valeur |
|---|---|
| `SMTP_USER` | `form@wildodyssey.org` (boîte dédiée chez Infomaniak) |
| `SMTP_PASS` | **mot de passe d'application** Infomaniak de cette boîte (pas le mot de passe principal) |
| `CONTACT_TO` | destinataire des leads. En test, mettre son propre email |
| `SMTP_DEBUG` | `true` pour logger tout le dialogue SMTP. **Jamais en production** (l'AUTH y apparaît en base64 déchiffrable) |

> Créer la boîte et son mot de passe d'application se fait dans le Manager Infomaniak :
> Service Mail → adresse → « Ajouter un appareil » / mots de passe d'application. Le mot de passe
> n'est affiché **qu'une fois**.

### En production
Les mêmes variables sont définies dans le portail Azure : Static Web App → **Environment variables**,
**par environnement** (Production et chaque preview de PR ont leur propre jeu).

### Plusieurs clones en parallèle
Les ports de `dev:swa` sont configurables (sinon deux clones se disputent 4280/4321/7071).
Priorité : variable d'environnement > `dev-ports.json` (gitignoré, propre au clone) > défaut.

```json
// dev-ports.json à la racine du 2e clone
{ "devPort": 4322, "swaPort": 4281, "apiPort": 7072 }
```

| Port | Rôle | Défaut |
|---|---|---|
| `swaPort` | **l'URL à ouvrir** (émulateur SWA : site + API) | 4280 |
| `devPort` | serveur Astro derrière l'émulateur | 4321 |
| `apiPort` | runtime Azure Functions | 7071 |

---

## Architecture

### Structure des dossiers

```
src/
├── components/
│   ├── Header.astro          # Navbar fixe avec language picker
│   ├── Footer.astro          # CTA + liens + copyright
│   ├── LanguagePicker.astro  # Sélecteur de langue (fr/en/es)
│   ├── ContactForm.astro     # Formulaire de contact + script client (POST /api/contact)
│   ├── OrganizationSchema.astro # JSON-LD Organization (SEO, sur la homepage)
│   ├── StatCounter.astro     # Chiffre de la section stats, animé au scroll
│   ├── EnvBadge.astro        # Pastille d'environnement hors production
│   ├── ComingSoonToast.astro # Toast des liens pas encore branchés
│   ├── KeystaticAdmin.tsx    # Île React de l'admin CMS (seul composant React)
│   └── pages/
│       └── HomePage.astro    # Sections de la homepage (hero, stats, thèmes, ateliers…)
├── content/
│   ├── activities/           # JSON par atelier (titre, description, image, thème…)
│   ├── events.json           # Liste des URLs d'événements (+ published)
│   ├── events-cache.json     # Cache du scraping, commité
│   └── homepage/
│       └── index.json        # Textes homepage éditables via Keystatic
├── i18n/
│   └── ui.ts                 # Traductions fr/en/es (clés de traduction)
├── layouts/
│   └── Layout.astro          # Wrapper HTML avec Header + Footer
├── pages/
│   ├── index.astro           # Homepage FR (/)
│   ├── [lang]/index.astro    # Homepage EN/ES (/en, /es)
│   ├── contact.astro         # Formulaire FR (/contact)
│   ├── [lang]/contact.astro  # Formulaire EN/ES (/en/contact, /es/contact)
│   ├── evenements.astro      # Agenda public (/evenements)
│   └── keystatic/            # Interface CMS (local dev uniquement)
└── styles/
    ├── global.css            # Variables CSS + reset Tailwind
    └── typography.css        # Polices Fraunces / Aileron (@theme)
api/                          # Azure Functions (API managée SWA)
├── src/functions/contact.js  # POST /api/contact → envoi SMTP du lead
├── host.json                 # Config runtime Functions
└── local.settings.json       # Secrets SMTP en local (GITIGNORÉ)
scripts/
├── scrape-events.mjs         # Script de scraping JSON-LD des événements
└── dev-swa.ps1               # Lance l'émulateur SWA (Node 22 + ports configurables)
public/
└── assets/
    ├── figma/                # Assets exportés depuis Figma (logos, photos, bg)
    └── images/
        ├── activities/       # Photos des thématiques
        ├── brand/            # Logo, wordmark, favicons
        └── contact/          # Visuel de confirmation du formulaire
```

### i18n

- Locale par défaut : **fr** (pas de préfixe URL — `/`)
- Autres locales : **en** (`/en/`), **es** (`/es/`)
- La homepage et la page contact sont traduites. L'agenda (`/evenements`) est FR uniquement.
- Une page qui n'existe pas dans les trois langues ne doit **pas** passer `alternates` au `Layout` :
  sans cette prop, aucun `hreflang` n'est émis et le sélecteur de langue pointe vers la racine de
  chaque locale au lieu d'une URL qui renverrait un 404.
- Traductions dans `src/i18n/ui.ts`

### Content Collections (Astro)

| Fichier | Usage | Éditable via Keystatic |
|---|---|---|
| `src/content/activities/*.json` | Un fichier par atelier | Oui — collection "Workshops" |
| `src/content/homepage/index.json` | Textes homepage | Oui — singleton "Homepage" |
| `src/content/events.json` | Liste de tous les événements | Oui — singleton "Événements" |
| `src/content/events-cache.json` | Cache scraping (auto) | Non — géré par le script |

---

## Système d'événements

### Comment ça marche

Lionel colle juste l'URL d'un événement Eventbrite/BilletWeb/Meetup dans Keystatic. Le site récupère automatiquement les infos au build via JSON-LD (le markup structuré que ces plateformes exposent pour Google).

**`src/content/events.json`** — un seul fichier, liste de toutes les URLs :
```json
{
  "list": [
    { "externalUrl": "https://www.eventbrite.fr/e/...", "published": true },
    { "externalUrl": "https://www.billetweb.fr/...", "published": false }
  ]
}
```

**Cache** (`src/content/events-cache.json`) :
- Généré par `npm run scrape`
- Commité dans git → builds reproductibles même si Eventbrite est down
- Ne re-scrappe que les nouvelles URLs (pas de re-fetch inutile)
- Pour forcer un refresh d'un événement : supprimer son entrée dans `events-cache.json` puis `npm run scrape`

**Données extraites automatiquement** : titre, date début/fin, lieu, description, image.

### Workflow Lionel (content manager)

```
1. Keystatic Cloud → ajouter l'URL de l'événement
2. Commit sur la branche `qa`
3. GitHub Actions: npm run build (inclut le scraping)
4. Azure SWA déploie sur l'environnement nommé « qa » (URL stable)
5. Lionel vérifie /evenements → active published: true si OK
6. PR qa → main → merge → prod
```

---

## Déploiement

### Environnements Azure SWA

| Environnement | Branche | URL | Durée de vie |
|---|---|---|---|
| Production | `main` | https://www.wildodyssey.org | permanente |
| QA (environnement **nommé**) | `qa` | https://ashy-water-05ecdb603-qa.westeurope.1.azurestaticapps.net | **permanente** |
| Previews de PR | toute PR → `main` ou `qa` | URL numérotée générée par Azure | supprimée à la fermeture de la PR |

L'URL de QA est stable par construction (`deployment_environment: qa` dans le workflow) : c'est ce qui
permet de la déclarer **une seule fois** dans Keystatic Cloud, là où une preview de PR change d'URL à
chaque tour. Attention, l'interface Azure range les environnements nommés et les previews de PR dans la
même section : seul le second type est nettoyé automatiquement.

Tout ce qui n'est pas `main` reçoit la pastille d'environnement et un `robots: noindex, nofollow`
(via `PUBLIC_ENV`, voir `src/layouts/Layout.astro`).

> Les variables d'environnement (dont les secrets SMTP) se configurent **par environnement** dans le
> portail Azure : un nouvel environnement de preview démarre sans elles, et le formulaire y renverra
> une 500 tant qu'elles ne sont pas saisies.

### GitHub Actions

Le workflow `.github/workflows/azure-static-web-apps-*.yml` :
- Déclenché sur push `main` et `qa`, et sur les PR ciblant `main` ou `qa`
- Lance `npm run build` (qui inclut `npm run scrape`)
- Déploie le dossier `dist/` (site) et le dossier `api/` (Functions) sur Azure SWA

Sur un événement `pull_request`, la référence Git est `refs/pull/<n>/merge` et non `refs/heads/qa` :
une PR vers `qa` reçoit donc bien une preview éphémère et n'écrase pas l'environnement nommé.
GitHub exécute le workflow issu de la **branche source**, donc une branche antérieure à ce filtre
ne déclenchera rien tant qu'elle n'a pas absorbé `main`.

### Keystatic CMS en prod

Keystatic Cloud utilise l'API GitHub pour committer directement — aucun serveur requis. L'intégration `keystatic()` est actuellement **commentée** dans `astro.config.mjs` : elle injecte des routes `prerender: false` incompatibles avec un build 100 % statique. La réactiver en dev uniquement fait partie du travail en cours sur la branche `qa`.

---

## Ce qui est implémenté

- [x] Homepage avec sections hero, 6 thématiques, formats, stats, 6 raisons, CTA
- [x] i18n fr/en/es sur la homepage et la page contact
- [x] **Formulaire de contact** (`/contact`, fr/en/es) → Azure Function + SMTP Infomaniak
      (honeypot anti-spam, rate limit 5/min/IP, plafonds de longueur, Reply-To sur le prospect)
- [x] Page agenda avec scraping automatique JSON-LD (`/evenements`)
- [x] Header responsive (desktop + mobile burger) avec logo et wordmark
- [x] **SEO** : titres + meta descriptions par page et par langue, `canonical`, `hreflang`
      (fr/en/es + x-default), JSON-LD Organization, sitemap, `robots.txt`
- [x] Keystatic CMS pour ateliers, homepage, et événements
- [ ] Open Graph / Twitter cards + image de partage (aperçu nu au partage LinkedIn/WhatsApp)
- [ ] Favicon définitif (encore un emoji pingouin placeholder → Google affiche un globe générique)
- [ ] Analytics (Umami — variable `PUBLIC_UMAMI_SITE_ID` déjà câblée, site ID à fournir)
- [x] Nettoyage des pages orphelines de l'ancienne itération (`/about`, `/entreprises`, `/scolaire`…)
- [ ] Catalogue ateliers (`/activities`) — l'ancienne page a été supprimée, à refaire
- [ ] i18n de l'agenda
