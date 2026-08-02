# Wild Odyssey — Site Web

Site vitrine + agenda pour Wild Odyssey. Généré statiquement avec Astro, hébergé sur Azure Static Web Apps, contenu géré via Keystatic CMS.

## Stack

| Outil | Usage |
|---|---|
| [Astro 5](https://astro.build) | Framework statique (pages, i18n, content collections) |
| [Tailwind CSS v4](https://tailwindcss.com) | Styles (via plugin Vite, pas de config file) |
| [Keystatic](https://keystatic.com) | CMS headless — Lionel édite le contenu sans toucher au code |
| [React](https://react.dev) | Composants interactifs (LanguagePicker) |
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
npm install
npm run dev        # site seul : http://localhost:4321
```

Pour travailler **sur le formulaire de contact**, il faut le site **et** l'API (voir section suivante) :

```bash
npm run dev:swa    # site + API : http://localhost:4280
```

Si tu viens d'ajouter des événements (fichiers JSON dans `src/content/events/`), lance d'abord le scraping :

```bash
npm run scrape     # fetch JSON-LD depuis les URLs d'événements → met à jour _cache.json
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
npm install                 # racine
npm install --prefix api    # dépendances de la Function
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
│   └── pages/
│       └── HomePage.astro    # Sections de la homepage (hero, stats, thèmes, ateliers…)
├── content/
│   ├── activities/           # JSON par atelier (titre, description, image, thème…)
│   ├── events/               # JSON par événement (URL + published) + _cache.json
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
│   ├── activities/           # Catalogue ateliers
│   └── keystatic/            # Interface CMS (local dev uniquement)
└── styles/
    └── global.css            # Variables CSS + reset Tailwind
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
- Seule la homepage est traduite. Les autres pages (événements, ateliers) sont FR uniquement.
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
1. Keystatic Cloud → créer un événement (slug + URL)
2. Commit sur branche `staging`
3. GitHub Actions: npm run build (inclut le scraping)
4. Azure SWA déploie sur l'env staging (URL fixe pour QA)
5. Lionel vérifie /evenements → active published: true si OK
6. PR staging → main → merge → prod
```

---

## Déploiement

### Environnements Azure SWA

| Environnement | Branche | URL |
|---|---|---|
| Production | `main` | https://www.wildodyssey.org |
| Staging | `staging` | URL fixe Azure SWA (voir Azure Portal) |
| PR previews | toute PR → `main` | URL auto générée par Azure SWA |

> Les variables d'environnement (dont les secrets SMTP) se configurent **par environnement** dans le
> portail Azure : un nouvel environnement de preview démarre sans elles, et le formulaire y renverra
> une 500 tant qu'elles ne sont pas saisies.

### GitHub Actions

Le workflow `.github/workflows/azure-static-web-apps-*.yml` :
- Déclenché sur push `main` et `staging`, et sur toutes les PRs
- Lance `npm run build` (qui inclut `npm run scrape`)
- Déploie le dossier `dist/` (site) et le dossier `api/` (Functions) sur Azure SWA

### Keystatic CMS

Le CMS permet à Lionel de modifier le contenu sans toucher au code, depuis
**https://www.wildodyssey.org/keystatic**.

**Pourquoi c'est monté ainsi.** L'intégration `keystatic()` injecte des routes
`prerender: false`, incompatibles avec un build statique. Elle n'est donc activée
**qu'en dev** (`astro.config.mjs`, via `NODE_ENV`). En prod, l'admin est une page
pré-rendue (`src/pages/keystatic/`) qui charge l'UI React côté navigateur ; le
rewrite `/keystatic/*` de `staticwebapp.config.json` assure la navigation interne.
En mode cloud, le navigateur parle directement à Keystatic Cloud et à l'API GitHub :
aucun serveur requis.

**Stockage** (`keystatic.config.ts`) :

| Contexte | Mode | Effet |
|---|---|---|
| `npm run dev` | `local` | écrit directement dans les fichiers du repo |
| `npm run dev:cms` | `cloud` | teste le vrai parcours de Lionel depuis `127.0.0.1` |
| Production | `cloud` | commits GitHub via Keystatic Cloud |

**Workflow de Lionel** (une faute de frappe à corriger) :

```
1. https://www.wildodyssey.org/keystatic → se connecter (Keystatic Cloud)
2. Choisir une branche dans le sélecteur en haut à gauche, ou « New branch… »
3. Corriger le texte, Enregistrer (autant de fois que voulu, sur plusieurs sessions)
4. « Create pull request » quand le lot est prêt
5. Azure crée automatiquement un environnement de preview (URL dans la PR)
6. Vérifier sur cette URL, puis merger la PR → prod
```

Le sélecteur liste **toutes** les branches du repo (pas de `branchPrefix`, qui
filtrerait la liste et empêcherait de reprendre une branche existante). Corollaire :
les nouvelles branches ne sont pas préfixées automatiquement, autant leur donner un
nom parlant. La **protection de branche sur `main`** est le garde-fou qui empêche
techniquement d'écrire en prod : Keystatic impose alors de créer une branche.

**Prérequis côté comptes** : un compte GitHub avec **accès en écriture au repo**
suffit (vérifié : pas d'invitation séparée à faire sur Keystatic Cloud). Sans le droit
d'écriture, la lecture fonctionne mais l'enregistrement échoue avec un message peu clair.
Les URLs autorisées à s'authentifier se déclarent dans les réglages du projet Cloud
(prod + `127.0.0.1` via l'option « Allow local development »). Les URLs de preview
étant dynamiques, l'édition se fait toujours depuis la prod ; les previews servent
uniquement à relire le résultat.

---

## Ce qui est implémenté

- [x] Homepage avec sections hero, 6 thématiques, formats, stats, 6 raisons, CTA
- [x] i18n fr/en/es sur la homepage et la page contact
- [x] **Formulaire de contact** (`/contact`, fr/en/es) → Azure Function + SMTP Infomaniak
      (honeypot anti-spam, rate limit 5/min/IP, plafonds de longueur, Reply-To sur le prospect)
- [x] Catalogue ateliers (`/activities`)
- [x] Page agenda avec scraping automatique JSON-LD (`/evenements`)
- [x] Header responsive (desktop + mobile burger) avec logo et wordmark
- [x] **SEO** : titres + meta descriptions par page et par langue, `canonical`, `hreflang`
      (fr/en/es + x-default), JSON-LD Organization, sitemap, `robots.txt`
- [x] Keystatic CMS pour ateliers, homepage, et événements
- [ ] Open Graph / Twitter cards + image de partage (aperçu nu au partage LinkedIn/WhatsApp)
- [ ] Favicon définitif (encore un emoji pingouin placeholder → Google affiche un globe générique)
- [ ] Analytics (Umami — variable `PUBLIC_UMAMI_SITE_ID` déjà câblée, site ID à fournir)
- [ ] Pages `/ongs` et `/workshops` (clés de nav présentes, pages inexistantes)
- [ ] Nettoyage des pages orphelines (`/about`, `/entreprises`, `/scolaire`…, non liées)
- [ ] i18n événements/ateliers
