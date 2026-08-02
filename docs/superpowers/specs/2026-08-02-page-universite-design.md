# Page université — design

Date : 2026-08-02
Statut : validé, prêt pour le plan d'implémentation

## Contexte

La homepage actuelle s'adresse aux entreprises. On ajoute une page équivalente pour
le public universitaire : même structure de sections, textes largement différents.

La page est copiée depuis la homepage puis éditée. La divergence des sections est
attendue, on assume donc la duplication du markup plutôt qu'un composant paramétré
qui se remplirait de conditionnels.

## Périmètre

Dans le périmètre :

- une page `/universites` en français
- un composant `UniversityPage.astro` copié de `HomePage.astro`
- un namespace de traductions `uni.*`
- un singleton Keystatic `university` (hero + stats)
- un lien « Universités » dans le header
- la correction du sélecteur de langue sur les pages non traduites

Hors périmètre :

- les variantes `/en/universites` et `/es/universites` (voir « Évolutions prévues »)
- le filtrage des ateliers par public
- les huit pages mortes de l'ancienne itération (`entreprises`, `associations`,
  `scolaire`, `services-publics`, `activities/index`, `jeux`, `pingouin`, `about`)
- les deux scripts de redirection concurrents sur `/` (`index.astro` utilise la clé
  `lang-chosen`, `LanguagePicker.astro` utilise `wild_odyssey_lang`)

## Architecture

### Route

`src/pages/universites.astro` rend `<UniversityPage lang="fr" />`.

La page n'active pas la prop `alternates` du Layout : aucun `hreflang` n'est émis
tant que les versions EN et ES n'existent pas, pour ne pas annoncer des URLs
absentes.

### Composant

`src/components/pages/UniversityPage.astro`, copie de
`src/components/pages/HomePage.astro`. Sections reprises à l'identique : hero,
6 thématiques, formats d'atelier, stats, 6 raisons. Mêmes classes Tailwind, mêmes
assets `public/assets/figma/`.

Différences dès la copie :

1. toutes les clés `t()` passent au namespace `uni.*`
2. les données hero et stats viennent du singleton `university`, pas de `homepage`
3. la prop `audience` de `HomePage` (déclarée mais jamais lue) n'est pas reprise ;
   `UniversityPage` ne prend que `lang: string`

La section « nos thématiques » affiche les mêmes ateliers que la home : toute la
collection `activities`, filtrée sur `theme !== "placeholder"` et triée par `order`.
Le filtrage par public sera tranché quand le texte de la page sera écrit.

### Traductions

Nouvelles clés dans le bloc `fr` de `src/i18n/ui.ts` :

- `uni.*` pour le corps de la page, en miroir des clés de la home
  (`uni.hero.pretitle`, `uni.hero.body1`, `uni.workshops.badge`, `uni.stats.badge`,
  `uni.reasons.r1.title`…)
- `seo.university.title` et `seo.university.description`
- `nav.university`

Le typage rend l'ajout FR-only sûr : `UiKey` dérive de `keyof typeof ui.fr` et
`t()` retombe sur `ui.fr[key]` quand la locale ne contient pas la clé. Les blocs
`en` et `es` n'ont donc rien à recevoir tant que la page n'est pas traduite.

### Contenu éditable (Keystatic)

Nouveau singleton `university`, en parallèle de `homepage`.

| Fichier | Modification |
|---|---|
| `keystatic.config.ts` | singleton `university`, `path: 'src/content/university/index'`, `format: { data: 'json' }` |
| `src/content/config.ts` | collection `university` de `type: 'data'` avec le schéma zod correspondant |
| `src/content/university/index.json` | valeurs initiales |

Champs :

| Champ | Type | Rôle |
|---|---|---|
| `heroTitleBase_fr` | text, optionnel | partie noire du titre hero |
| `heroTitle_fr` | text, optionnel | partie orange du titre hero |
| `statsParticipants` | text | valeur par défaut `+600.000` |
| `statsOrganizations` | text | valeur par défaut `+2.000` |
| `statsYears` | text | valeur par défaut `+5` |

Pas de champ `contactEmail` : le `Footer` est global et lit celui du singleton
`homepage`. Un champ non lu par la page serait un piège pour le content manager.

Champs français uniquement. Les variantes `_en` et `_es` seront ajoutées le jour où
la page sera traduite — trois lignes de schéma — plutôt que d'exposer dès maintenant
des champs vides dans l'interface de Lionel.

### Header

Lien texte « Universités » vers `/universites`, placé avant le CTA contact, dans la
nav desktop et dans le menu burger, libellé par `nav.university`.

Le lien n'est rendu que si `lang === 'fr'`. Sans cette condition, la homepage EN ou
ES enverrait ses visiteurs sur une page française.

### Sélecteur de langue sur les pages non traduites

Problème existant : `LanguagePicker.astro` reconstruit l'URL de chaque langue à
partir du chemin courant (`getRelativeLocaleUrl(lang, strippedPath)`). Sur une page
qui n'existe qu'en français, il propose des URLs qui renvoient un 404. Le bug est
déjà présent sur `/evenements` ; `/universites` ne fait que l'exposer davantage.

Correction : faire descendre la notion déjà portée par le Layout.

1. `Layout.astro` passe sa prop `alternates` au `Header`
2. `Header.astro` la transmet aux deux instances de `LanguagePicker`
3. `LanguagePicker.astro` accepte une prop `alternates` (défaut `false`) et, quand
   elle est fausse, construit ses liens vers la racine de chaque locale (`/`, `/en/`,
   `/es/`) au lieu du chemin courant

Les pages qui passent déjà `alternates` (home et contact) gardent le comportement
actuel. `/evenements` est corrigé au passage.

## Flux de données

```
src/content/university/index.json   ──getEntry("university","index")──┐
src/content/activities/*.json       ──getCollection("activities")─────┤
src/i18n/ui.ts (clés uni.*)         ──t("fr", key)────────────────────┤
                                                                       ▼
                                                        UniversityPage.astro
                                                                       │
                                                                       ▼
                                          Layout (alternates=false) → Header → LanguagePicker
```

## Vérification

Le projet n'a pas de tests automatisés. Vérification manuelle sur `npm run dev`,
et `npm run build` doit passer :

1. `/universites` répond et affiche les cinq sections
2. le titre hero et les trois stats reflètent `src/content/university/index.json`
3. le sélecteur de langue de `/universites` pointe vers `/`, `/en/` et `/es/`,
   et aucun de ces liens ne renvoie un 404
4. le sélecteur de langue de `/` et `/contact` conserve son comportement actuel
   (bascule vers la même page dans l'autre langue)
5. le sélecteur de langue de `/evenements` ne propose plus d'URL en 404
6. le lien « Universités » est présent sur `/` et absent de `/en/` et `/es/`
7. le lien est présent dans le menu burger en dessous de 768 px
8. la page apparaît dans `dist/sitemap-0.xml` sans balise `hreflang`
9. `npm run dev` avec Keystatic : le singleton « Université » est éditable

## Évolutions prévues

Non planifiées, notées pour que le design ne les bloque pas :

- **EN/ES** : ajouter `src/pages/[lang]/universites.astro` sur le modèle de
  `[lang]/contact.astro`, dupliquer le bloc `uni.*` dans `en` et `es`, ajouter les
  champs `_en`/`_es` au singleton, activer `alternates`, et retirer la condition
  `lang === 'fr'` du lien de header
- **catalogue par public** : ajouter un champ `audience` à la collection
  `activities` et filtrer par page
- **factorisation** : si après stabilisation les deux pages restent structurellement
  identiques, extraire les sections en composants partagés
