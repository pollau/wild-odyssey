# Page université — plan d'implémentation

> **Pour les agents :** SOUS-SKILL REQUISE — utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe `- [ ]`.

**Objectif :** livrer `/universites`, une page française calquée sur la homepage entreprises, avec son contenu éditable dans Keystatic et un lien dans le header.

**Architecture :** copie franche de `HomePage.astro` vers `UniversityPage.astro`, textes dans un namespace de traductions `uni.*`, hero et stats dans un nouveau singleton Keystatic `university`. Une correction préalable du sélecteur de langue évite que la nouvelle page ne propose des URLs en 404.

**Stack :** Astro 5 (`output: 'static'`, i18n natif fr/en/es sans préfixe sur le défaut), Tailwind v4 via plugin Vite, Keystatic, contenu en JSON dans `src/content/`.

**Spec :** `docs/superpowers/specs/2026-08-02-page-universite-design.md`

## Contraintes globales

- Node >= 20 (`package.json` → `engines`).
- **Le projet n'a aucun framework de test.** Chaque tâche se vérifie par un build et une inspection du HTML généré, avec les commandes exactes fournies. Ne pas installer de framework de test : ce n'est pas dans le périmètre.
- Utiliser `npx astro build` pour les boucles de vérification, pas `npm run build` : ce dernier lance d'abord le scraper d'événements. Le cache couvre actuellement les 10 URLs, donc aucun appel réseau n'est fait, mais `npx astro build` reste plus rapide et déterministe.
- La page est **française uniquement**. Ne créer ni `src/pages/[lang]/universites.astro`, ni clés `uni.*` dans les blocs `en` et `es` de `ui.ts`.
- Tailwind v4 : pas de fichier de configuration, les couleurs sont écrites en dur dans les classes (`bg-[#f05600]`, `text-[#0698c0]`). Suivre cette convention, ne pas introduire de tokens.
- Ne pas toucher aux huit pages mortes de l'ancienne itération (`entreprises`, `associations`, `scolaire`, `services-publics`, `activities/index`, `jeux`, `pingouin`, `about`) ni aux deux scripts de redirection concurrents sur `/`. Hors périmètre.
- Messages de commit en français, préfixe conventionnel (`feat:`, `fix:`, `chore:`).
- Branche de travail : `feat/page-universite`, déjà créée et contenant le commit du spec.

## Structure des fichiers

| Fichier | Responsabilité | Tâche |
|---|---|---|
| `src/components/LanguagePicker.astro` | *modifié* — cible ses liens sur la racine de chaque locale quand la page n'est pas traduite | 1 |
| `src/components/Header.astro` | *modifié* — relaie `alternates`, puis accueille le lien « Universités » | 1, 5 |
| `src/layouts/Layout.astro` | *modifié* — transmet `alternates` au Header | 1 |
| `keystatic.config.ts` | *modifié* — singleton `university` | 2 |
| `src/content/config.ts` | *modifié* — collection `university` (validation zod) | 2 |
| `src/content/university/index.json` | *créé* — valeurs initiales du hero et des stats | 2 |
| `src/i18n/ui.ts` | *modifié* — 61 clés `uni.*` + 3 clés `nav`/`seo` | 3 |
| `src/components/pages/UniversityPage.astro` | *créé* — les cinq sections de la page | 4 |
| `src/pages/universites.astro` | *créé* — la route | 4 |

---

## Prérequis

- [ ] **Étape 1 : installer les dépendances**

Le clone n'a pas de `node_modules`.

```bash
npm install
```

- [ ] **Étape 2 : vérifier que le build passe avant toute modification**

```bash
npx astro build
```

Attendu : `[build] Complete!` et un dossier `dist/`. Si ce build échoue déjà, arrêter et le signaler — ce n'est pas causé par ce plan.

---

## Tâche 1 : sélecteur de langue sur les pages non traduites

`LanguagePicker.astro` reconstruit l'URL de chaque langue à partir du chemin courant. Sur une page qui n'existe qu'en français, il propose des liens qui renvoient un 404. Le bug est visible aujourd'hui sur `/evenements` ; il faut le corriger avant d'ajouter `/universites`, qui l'exposerait davantage.

La correction fait descendre la prop `alternates` que `Layout` possède déjà (« cette page existe dans les trois langues ») jusqu'au picker.

**Fichiers :**
- Modifier : `src/components/LanguagePicker.astro:1-15` (frontmatter) et `:29` (le `href`)
- Modifier : `src/components/Header.astro:1-7` (frontmatter), `:24` et `:47` (les deux instances du picker)
- Modifier : `src/layouts/Layout.astro:55`

**Interfaces produites :**
- `LanguagePicker` accepte `alternates?: boolean` (défaut `false`)
- `Header` accepte `alternates?: boolean` (défaut `false`)

- [ ] **Étape 1 : constater le bug**

```bash
npx astro build && grep -o 'href="/en[^"]*"' dist/evenements/index.html | sort -u
```

Attendu : `href="/en/evenements/"` — un lien vers une page qui n'existe pas.

- [ ] **Étape 2 : ajouter la prop au LanguagePicker**

Dans `src/components/LanguagePicker.astro`, remplacer le frontmatter (lignes 1 à 15) par :

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';

interface Props {
  // True only for pages that exist in all three locales. When false the picker
  // targets each locale home, so it never links to a path that would 404.
  alternates?: boolean;
}

const { alternates = false } = Astro.props;

const currentLocale = Astro.currentLocale || 'fr';

// Strip locale prefix to get the bare path, then rebuild per locale
const rawPath = Astro.url.pathname;
const strippedPath = rawPath.replace(/^\/(en|es)(\/|$)/, '/') || '/';
const targetPath = alternates ? strippedPath : '/';

const languages = {
  fr: { code: 'fr', flag: 'https://flagcdn.com/w40/fr.png', label: 'FR', name: 'Français' },
  en: { code: 'en', flag: 'https://flagcdn.com/w40/us.png', label: 'EN', name: 'English (US)' },
  es: { code: 'es', flag: 'https://flagcdn.com/w40/es.png', label: 'ES', name: 'Español' },
};
---
```

- [ ] **Étape 3 : utiliser le nouveau chemin dans le lien**

Toujours dans `src/components/LanguagePicker.astro`, à la ligne du `href` (ligne 29 avant modification) :

```astro
                        href={getRelativeLocaleUrl(lang.code, targetPath)}
```

- [ ] **Étape 4 : relayer la prop dans le Header**

Dans `src/components/Header.astro`, remplacer le frontmatter (lignes 1 à 7) par :

```astro
---
import LanguagePicker from "./LanguagePicker.astro";
import { t } from "../i18n/ui";

interface Props {
  alternates?: boolean;
}

const { alternates = false } = Astro.props;

const lang = Astro.currentLocale || "fr";
const prefix = lang === "fr" ? "" : `/${lang}`;
---
```

Puis passer la prop aux **deux** instances du picker — celle de la nav desktop et celle du menu burger :

```astro
          <LanguagePicker alternates={alternates} />
```

- [ ] **Étape 5 : transmettre depuis le Layout**

Dans `src/layouts/Layout.astro`, remplacer `<Header />` par :

```astro
		<Header alternates={alternates} />
```

- [ ] **Étape 6 : vérifier la correction et l'absence de régression**

```bash
npx astro build
echo "--- evenements (FR seule, doit pointer vers les racines) ---"
grep -o 'href="/en[^"]*"' dist/evenements/index.html | sort -u
echo "--- home FR (traduite, doit garder son comportement) ---"
grep -o 'href="/en[^"]*"' dist/index.html | sort -u
echo "--- contact FR (traduite) ---"
grep -o 'href="/en[^"]*"' dist/contact/index.html | sort -u
```

Attendu :
- `/evenements` → `/en` ou `/en/`, et **plus aucune occurrence de** `/en/evenements`
- `/` → `/en` ou `/en/` (inchangé, la racine était déjà la cible)
- `/contact` → `/en/contact/` (inchangé — c'est la régression à surveiller : si cette ligne devient `/en/`, la prop n'est pas remontée correctement depuis `contact.astro`)

- [ ] **Étape 7 : commit**

```bash
git add src/components/LanguagePicker.astro src/components/Header.astro src/layouts/Layout.astro
git commit -m "fix(i18n): le selecteur de langue ne propose plus d URL en 404 sur les pages non traduites"
```

---

## Tâche 2 : singleton Keystatic `university`

**Fichiers :**
- Modifier : `keystatic.config.ts:41` (après le singleton `homepage`)
- Modifier : `src/content/config.ts:40` (après la collection `homepage`) et `:42-45` (l'export)
- Créer : `src/content/university/index.json`

**Interfaces produites :**
- `getEntry("university", "index")` renvoie `{ heroTitleBase_fr?, heroTitle_fr?, statsParticipants?, statsOrganizations?, statsYears? }`, tous `string | undefined`

- [ ] **Étape 1 : déclarer le singleton dans Keystatic**

Dans `keystatic.config.ts`, à l'intérieur de l'objet `singletons`, après la définition de `homepage` :

```ts
        university: singleton({
            label: '🎓 Université',
            path: 'src/content/university/index',
            format: { data: 'json' },
            schema: {
                heroTitleBase_fr: fields.text({ label: 'Hero — début du titre, affiché en noir (FR)' }),
                heroTitle_fr: fields.text({ label: 'Hero — fin du titre, affichée en orange (FR)' }),
                statsParticipants: fields.text({ label: 'Stats — Participants', defaultValue: '+600.000' }),
                statsOrganizations: fields.text({ label: 'Stats — Organisations', defaultValue: '+2.000' }),
                statsYears: fields.text({ label: "Stats — Années d'expérience", defaultValue: '+5' }),
            },
        }),
```

Pas de champ `contactEmail` : le `Footer` est global et lit celui du singleton `homepage`. Un champ non lu par la page serait un piège pour le content manager.

- [ ] **Étape 2 : déclarer la collection côté Astro**

Dans `src/content/config.ts`, après la définition de `homepage` :

```ts
const university = defineCollection({
    type: 'data',
    schema: z.object({
        heroTitleBase_fr: z.string().optional(),
        heroTitle_fr: z.string().optional(),
        statsParticipants: z.string().optional(),
        statsOrganizations: z.string().optional(),
        statsYears: z.string().optional(),
    }),
});
```

Puis étendre l'export en fin de fichier :

```ts
export const collections = {
    activities,
    homepage,
    university,
};
```

- [ ] **Étape 3 : créer le contenu initial**

Créer `src/content/university/index.json` :

```json
{
  "heroTitleBase_fr": "",
  "heroTitle_fr": "Cap sur l'odyssée du vivant !",
  "statsParticipants": "+600.000",
  "statsOrganizations": "+2.000",
  "statsYears": "+5"
}
```

Ce sont les valeurs de la home, point de départ que le contenu université écrasera.

- [ ] **Étape 4 : vérifier que la collection est valide**

Astro valide les collections de données au build, même si aucune page ne les lit encore.

```bash
npx astro build
```

Attendu : `[build] Complete!` sans erreur `InvalidContentEntryDataError`. En cas d'erreur, le schéma zod et le JSON ne correspondent pas.

- [ ] **Étape 5 : commit**

```bash
git add keystatic.config.ts src/content/config.ts src/content/university/index.json
git commit -m "feat(cms): singleton Keystatic pour le contenu de la page universite"
```

---

## Tâche 3 : clés de traduction `uni.*`

61 clés reprises du bloc `fr` avec le préfixe `uni.`, plus 3 clés authorées pour la nav et le SEO.

Le typage rend l'ajout FR-only sûr : `UiKey` dérive de `keyof typeof ui.fr` et `t()` retombe sur `ui.fr[key]` quand la locale ne contient pas la clé.

**Fichiers :**
- Modifier : `src/i18n/ui.ts` — insertion après la ligne 110 (`"contact.close": "Fermer",`), avant la ligne 111 qui ferme le bloc `fr`

**Interfaces produites :**
- 61 clés `uni.<section>.<nom>` reprenant exactement les noms de la home : `uni.hero.*` (6), `uni.workshops.*` (7), `uni.formats.*` (15), `uni.stats.*` (7), `uni.reasons.*` (26)
- `nav.university`, `seo.university.title`, `seo.university.description`

- [ ] **Étape 1 : dupliquer les clés de la home avec le préfixe**

Les clés à reprendre sont les **lignes 3 à 67** du fichier, c'est-à-dire du `"hero.pretitle"` jusqu'au `"reasons.r6.text"` inclus, lignes vides de séparation comprises. Ne pas reprendre les `footer.*` (lignes 69 à 77) : le `Footer` est global et partagé, la page université utilise les mêmes.

Copier ce bloc, le coller juste après `"contact.close": "Fermer",` (ligne 110), et préfixer chaque clé par `uni.`. Le résultat commence et finit ainsi :

```ts
    // ─── Page université — mêmes emplacements que la home, textes distincts ───
    "uni.hero.pretitle": "CSRD, ESG, RSE, engagement des équipes… vous avez vu les slides.",
    "uni.hero.body1": "Nous transformons la théorie en émerveillement, et l'émerveillement en action, à travers des expériences immersives menées avec des ONG reconnues.",

    // … les 57 clés intermédiaires, dans le même ordre que la home …

    "uni.reasons.r6.title": "Obtenir ou conserver",
    "uni.reasons.r6.accent": "sa certification",
    "uni.reasons.r6.text": "Obtenir ou conserver vos labels EcoVadis, B Corp, ISO 14001, GSTC… ces référentiels valorisent la sensibilisation interne et l'engagement des équipes, et la CSRD demande de le documenter. Nos ateliers vous en fournissent une preuve concrète et traçable.",
```

Copier les valeurs telles quelles : ce sont les textes de départ, que l'itération éditoriale remplacera. Ne pas les réécrire à la main, les copier — les accents et apostrophes typographiques (`’`, `…`) doivent être préservés à l'identique.

- [ ] **Étape 2 : vérifier le compte de clés**

```bash
grep -c '"uni\.' src/i18n/ui.ts
```

Attendu : `61`. Un autre nombre signale une ligne oubliée ou dupliquée pendant la copie.

- [ ] **Étape 3 : ajouter les clés de nav et de SEO**

Ces trois clés ne sont pas préfixées `uni.` : elles appartiennent aux familles existantes. Les ajouter juste après le bloc `uni.*`, toujours dans le bloc `fr` :

```ts

    "nav.university": "Universités",

    "seo.university.title": "Ateliers Climat & Océan pour l'Enseignement Supérieur",
    "seo.university.description": "Ateliers scientifiques sur le climat, l'océan et la biodiversité pour les universités et grandes écoles. Formats immersifs pour étudiants et personnels.",
```

- [ ] **Étape 4 : vérifier que le fichier compile**

```bash
npx astro build
```

Attendu : `[build] Complete!`. Une erreur de syntaxe ici vient presque toujours d'une virgule manquante à la jonction du bloc collé.

- [ ] **Étape 5 : commit**

```bash
git add src/i18n/ui.ts
git commit -m "feat(i18n): namespace uni pour les textes de la page universite"
```

---

## Tâche 4 : le composant et la route

**Fichiers :**
- Créer : `src/components/pages/UniversityPage.astro` (copie de `src/components/pages/HomePage.astro`)
- Créer : `src/pages/universites.astro`

**Interfaces consommées :** `getEntry("university", "index")` (tâche 2), clés `uni.*` et `seo.university.*` (tâche 3)

**Interfaces produites :** `UniversityPage` accepte `lang: string` — et rien d'autre. La prop `audience` de `HomePage`, déclarée mais jamais lue, n'est pas reprise.

- [ ] **Étape 1 : copier le composant et préfixer les clés**

```bash
cp src/components/pages/HomePage.astro src/components/pages/UniversityPage.astro
sed -i 's/t(lang, "/t(lang, "uni./g' src/components/pages/UniversityPage.astro
grep -o 't(lang, "uni\.' src/components/pages/UniversityPage.astro | wc -l
```

Attendu : `65` occurrences. Compter avec `grep -o … | wc -l` et non `grep -c` : plusieurs lignes contiennent trois appels à `t()`, et `grep -c` compte les lignes, pas les occurrences.

Le `sed` a aussi préfixé les deux clés SEO de la ligne `<Layout …>` — c'est corrigé à l'étape 3. Il n'a pas touché aux appels `tc(w.data, …)`, qui lisent la collection `activities` et doivent rester intacts.

- [ ] **Étape 2 : remplacer le frontmatter**

Remplacer entièrement le frontmatter de `src/components/pages/UniversityPage.astro` (du `---` d'ouverture au `---` de fermeture, lignes 1 à 46) par :

```astro
---
import Layout from "../../layouts/Layout.astro";
import OrganizationSchema from "../OrganizationSchema.astro";
import { getCollection, getEntry } from "astro:content";
import { t } from "../../i18n/ui";
import { tc } from "../../i18n/content";

interface Props {
  lang: string;
}

const { lang } = Astro.props;

const universityEntry = await getEntry("university", "index");
const university = universityEntry!.data;
const workshops = (await getCollection("activities"))
  .filter((w) => w.data.theme !== "placeholder")
  .sort((a, b) => ((a.data.order ?? 99) - (b.data.order ?? 99)));

// tc() résout le suffixe de langue : la page est FR seule pour l'instant, mais
// brancher EN/ES ne demandera que d'ajouter les champs au singleton.
const heroTitle = tc(university, "heroTitle", lang);
const heroTitleBase = tc(university, "heroTitleBase", lang);
const statsParticipants = university.statsParticipants ?? "+600.000";
const statsOrganizations = university.statsOrganizations ?? "+2.000";
const statsYears = university.statsYears ?? "+5";

const features = [
  { icon: "/assets/figma/icon-clock.svg", label: t(lang, "uni.formats.feat1") },
  { icon: "/assets/figma/icon-organic.svg", label: t(lang, "uni.formats.feat2") },
  { icon: "/assets/figma/icon-customize.svg", label: t(lang, "uni.formats.feat3") },
  { icon: "/assets/figma/icon-online.svg", label: t(lang, "uni.formats.feat4") },
  { icon: "/assets/figma/icon-leader.svg", label: t(lang, "uni.formats.feat5") },
  { icon: "/assets/figma/icon-organization.svg", label: t(lang, "uni.formats.feat6") },
];

const reasons = [
  { icon: "👥", title: t(lang, "uni.reasons.r1.title"), accent: t(lang, "uni.reasons.r1.accent"), text: t(lang, "uni.reasons.r1.text") },
  { icon: "💡", title: t(lang, "uni.reasons.r2.title"), accent: t(lang, "uni.reasons.r2.accent"), text: t(lang, "uni.reasons.r2.text") },
  { icon: "💪", title: t(lang, "uni.reasons.r3.title"), accent: t(lang, "uni.reasons.r3.accent"), text: t(lang, "uni.reasons.r3.text") },
  { icon: "🌿", title: t(lang, "uni.reasons.r4.title"), accent: t(lang, "uni.reasons.r4.accent"), text: t(lang, "uni.reasons.r4.text") },
  { icon: "🎓", title: t(lang, "uni.reasons.r5.title"), accent: t(lang, "uni.reasons.r5.accent"), text: t(lang, "uni.reasons.r5.text") },
  { icon: "🏅", title: t(lang, "uni.reasons.r6.title"), accent: t(lang, "uni.reasons.r6.accent"), text: t(lang, "uni.reasons.r6.text") },
];
---
```

Trois différences par rapport à la home, volontaires :
- `getEntry("university", …)` au lieu de `getEntry("homepage", …)`
- la prop `audience` disparaît de `Props`
- la constante `prefix` disparaît : elle est déclarée mais jamais utilisée dans le corps de `HomePage.astro`

- [ ] **Étape 3 : corriger la ligne Layout**

Le `sed` de l'étape 1 a produit `t(lang, "uni.seo.home.title")`. Remplacer la ligne d'ouverture du Layout par :

```astro
<Layout title={t(lang, "seo.university.title")} description={t(lang, "seo.university.description")}>
```

Noter l'absence de `alternates` : la page n'existe qu'en français, aucun `hreflang` ne doit être émis.

- [ ] **Étape 4 : vérifier qu'aucune clé parasite ne subsiste**

```bash
grep -n 'uni\.seo\.\|uni\.nav\.\|uni\.footer\.' src/components/pages/UniversityPage.astro
grep -o 't(lang, "uni\.' src/components/pages/UniversityPage.astro | wc -l
```

Attendu : aucune sortie pour le premier `grep` — toute occurrence signale une clé mal préfixée par le `sed`. Puis `63` : les 65 du départ moins les deux clés SEO rendues à leur nom propre à l'étape 3.

- [ ] **Étape 5 : créer la route**

Créer `src/pages/universites.astro` :

```astro
---
import UniversityPage from "../components/pages/UniversityPage.astro";
---

<UniversityPage lang="fr" />
```

Pas de script de redirection de langue ici, contrairement à `index.astro` : la page n'existe qu'en français.

- [ ] **Étape 6 : vérifier le rendu**

```bash
npx astro build
echo "--- la page existe ---"
test -f dist/universites/index.html && echo OK
echo "--- titre SEO ---"
grep -o '<title>[^<]*</title>' dist/universites/index.html
echo "--- pas de hreflang ---"
grep -o 'hreflang' dist/universites/index.html | wc -l
echo "--- les 5 sections ---"
grep -o '<section' dist/universites/index.html | wc -l
echo "--- le selecteur de langue pointe vers les racines ---"
grep -o 'href="/en[^"]*"' dist/universites/index.html | sort -u
echo "--- la page est dans le sitemap ---"
grep -o 'universites' dist/sitemap-0.xml | wc -l
```

Astro compresse le HTML au build : compter avec `grep -o … | wc -l`, jamais avec `grep -c`, qui compterait une seule ligne là où il y a cinq balises.

Attendu :
- `OK`
- `<title>Ateliers Climat &amp; Océan pour l'Enseignement Supérieur | Wild Odyssey</title>`
- hreflang : `0`
- sections : `5`
- liens langue : `/en` ou `/en/`, **jamais** `/en/universites`
- sitemap : `1`

- [ ] **Étape 7 : vérifier visuellement**

```bash
npm run dev
```

Ouvrir `http://localhost:4321/universites` et confirmer : le titre hero affiche « Cap sur l'odyssée du vivant ! » en orange, les six cartes d'ateliers s'affichent avec leurs images, les trois stats affichent `+600.000` / `+2.000` / `+5`, et la page est visuellement identique à `/`.

- [ ] **Étape 8 : commit**

```bash
git add src/components/pages/UniversityPage.astro src/pages/universites.astro
git commit -m "feat(universite): page /universites calquee sur la home entreprises"
```

---

## Tâche 5 : lien « Universités » dans le header

Le lien n'est rendu que si `lang === "fr"`. Sans cette condition, les homepages EN et ES enverraient leurs visiteurs sur une page française.

**Fichiers :**
- Modifier : `src/components/Header.astro` — nav desktop (avant le CTA contact) et menu burger (avant le CTA contact)

**Interfaces consommées :** `nav.university` (tâche 3), la route `/universites` (tâche 4)

- [ ] **Étape 1 : ajouter le lien dans la nav desktop**

Dans `src/components/Header.astro`, à l'intérieur du `<nav class="hidden md:flex …">`, **avant** le commentaire `<!-- CTA -->` :

```astro
        {lang === "fr" && (
          <a
            href="/universites"
            class="text-[15px] lg:text-[16px] font-semibold text-black hover:text-[#f05600] transition-colors whitespace-nowrap"
          >
            {t(lang, "nav.university")}
          </a>
        )}
```

- [ ] **Étape 2 : ajouter le lien dans le menu burger**

Dans le `<div id="mobile-menu" …>`, entre le `<LanguagePicker …>` et le lien CTA :

```astro
    {lang === "fr" && (
      <a href="/universites" class="block text-[16px] font-semibold text-black">
        {t(lang, "nav.university")}
      </a>
    )}
```

- [ ] **Étape 3 : vérifier la présence et la condition de langue**

```bash
npx astro build
echo "--- home FR : 2 liens attendus (desktop + burger) ---"
grep -o 'href="/universites"' dist/index.html | wc -l
echo "--- home EN : 0 attendu ---"
grep -o 'href="/universites"' dist/en/index.html | wc -l
echo "--- home ES : 0 attendu ---"
grep -o 'href="/universites"' dist/es/index.html | wc -l
echo "--- la page universite se lie a elle-meme dans son header ---"
grep -o 'href="/universites"' dist/universites/index.html | wc -l
```

Attendu : `2`, `0`, `0`, `2`. Compter les occurrences et non les lignes : le HTML compressé peut porter les deux liens sur la même ligne.

- [ ] **Étape 4 : vérifier le menu mobile**

```bash
npm run dev
```

Ouvrir `http://localhost:4321/` dans une fenêtre de moins de 768 px de large, cliquer sur le burger, confirmer que « Universités » apparaît entre le sélecteur de langue et le bouton « Nous contacter », et que le lien mène bien à la page.

- [ ] **Étape 5 : commit**

```bash
git add src/components/Header.astro
git commit -m "feat(nav): lien Universites dans le header en francais"
```

---

## Vérification finale

Reprend les 9 points de la section « Vérification » du spec.

- [ ] **Étape 1 : build complet, scraper compris**

```bash
npm run build
```

Attendu : `No new URLs to scrape — cache is up to date.` puis `[build] Complete!`.

- [ ] **Étape 2 : passer la checklist du spec**

```bash
echo "1. la page existe et a 5 sections"
grep -o '<section' dist/universites/index.html | wc -l
echo "2. hero et stats viennent du singleton"
grep -o "Cap sur l'odyssée du vivant" dist/universites/index.html | head -1
grep -o '+600.000' dist/universites/index.html | head -1
echo "3-5. selecteurs de langue"
grep -o 'href="/en[^"]*"' dist/universites/index.html | sort -u
grep -o 'href="/en[^"]*"' dist/evenements/index.html | sort -u
grep -o 'href="/en[^"]*"' dist/contact/index.html | sort -u
echo "6. lien header present en FR, absent en EN/ES"
grep -o 'href="/universites"' dist/index.html | wc -l
grep -o 'href="/universites"' dist/en/index.html | wc -l
echo "8. sitemap sans hreflang sur la page"
grep -o 'universites' dist/sitemap-0.xml | wc -l
grep -o 'hreflang' dist/universites/index.html | wc -l
```

Attendu : `5` / le titre et `+600.000` trouvés / `/universites` et `/evenements` pointent vers la racine `/en` quand `/contact` pointe vers `/en/contact/` / `2` puis `0` / `1` puis `0`.

Les points 7 (menu burger) et 9 (édition Keystatic) se vérifient à la main — le 7 a été fait en tâche 5, étape 4.

- [ ] **Étape 3 : vérifier l'édition Keystatic**

Keystatic est commenté dans `astro.config.mjs:21`, l'interface d'administration n'est donc pas montée. Vérifier à la place que la modification du JSON se propage :

```bash
npm run dev
```

Éditer `src/content/university/index.json`, remplacer `statsYears` par `+42`, sauvegarder, et confirmer que `http://localhost:4321/universites` affiche `+42` après rechargement à chaud. Puis rétablir `+5`.

- [ ] **Étape 4 : vérifier que rien n'a bougé sur la home**

```bash
git stash list
git diff main --stat -- src/components/pages/HomePage.astro src/pages/index.astro
```

Attendu : aucune sortie du `git diff` — la page entreprises n'a pas été modifiée.
