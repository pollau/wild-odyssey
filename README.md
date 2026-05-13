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

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:4321
```

Si tu viens d'ajouter des événements (fichiers JSON dans `src/content/events/`), lance d'abord le scraping :

```bash
npm run scrape     # fetch JSON-LD depuis les URLs d'événements → met à jour _cache.json
npm run dev
```

### Toutes les commandes

| Commande | Action |
|---|---|
| `npm run dev` | Serveur dev avec HMR — contenu rechargé à chaud |
| `npm run scrape` | Scrape les nouvelles URLs d'événements (JSON-LD + fallback OG) |
| `npm run build` | Build statique complet (inclut le scraping automatiquement) |
| `npm run preview` | Prévisualisation du build statique local |

---

## Architecture

### Structure des dossiers

```
src/
├── components/
│   ├── Header.astro          # Navbar fixe avec language picker
│   ├── Footer.astro          # CTA + liens + copyright
│   ├── LanguagePicker.astro  # Sélecteur de langue (fr/en/es)
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
│   ├── evenements.astro      # Agenda public (/evenements)
│   ├── activities/           # Catalogue ateliers
│   └── keystatic/            # Interface CMS (local dev uniquement)
└── styles/
    └── global.css            # Variables CSS + reset Tailwind
scripts/
└── scrape-events.mjs         # Script de scraping JSON-LD des événements
public/
└── assets/
    ├── figma/                # Assets exportés depuis Figma (logos, photos, bg)
    └── images/               # Images uploadées via Keystatic
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
| Production | `main` | https://wild-odyssey.com |
| Staging | `staging` | URL fixe Azure SWA (voir Azure Portal) |
| PR previews | toute PR → `main` | URL auto générée par Azure SWA |

### GitHub Actions

Le workflow `.github/workflows/azure-static-web-apps-*.yml` :
- Déclenché sur push `main` et `staging`, et sur toutes les PRs
- Lance `npm run build` (qui inclut `npm run scrape`)
- Déploie le dossier `dist/` sur Azure SWA

### Keystatic CMS en prod

Keystatic Cloud utilise l'API GitHub pour committer directement — aucun serveur requis. L'intégration `keystatic()` dans `astro.config.mjs` est désactivée en prod (`process.env.NODE_ENV !== 'development'`) car inutile avec le build statique.

---

## Ce qui est implémenté

- [x] Homepage avec sections hero, stats, thèmes, ateliers, CTA
- [x] i18n fr/en/es sur la homepage
- [x] Catalogue ateliers (`/activities`)
- [x] Page agenda avec scraping automatique JSON-LD (`/evenements`)
- [x] Header responsive (desktop + mobile burger)
- [x] Footer avec CTA email
- [x] Sitemap automatique (`/sitemap-index.xml`, `/sitemap-0.xml`)
- [x] `robots.txt` avec Disallow keystatic
- [x] Keystatic CMS pour ateliers, homepage, et événements
- [ ] Analytics (Umami — prévu)
- [ ] Pages `/ongs` et `/workshops` (navigation présente, pages vides)
- [ ] i18n événements/ateliers
