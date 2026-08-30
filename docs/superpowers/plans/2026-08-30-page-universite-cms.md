# Page université pilotée par le CMS — plan d'implémentation

> **Pour les agents :** SOUS-SKILL REQUISE — utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe `- [ ]`.

**Objectif :** livrer `/universites` dans les trois langues, entièrement éditable dans Keystatic, sans dupliquer le markup de la page d'accueil.

**Architecture :** les cinq sections de `HomePage.astro` sont d'abord extraites en composants qui reçoivent leurs données en props, à rendu strictement constant. La page université compose ensuite quatre de ces cinq sections, avec ses propres collections de cartes et ses propres singletons de décor.

**Stack :** Astro 5 statique, i18n natif `fr`/`en`/`es`, Tailwind v4 sans fichier de config, Keystatic, contenu en JSON dans `src/content/`.

**Spec :** `docs/superpowers/specs/2026-08-30-page-universite-cms-design.md`

**Branche :** `feat/universite-cms`, basée sur `qa` (`be4bda5`)

## Contraintes globales

- **Vocabulaire imposé : `thematic` et `session`.** « Format » et « workshop » sont proscrits comme termes génériques. `session-01-workshop` reste valide : « workshop » y désigne l'atelier collaboratif en particulier.
- **Commentaires de code en français SANS accents**, convention constante du dépôt (`// Chaque thematique porte un bloc par langue`). Les libellés destinés à l'éditeur, eux, sont accentués (`'Français'`, `'Événements'`).
- **Aucun repli entre langues sur le contenu.** Une langue non saisie s'affiche vide. Keystatic omet les champs vides du JSON : clé absente = « pas de texte dans cette langue ».
- **Une seule convention d'écriture** dans tous les champs CMS : `**texte**` en orange, `__texte__` en cyan, retour à la ligne pour un paragraphe ou un saut de ligne. Rendue par `RichText` (en ligne) et `RichBody` (en paragraphes), nettoyée par `plainText()` pour les attributs.
- **Tout nouveau champ Keystatic passe par `champLigne` ou `champParagraphes`**, jamais par `fields.text` nu, pour que l'aide sous le champ reste homogène.
- **Le projet n'a aucun framework de test.** Vérification par build et inspection du HTML généré. Ne pas en installer un.
- **Utiliser `npx astro build`**, pas `npm run build` : ce dernier lance d'abord le scraper d'événements.
- **Les fichiers du dépôt sont en CRLF.** `sed -i` et `awk` sur Git Bash les réécrivent en LF et produisent un diff de tout le fichier. Utiliser l'outil d'édition, ou vérifier `file <fichier>` et `git diff --stat` après coup.
- Tailwind v4 sans config : les couleurs sont en dur dans les classes (`bg-[#f05600]`). Ne pas introduire de tokens.
- Messages de commit en français, préfixe conventionnel.

## Structure des fichiers

| Fichier | Responsabilité | Tâche |
|---|---|---|
| `src/i18n/langBlock.ts` | *créé* — extrait le bloc d'une langue d'un objet groupé par langue | 1 |
| `src/components/sections/Hero.astro` | *créé* — bandeau d'introduction | 1 |
| `src/components/sections/Thematics.astro` | *créé* — intro + cartes de thématiques | 2 |
| `src/components/sections/Sessions.astro` | *créé* — intro, six pictogrammes, cartes de sessions | 3 |
| `src/components/sections/Stats.astro` | *créé* — bande de chiffres animés | 4 |
| `src/components/sections/Reasons.astro` | *créé* — les 6 bonnes raisons | 4 |
| `src/components/pages/HomePage.astro` | *modifié* — devient une composition de cinq sections | 1→4 |
| `src/i18n/ui.ts` | *modifié* — perd le décor de section | 4 |
| `keystatic.config.ts` | *modifié* — fabrique `perLang`, puis les entrées université | 5, 7 |
| `src/content/config.ts` | *modifié* — trois collections ajoutées | 6 |
| `src/content/university/index.json` | *créé* — hero université | 6 |
| `src/content/ui/university-{thematics,sessions}.json` | *créés* — décor université | 6 |
| `src/content/university-thematics/*.json` | *créés* — six fiches | 6 |
| `src/content/university-sessions/*.json` | *créées* — trois fiches | 6 |
| `src/components/pages/UniversityPage.astro` | *créé* — composition de quatre sections | 8 |
| `src/pages/universites.astro`, `src/pages/[lang]/universites.astro` | *créés* — routes | 8 |
| `src/components/Header.astro` | *modifié* — lien « Universités » | 9 |

---

## Prérequis

- [ ] **Étape 1 : vérifier la branche et l'état du dépôt**

Un autre poste de travail a déjà déplacé `HEAD` dans ce clone par le passé. Vérifier avant toute chose.

```bash
git branch --show-current
git status --short
```

Attendu : `feat/universite-cms` et un arbre propre. Si la branche est autre, `git checkout feat/universite-cms` avant de continuer.

- [ ] **Étape 2 : capturer la référence de non-régression**

C'est la seule protection contre une régression silencieuse de la home. À faire **avant** la première modification.

```bash
npx astro build
cp -r dist ../dist-reference
ls ../dist-reference/index.html
```

Attendu : `[build] Complete!` puis le chemin du fichier. Ce dossier sert de référence jusqu'à la fin de la tâche 5 ; ne pas le supprimer avant.

---

## Tâche 1 : l'aide de langue et la section Hero

**Fichiers :**
- Créer : `src/i18n/langBlock.ts`
- Créer : `src/components/sections/Hero.astro`
- Modifier : `src/components/pages/HomePage.astro`

**Interfaces produites :**
- `langBlock(o: unknown, lang: string): Record<string, string>` — le bloc d'une langue, objet vide si absent
- `Hero.astro` prend `intro: Record<string, string>` et `ctaHref: string`

- [ ] **Étape 1 : créer l'aide de langue**

Créer `src/i18n/langBlock.ts` :

```ts
// Le bloc d'une langue dans un objet groupe par langue, qu il vienne d un
// singleton de decor ou d une fiche de collection : les deux ont la meme
// forme { fr: {...}, en: {...}, es: {...} }.
//
// Renvoie un objet vide quand la langue manque. Keystatic omet les champs
// vides du JSON, donc une cle absente veut dire "pas de texte dans cette
// langue" et non "pas encore traduit" : on ne replie jamais sur l anglais.
export const langBlock = (o: unknown, lang: string): Record<string, string> =>
    ((o as Record<string, Record<string, string>> | undefined)?.[lang] ?? {});
```

- [ ] **Étape 2 : créer la section Hero**

Créer `src/components/sections/Hero.astro`. Le markup est repris **mot pour mot** des lignes 73 à 97 de `HomePage.astro` ; seule la source des textes change.

```astro
---
// Bandeau d'introduction. Le composant ne connait ni Keystatic ni la langue
// courante : il recoit deja le bloc de la langue a afficher.
//
// ctaHref est une prop parce que les deux pages n ont pas les memes sections :
// la home renvoie vers ses 6 bonnes raisons, que la page universite n a pas.
import RichText from "../RichText.astro";
import RichBody from "../RichBody.astro";

interface Props {
  intro: Record<string, string>;
  ctaHref: string;
}

const { intro, ctaHref } = Astro.props;
---

<section class="bg-white py-12 lg:py-20">
  <div class="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
    <!-- Text -->
    <div class="flex-1 flex flex-col gap-6 lg:gap-8">
      {intro.titleBase && <p class="font-fraunces text-[28px] lg:text-[36px] font-bold leading-tight text-black"><RichText text={intro.titleBase} /></p>}
      <h1 class="font-fraunces text-[28px] lg:text-[36px] font-bold leading-tight">
        <span class="text-[#f05600]"><RichText text={intro.title} /></span>
      </h1>
      <div class="font-aileron flex flex-col gap-4 text-[19px] text-black leading-relaxed">
        <RichBody text={intro.body} />
      </div>
      <p class="font-fraunces text-[#f05600] text-[20px]"><RichText text={intro.tagline} /></p>
      <a
        href={ctaHref}
        class="font-aileron bg-[#f05600] text-white text-[20px] font-semibold h-[54px] lg:h-[64px] w-full sm:w-[260px] flex items-center justify-center rounded-[7px] hover:bg-orange-700 transition-colors"
      >
        <RichText text={intro.cta} />
      </a>
    </div>
    <!-- Image -->
    <div class="w-full lg:flex-shrink-0 lg:w-auto">
      <img src="/assets/figma/hero-nature.png" alt="Wild Odyssey" class="w-full lg:w-[460px] rounded-2xl object-cover" />
    </div>
  </div>
</section>
```

- [ ] **Étape 3 : brancher HomePage sur le composant**

Dans `src/components/pages/HomePage.astro` :

Ajouter aux imports, après la ligne `import { SESSION_IMAGES } ...` :

```astro
import Hero from "../sections/Hero.astro";
import { langBlock } from "../../i18n/langBlock";
```

Remplacer la ligne qui calcule `intro` (avec son commentaire de six lignes juste au-dessus, `// Bandeau d'introduction : ...`) par :

```astro
const intro = langBlock(homepage, lang);
```

Puis remplacer tout le bloc `<!-- ─── HERO ─── -->` et la `<section>` qui suit (lignes 72 à 97 avant modification) par :

```astro
    <Hero intro={intro} ctaHref="#reasons" />
```

- [ ] **Étape 4 : vérifier que le rendu n'a pas bougé**

```bash
npx astro build
node -e "
const fs=require('fs');
const norm = p => fs.readFileSync(p,'utf8').replace(/\s+/g,' ').trim();
for (const p of ['index.html','en/index.html','es/index.html']) {
  const a = norm('../dist-reference/'+p), b = norm('dist/'+p);
  console.log(p, a===b ? 'IDENTIQUE' : 'DIFFERENT (' + a.length + ' vs ' + b.length + ')');
}
"
```

Attendu : les trois lignes en `IDENTIQUE`. Un `DIFFERENT` signale une régression — comparer avant de continuer.

- [ ] **Étape 5 : commit**

```bash
git add src/i18n/langBlock.ts src/components/sections/Hero.astro src/components/pages/HomePage.astro
git commit -m "refactor(sections): extraire le bandeau d introduction"
```

---

## Tâche 2 : la section Thématiques

**Fichiers :**
- Créer : `src/components/sections/Thematics.astro`
- Modifier : `src/components/pages/HomePage.astro`

**Interfaces consommées :** `langBlock` (tâche 1)

**Interfaces produites :** `Thematics.astro` prend `chrome: Record<string, string>`, `cards: { id: string; data: Record<string, unknown> }[]`, `lang: string`, `id?: string`

- [ ] **Étape 1 : créer la section**

Créer `src/components/sections/Thematics.astro`. Markup repris mot pour mot des lignes 99 à 162 de `HomePage.astro`.

```astro
---
// Intro de section et cartes de thematiques.
//
// cards est volontairement type a la main plutot qu avec CollectionEntry :
// deux collections differentes l alimentent, celle de la home et celle de
// l universite, et le composant n a pas a les connaitre.
//
// id est optionnel : sans lui aucun attribut n est rendu, ce qui laisse le
// HTML de la home inchange. La page universite s en sert comme ancre.
import RichText from "../RichText.astro";
import RichBody from "../RichBody.astro";
import { langBlock } from "../../i18n/langBlock";
import { plainText } from "../../i18n/richText";
import { THEMATIC_IMAGES } from "../../content/thematicImages";

interface Props {
  chrome: Record<string, string>;
  cards: { id: string; data: Record<string, unknown> }[];
  lang: string;
  id?: string;
}

const { chrome, cards, lang, id } = Astro.props;

// Le rang est porte par le nom de fichier (thematic-01-...), seule source de
// l ordre. La photo se retrouve sans le rang, pour qu une renumerotation ne
// la perde pas. Les deux publics partagent la meme table.
const photo = (fiche: string) => THEMATIC_IMAGES[fiche.replace(/^thematic-\d+-/, "")];
---

<section id={id} class="relative py-12 lg:py-20 overflow-hidden" style="background-color: #e8f5e5;">

  <!-- Décoration bas-droite : grand cercle blanc + photo océan intérieure -->
  <div class="absolute bottom-0 right-0 translate-x-[30%] translate-y-[30%] pointer-events-none select-none z-[1]">
    <div class="w-[400px] h-[400px] lg:w-[560px] lg:h-[560px] rounded-full bg-white/[0.28] flex items-center justify-center">
      <div class="w-[260px] h-[260px] lg:w-[360px] lg:h-[360px] rounded-full overflow-hidden">
        <img src="/assets/figma/ellipse-inner.png" alt="" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>

  <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-10 lg:gap-14 items-center">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:gap-5 items-center text-center w-full">
      <div class="bg-[rgba(6,152,192,0.15)] px-6 h-[44px] flex items-center justify-center rounded-full">
        <span class="text-[#0698c0] text-[14px] lg:text-[15px] font-semibold"><RichText text={chrome.badge} /></span>
      </div>
      <h2 class="font-fraunces text-[24px] lg:text-[30px] font-semibold text-black">
        <RichText text={chrome.heading} />
      </h2>
      <div class="font-aileron flex flex-col gap-3 text-[15px] lg:text-[17px] font-medium text-black text-center">
        <RichBody text={chrome.body} />
      </div>
    </div>

    <!-- Cartes de thematiques — scroll horizontal mobile, 2×2 desktop -->
    <div class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory w-full max-w-3xl lg:max-w-6xl sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 sm:overflow-x-visible sm:pb-0 lg:gap-7">
      {cards.map((w) => (
        <div class="shrink-0 w-[260px] snap-start sm:w-auto bg-white border border-[#dbdbdb] rounded-[12px] shadow-[0px_1px_8px_rgba(168,168,168,0.25)] flex flex-col overflow-hidden">
          <div class="relative h-[190px] bg-[#acb8a9]">
            {photo(w.id) && (
              <img
                src={photo(w.id).src}
                alt={plainText(langBlock(w.data, lang).title)}
                class="w-full h-full object-cover"
                style={`object-position: ${photo(w.id).position}`}
              />
            )}
            <span class="font-fraunces absolute top-3 left-1/2 -translate-x-1/2 text-white text-[18px] font-bold text-center w-[90%] leading-tight drop-shadow-md">
              <RichText text={langBlock(w.data, lang).title} />
            </span>
          </div>
          <div class="p-4 flex flex-col gap-2 flex-1">
            <p class="font-aileron text-[#0698c0] text-[17px] font-bold leading-snug">
              <RichText text={langBlock(w.data, lang).subtitle || langBlock(w.data, lang).title} />
            </p>
            <div class="flex flex-col gap-5 flex-1 justify-between">
              <RichBody text={langBlock(w.data, lang).description} class="font-aileron text-[#3b3b3b] text-[15px] leading-snug" />
              <a
                href="#"
                data-coming-soon
                class="font-aileron bg-[#f05600] text-white text-[15px] font-semibold h-[46px] flex items-center justify-center rounded-[7px] hover:bg-orange-700 transition-colors"
              >
                <RichText text={chrome.learnMore} />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Étape 2 : brancher HomePage**

Dans `src/components/pages/HomePage.astro` :

Ajouter aux imports :

```astro
import Thematics from "../sections/Thematics.astro";
import thematicsUi from "../../content/ui/thematics.json";
```

Supprimer la constante `photo` et son commentaire de trois lignes (`// Le rang est porte par le nom de fichier ...`) : elle vit maintenant dans le composant.

Remplacer le bloc `<!-- ─── THEMATIQUES ─── -->` et sa `<section>` par :

```astro
    <Thematics chrome={langBlock(thematicsUi, lang)} cards={thematics} lang={lang} />
```

- [ ] **Étape 3 : vérifier le rendu**

```bash
npx astro build
node -e "
const fs=require('fs');
const norm = p => fs.readFileSync(p,'utf8').replace(/\s+/g,' ').trim();
for (const p of ['index.html','en/index.html','es/index.html']) {
  const a = norm('../dist-reference/'+p), b = norm('dist/'+p);
  console.log(p, a===b ? 'IDENTIQUE' : 'DIFFERENT');
}
"
```

Attendu : trois `IDENTIQUE`.

- [ ] **Étape 4 : commit**

```bash
git add src/components/sections/Thematics.astro src/components/pages/HomePage.astro
git commit -m "refactor(sections): extraire la section des thematiques"
```

---

## Tâche 3 : la section Sessions

**Fichiers :**
- Créer : `src/components/sections/Sessions.astro`
- Modifier : `src/components/pages/HomePage.astro`

**Interfaces consommées :** `langBlock` (tâche 1)

**Interfaces produites :** `Sessions.astro` prend `chrome`, `cards`, `lang` — mêmes types que `Thematics`

- [ ] **Étape 1 : créer la section**

Créer `src/components/sections/Sessions.astro`. Markup repris mot pour mot des lignes 164 à 207 de `HomePage.astro`.

```astro
---
// Intro de section, boite des six pictogrammes, puis cartes de sessions.
//
// Les six pictogrammes sont apparies a leurs libelles ici : les icones sont
// des assets fixes, seuls les libelles viennent du CMS.
import RichText from "../RichText.astro";
import RichBody from "../RichBody.astro";
import { langBlock } from "../../i18n/langBlock";
import { plainText } from "../../i18n/richText";
import { SESSION_IMAGES } from "../../content/sessionImages";

interface Props {
  chrome: Record<string, string>;
  cards: { id: string; data: Record<string, unknown> }[];
  lang: string;
}

const { chrome, cards, lang } = Astro.props;

const features = [
  { icon: "/assets/figma/icon-clock.svg", label: chrome.feat1 },
  { icon: "/assets/figma/icon-organic.svg", label: chrome.feat2 },
  { icon: "/assets/figma/icon-customize.svg", label: chrome.feat3 },
  { icon: "/assets/figma/icon-online.svg", label: chrome.feat4 },
  { icon: "/assets/figma/icon-leader.svg", label: chrome.feat5 },
  { icon: "/assets/figma/icon-organization.svg", label: chrome.feat6 },
];

// Meme convention que les thematiques : le rang est dans le nom de fichier,
// et la photo se retrouve sans ce rang.
const sessionPhoto = (fiche: string) => SESSION_IMAGES[fiche.replace(/^session-\d+-/, "")];
---

<section class="py-12 lg:py-16 bg-white">
  <div class="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-10 lg:gap-14 items-center">

    <h2 class="font-fraunces text-[24px] lg:text-[32px] font-semibold text-center leading-tight">
      <RichText text={chrome.heading} />
    </h2>

    <!-- 6 features box -->
    <div class="w-full border-4 border-[#0698c0] rounded-[17px] bg-[rgba(6,152,192,0.05)] shadow-[0px_0px_7px_rgba(168,168,168,0.25)] p-5 lg:p-6">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        {features.map((f) => (
          <div class="flex flex-col items-center gap-2 py-3 lg:py-4 px-3 text-center">
            <img src={f.icon} alt="" class="w-[44px] h-[44px] lg:w-[52px] lg:h-[52px]" />
            <p class="font-aileron text-black text-[14px] lg:text-[15px] font-bold leading-snug"><RichText text={f.label} /></p>
          </div>
        ))}
      </div>
    </div>

    <!-- Liste des sessions -->
    <div class="flex flex-col gap-5 lg:gap-6 w-full">
      {cards.map((f) => (
        <div class="bg-white border border-[#d9d9d9] rounded-[13px] shadow-[0px_0px_8px_rgba(173,173,173,0.25)] flex flex-col sm:flex-row items-stretch overflow-hidden min-h-[130px] sm:h-[160px]">
          <div class="shrink-0 w-full sm:w-[160px] h-[130px] sm:h-full">
            <img src={sessionPhoto(f.id)} alt={plainText(langBlock(f.data, lang).title)} class="w-full h-full object-cover sm:rounded-bl-[13px] sm:rounded-tl-[13px]" />
          </div>
          <div class="flex flex-col gap-1 px-5 py-3 flex-1">
            <p class="font-fraunces text-[#f05600] text-[15px] lg:text-[16px] font-bold"><RichText text={langBlock(f.data, lang).title} /></p>
            <RichBody text={langBlock(f.data, lang).description} class="font-aileron text-black text-[13px] lg:text-[14px] font-medium leading-[22px]" />
          </div>
        </div>
      ))}

      <a
        href="#"
        data-coming-soon
        class="font-aileron bg-[#0698c0] text-white text-[16px] lg:text-[18px] font-semibold h-[48px] flex items-center justify-center rounded-[7px] w-full hover:bg-cyan-700 transition-colors"
      >
        <RichText text={chrome.seeAll} />
      </a>
    </div>
  </div>
</section>
```

- [ ] **Étape 2 : brancher HomePage**

Ajouter aux imports :

```astro
import Sessions from "../sections/Sessions.astro";
import sessionsUi from "../../content/ui/sessions.json";
```

Supprimer la constante `sessionPhoto` et la constante `features` avec ses six lignes : elles vivent dans le composant.

Remplacer le bloc `<!-- ─── ATELIERS ET MASTERCLASSES ─── -->` et sa `<section>` par :

```astro
    <Sessions chrome={langBlock(sessionsUi, lang)} cards={sessions} lang={lang} />
```

- [ ] **Étape 3 : vérifier le rendu**

```bash
npx astro build
node -e "
const fs=require('fs');
const norm = p => fs.readFileSync(p,'utf8').replace(/\s+/g,' ').trim();
for (const p of ['index.html','en/index.html','es/index.html']) {
  const a = norm('../dist-reference/'+p), b = norm('dist/'+p);
  console.log(p, a===b ? 'IDENTIQUE' : 'DIFFERENT');
}
"
```

Attendu : trois `IDENTIQUE`.

- [ ] **Étape 4 : commit**

```bash
git add src/components/sections/Sessions.astro src/components/pages/HomePage.astro
git commit -m "refactor(sections): extraire la section des sessions"
```

---

## Tâche 4 : les sections Chiffres et Raisons, et l'allègement de `ui.ts`

**Fichiers :**
- Créer : `src/components/sections/Stats.astro`
- Créer : `src/components/sections/Reasons.astro`
- Modifier : `src/components/pages/HomePage.astro`
- Modifier : `src/i18n/ui.ts`

**Interfaces consommées :** `langBlock` (tâche 1)

**Interfaces produites :** `Stats.astro` prend `chrome` ; `Reasons.astro` prend `chrome`, `badgeScience`, `cards`, `lang`

- [ ] **Étape 1 : créer la section Chiffres**

Créer `src/components/sections/Stats.astro`. Markup repris des lignes 209 à 233.

```astro
---
// Bande de chiffres animes.
//
// Les trois nombres sont volontairement hors CMS : StatCounter les anime et
// a besoin d entiers, pas de texte libre. Seules les legendes sont editables.
// Les mettre a jour demande un commit.
import RichText from "../RichText.astro";
import StatCounter from "../StatCounter.astro";

interface Props {
  chrome: Record<string, string>;
}

const { chrome } = Astro.props;

const STATS = [
  { value: 600000, label: chrome.participants },
  { value: 2000, label: chrome.organizations },
  { value: 5, label: chrome.years },
];
---

<section class="relative py-16 lg:py-24 overflow-hidden">
  <div class="absolute inset-0">
    <img src="/assets/figma/stats-bg.png" alt="" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-black/40"></div>
  </div>
  <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center gap-8 lg:gap-10">
    <div class="flex flex-col items-center gap-4 lg:gap-5 text-center">
      <div class="bg-[rgba(6,152,192,0.53)] px-6 h-[44px] flex items-center justify-center rounded-full">
        <span class="text-[#47cdf2] text-[13px] lg:text-[15px] font-semibold"><RichText text={chrome.badgeScience} /></span>
      </div>
      <p class="font-fraunces text-[22px] lg:text-[32px] font-semibold text-white text-center leading-snug max-w-[640px]">
        <RichText text={chrome.heading} />
      </p>
    </div>
    <div class="flex flex-col md:flex-row gap-10 md:gap-20 items-center justify-center text-center">
      {STATS.map((s) => (
        <div class="flex flex-col items-center gap-2 lg:gap-3">
          <StatCounter value={s.value} class="font-fraunces text-[44px] lg:text-[72px] font-semibold text-white leading-none" />
          <span class="font-aileron text-[20px] lg:text-[28px] font-semibold text-[#47cdf2]"><RichText text={s.label} /></span>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Étape 2 : créer la section Raisons**

Créer `src/components/sections/Reasons.astro`. Markup repris des lignes 235 à 269.

```astro
---
// Les 6 bonnes raisons. La carte affiche son rang, il n y a pas de
// pictogramme a choisir.
//
// badgeScience est une prop distincte du reste du decor : la pastille est
// stockee dans le singleton des chiffres et servie aussi par cette section.
// Le passage en props rend ce couplage visible plutot que cache.
import RichText from "../RichText.astro";
import RichBody from "../RichBody.astro";
import { langBlock } from "../../i18n/langBlock";

interface Props {
  chrome: Record<string, string>;
  badgeScience: string;
  cards: { id: string; data: Record<string, unknown> }[];
  lang: string;
}

const { chrome, badgeScience, cards, lang } = Astro.props;
---

<section id="reasons" class="py-12 lg:py-16 bg-white scroll-mt-16 lg:scroll-mt-20">
  <div class="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-7 lg:gap-9">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:gap-5">
      <div class="bg-[#0698c0] px-6 h-[44px] flex items-center justify-center rounded-full self-start">
        <span class="text-white text-[13px] lg:text-[15px] font-semibold"><RichText text={badgeScience} /></span>
      </div>
      <h2 class="font-fraunces text-[24px] lg:text-[34px] font-semibold leading-tight">
        <RichText text={chrome.heading} />
      </h2>
      <div class="font-aileron flex flex-col gap-3 text-[15px] lg:text-[17px] font-medium text-black">
        <RichBody text={chrome.body} />
      </div>
    </div>

    <!-- Reason cards — 3×2 grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((r, i) => (
        <div class="border border-[#d9d9d9] rounded-[14px] bg-white p-6 lg:p-7 flex flex-col gap-4 shadow-sm">
          <div class="flex items-center gap-4">
            <span class="font-fraunces text-[48px] lg:text-[56px] font-bold text-[#0698c0] leading-none shrink-0">{i + 1}</span>
            <p class="font-fraunces text-[16px] lg:text-[17px] font-bold text-black leading-snug">
              <RichText text={langBlock(r.data, lang).title} />
            </p>
          </div>
          <div class="font-aileron text-[14px] lg:text-[15px] text-[#3b3b3b] leading-snug flex flex-col gap-1">
            <RichBody text={langBlock(r.data, lang).text} />
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Étape 3 : finir HomePage**

`src/components/pages/HomePage.astro` doit maintenant tenir en entier dans ceci — le remplacer intégralement :

```astro
---
// Page d'accueil, destinee aux entreprises. Elle ne fait que composer des
// sections : tout son texte vient de Keystatic, via les singletons de decor
// et les collections de cartes.
import Layout from "../../layouts/Layout.astro";
import OrganizationSchema from "../OrganizationSchema.astro";
import { getCollection, getEntry } from "astro:content";
import { t } from "../../i18n/ui";
import { langBlock } from "../../i18n/langBlock";
import Hero from "../sections/Hero.astro";
import Thematics from "../sections/Thematics.astro";
import Sessions from "../sections/Sessions.astro";
import Stats from "../sections/Stats.astro";
import Reasons from "../sections/Reasons.astro";
import thematicsUi from "../../content/ui/thematics.json";
import sessionsUi from "../../content/ui/sessions.json";
import statsUi from "../../content/ui/stats.json";
import reasonsUi from "../../content/ui/reasons.json";

interface Props {
  lang: string;
}

const { lang } = Astro.props;

const homepage = (await getEntry("homepage", "index"))!.data;

// Le rang vit dans le nom de fichier, seule source de l ordre d affichage.
const parRang = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id);
const thematics = (await getCollection("thematics")).sort(parRang);
const sessions = (await getCollection("sessions")).sort(parRang);
const reasons = (await getCollection("reasons")).sort(parRang);

const stats = langBlock(statsUi, lang);
---

<Layout title={t(lang, "seo.home.title")} description={t(lang, "seo.home.description")} alternates>
  <OrganizationSchema />
  <main class="pt-[80px]">
    <Hero intro={langBlock(homepage, lang)} ctaHref="#reasons" />
    <Thematics chrome={langBlock(thematicsUi, lang)} cards={thematics} lang={lang} />
    <Sessions chrome={langBlock(sessionsUi, lang)} cards={sessions} lang={lang} />
    <Stats chrome={stats} />
    <Reasons chrome={langBlock(reasonsUi, lang)} badgeScience={stats.badgeScience} cards={reasons} lang={lang} />
  </main>
</Layout>
```

Noter la disparition de la prop `audience`, declarée mais jamais lue depuis l'origine.

- [ ] **Étape 4 : alléger `ui.ts`**

Dans `src/i18n/ui.ts`, supprimer **dans chacun des trois blocs de langue** les 20 clés désormais servies en props :

`badge.science`, `stats.heading`, `stats.participants`, `stats.organizations`, `stats.years`, `thematics.badge`, `thematics.heading`, `thematics.body`, `thematics.learnMore`, `sessions.heading`, `sessions.feat1` à `sessions.feat6`, `sessions.seeAll`, `reasons.heading`, `reasons.body`.

Supprimer aussi les quatre imports devenus inutiles en tête de fichier :

```ts
import statsUi from "../content/ui/stats.json";
import thematicsUi from "../content/ui/thematics.json";
import sessionsUi from "../content/ui/sessions.json";
import reasonsUi from "../content/ui/reasons.json";
```

**Conserver** `import footerUi from "../content/ui/footer.json";`, l'aide `lang()` et toutes les clés `footer.*`, `nav.*`, `seo.*` et `contact.*` : `Footer.astro` les lit toujours par `t()`, et il est hors périmètre.

Vérifier le compte :

```bash
grep -c '"badge.science"\|"stats\.\|"thematics\.\|"sessions\.\|"reasons\.' src/i18n/ui.ts
```

Attendu : `0`.

- [ ] **Étape 5 : vérifier le rendu et le contenu**

```bash
npx astro build
node -e "
const fs=require('fs');
const norm = p => fs.readFileSync(p,'utf8').replace(/\s+/g,' ').trim();
for (const p of ['index.html','en/index.html','es/index.html','contact/index.html','evenements/index.html']) {
  const a = norm('../dist-reference/'+p), b = norm('dist/'+p);
  console.log(p, a===b ? 'IDENTIQUE' : 'DIFFERENT');
}
"
```

Attendu : cinq `IDENTIQUE`. `/contact` et `/evenements` sont dans la liste parce qu'ils partagent le `Footer`, dont les clés viennent d'être frôlées.

- [ ] **Étape 6 : commit**

```bash
git add src/components/sections/Stats.astro src/components/sections/Reasons.astro src/components/pages/HomePage.astro src/i18n/ui.ts
git commit -m "refactor(sections): extraire les chiffres et les raisons, alleger ui.ts"
```

---

## Tâche 5 : la fabrique de champs par langue

**Fichiers :**
- Modifier : `keystatic.config.ts`

**Interfaces produites :** `perLang(shape: () => Record<string, unknown>, quoi: string)` rend `{ fr, en, es }`

- [ ] **Étape 1 : ajouter la fabrique**

Dans `keystatic.config.ts`, après la définition de `champParagraphes` (autour de la ligne 40) :

```ts
/** Rend les trois blocs de langue d une meme forme de champs.
 *
 *  La forme est une fonction et non un objet : chaque langue doit recevoir
 *  ses propres instances de champs Keystatic, pas trois references vers les
 *  memes. `quoi` decrit le bloc, la phrase finale est completee ici. */
const perLang = (shape: () => Record<string, unknown>, quoi: string) => ({
    fr: fields.object(shape(), { label: 'Français', description: `${quoi}, version française.` }),
    en: fields.object(shape(), { label: 'Anglais', description: `${quoi}, version anglaise.` }),
    es: fields.object(shape(), { label: 'Espagnol', description: `${quoi}, version espagnole.` }),
});
```

- [ ] **Étape 2 : convertir les entrées existantes**

Pour chaque singleton et chaque collection dont le schéma est `{ fr: fields.object(...), en: ..., es: ... }`, remplacer les trois déclarations par un appel unique. Exemple sur `thematicsSection` :

```ts
        thematicsSection: singleton({
            label: '📝 Thématiques',
            path: 'src/content/ui/thematics',
            format: { data: 'json' },
            schema: perLang(() => ({
                heading: champLigne('Titre'),
                badge: champLigne('Pastille'),
                body: champParagraphes('Texte'),
                learnMore: champLigne('Texte du bouton des cartes'),
            }), 'Le texte au-dessus des cartes de thematiques'),
        }),
```

La chaîne passée en second argument est la description **sans** son suffixe de langue : `perLang` ajoute « , version française. » et ses équivalents. Reprendre le texte existant en retirant ce suffixe.

Les collections gardent leur `title: fields.slug(...)` hors de `perLang`, qui ne produit que les trois blocs de langue :

```ts
            schema: {
                title: fields.slug({ name: { label: 'Nom de la fiche', description: "Sert de nom de fichier et de reperage dans la liste. N'apparait pas sur le site." } }),
                ...perLang(() => ({
                    title: champLigne('Titre de la carte'),
                    description: champParagraphes('Description'),
                }), 'La carte de cette session'),
            },
```

- [ ] **Étape 3 : vérifier que le schéma produit n'a pas bougé**

C'est le point critique : la conversion doit être à diff nul.

```bash
npx astro build
git status --short src/content/
```

Attendu : `[build] Complete!` et **aucune sortie** de `git status` — aucun JSON de contenu n'a changé.

Puis, en éditant réellement dans le CMS :

```bash
npm run dev:cms
```

Ouvrir un écran, modifier un champ, enregistrer, annuler la modification, réenregistrer, puis :

```bash
git diff --stat src/content/
```

Attendu : aucune sortie. Un diff signalerait que la conversion a changé la forme du JSON.

- [ ] **Étape 4 : commit**

```bash
git add keystatic.config.ts
git commit -m "refactor(cms): une fabrique rend les trois blocs de langue"
```

- [ ] **Étape 5 : retirer la référence**

La première moitié est terminée et vérifiée. La référence de non-régression n'a plus d'objet.

```bash
rm -rf ../dist-reference
```

---

## Tâche 6 : les collections et le contenu université

**Fichiers :**
- Modifier : `src/content/config.ts`
- Créer : `src/content/university/index.json`
- Créer : `src/content/ui/university-thematics.json`, `src/content/ui/university-sessions.json`
- Créer : `src/content/university-thematics/thematic-0{1..6}-*.json`
- Créer : `src/content/university-sessions/session-0{1..3}-*.json`

**Interfaces produites :** collections Astro `university`, `university-thematics`, `university-sessions`

- [ ] **Étape 1 : déclarer les trois collections**

Dans `src/content/config.ts`, après la définition de `homepage` :

```ts
// Hero de la page universite. Meme forme que celui de la home.
const university = defineCollection({
    type: 'data',
    schema: z.object({
        fr: introBlock,
        en: introBlock,
        es: introBlock,
    }),
});

// Cartes propres a la page universite. Collections distinctes de celles de
// la home : le menu du CMS se construit a partir de ui.navigation, et une
// collection ne peut figurer que dans un seul groupe.
const universityThematics = defineCollection({
    type: 'data',
    schema: z.object({ title: z.string(), fr: cardBlock, en: cardBlock, es: cardBlock }),
});

const universitySessions = defineCollection({
    type: 'data',
    schema: z.object({ title: z.string(), fr: cardBlock, en: cardBlock, es: cardBlock }),
});
```

Puis étendre l'export. **Le nom de la collection doit être exactement le nom du dossier**, d'où les clés entre guillemets :

```ts
export const collections = {
    thematics,
    sessions,
    reasons,
    homepage,
    university,
    'university-thematics': universityThematics,
    'university-sessions': universitySessions,
};
```

- [ ] **Étape 2 : créer le hero université**

Créer `src/content/university/index.json` avec les trois blocs vides — le texte sera écrit dans le CMS :

```json
{
  "fr": {},
  "en": {},
  "es": {}
}
```

- [ ] **Étape 3 : créer le décor université**

Créer `src/content/ui/university-thematics.json` :

```json
{
  "fr": {},
  "en": {},
  "es": {}
}
```

Créer `src/content/ui/university-sessions.json` avec le même contenu.

- [ ] **Étape 4 : créer les six fiches de thématiques**

Six fichiers dans `src/content/university-thematics/`, reprenant les sujets et les rangs de la home pour que les photos se résolvent. Contenu de `thematic-01-climate-carbon-footprint.json` :

```json
{
  "title": "Climat & Empreinte Carbone",
  "fr": {},
  "en": {},
  "es": {}
}
```

Les cinq autres, mêmes trois blocs vides, avec pour seule différence le `title` :

| Fichier | `title` |
|---|---|
| `thematic-01-climate-carbon-footprint.json` | `Climat & Empreinte Carbone` |
| `thematic-02-biodiversity.json` | `Biodiversité` |
| `thematic-03-ocean.json` | `Océan` |
| `thematic-04-tailor-made-experience.json` | `L'expérience sur mesure` |
| `thematic-05-desirable-future.json` | `Futur Désirable` |
| `thematic-06-climate-skepticism.json` | `Climatoscepticisme` |

Le `title` de premier niveau est le nom technique de la fiche : il sert au repérage dans la liste du CMS et n'apparaît pas sur le site. Les titres affichés vivent dans les blocs de langue, encore vides.

- [ ] **Étape 5 : créer les trois fiches de sessions**

Trois fichiers dans `src/content/university-sessions/`, sur le modèle ci-dessus :

| Fichier | `title` |
|---|---|
| `session-01-workshop.json` | `Atelier collaboratif` |
| `session-02-masterclass.json` | `Masterclass` |
| `session-03-ocean-walk.json` | `Marche Océane` |

- [ ] **Étape 6 : vérifier que les collections sont valides**

Astro valide les collections de données au build, même si aucune page ne les lit encore.

```bash
npx astro build
```

Attendu : `[build] Complete!` sans `InvalidContentEntryDataError`. Une erreur signale un décalage entre le schéma zod et un JSON.

- [ ] **Étape 7 : commit**

```bash
git add src/content/config.ts src/content/university src/content/university-thematics src/content/university-sessions src/content/ui/university-thematics.json src/content/ui/university-sessions.json
git commit -m "feat(universite): collections et fiches vides pretes a etre remplies"
```

---

## Tâche 7 : les entrées Keystatic de la page université

**Fichiers :**
- Modifier : `keystatic.config.ts`

**Interfaces consommées :** `perLang`, `champLigne`, `champParagraphes` (tâche 5) ; les chemins de contenu (tâche 6)

- [ ] **Étape 1 : ajouter les trois singletons**

Dans le bloc `singletons`, après `homepage` :

```ts
        university: singleton({
            label: '🎓 Introduction',
            path: 'src/content/university/index',
            format: { data: 'json' },
            schema: perLang(() => ({
                titleBase: champLigne('Accroche', 'Au-dessus du titre, en noir.'),
                title: champLigne('Titre', 'En orange.'),
                body: champParagraphes('Texte'),
                tagline: champLigne('Phrase de fin', 'En orange, sous le texte.'),
                cta: champLigne('Texte du bouton'),
            }), "Le bandeau d'introduction de la page universite"),
        }),
        universityThematicsSection: singleton({
            label: '🎓 Thématiques',
            path: 'src/content/ui/university-thematics',
            format: { data: 'json' },
            schema: perLang(() => ({
                heading: champLigne('Titre'),
                badge: champLigne('Pastille'),
                body: champParagraphes('Texte'),
                learnMore: champLigne('Texte du bouton des cartes'),
            }), 'Le texte au-dessus des cartes de thematiques de la page universite'),
        }),
        universitySessionsSection: singleton({
            label: '🎓 Ateliers et masterclasses',
            path: 'src/content/ui/university-sessions',
            format: { data: 'json' },
            schema: perLang(() => ({
                heading: champLigne('Titre'),
                feat1: champLigne('Pictogramme 1', 'Le petit texte sous la premiere icone.'),
                feat2: champLigne('Pictogramme 2'),
                feat3: champLigne('Pictogramme 3'),
                feat4: champLigne('Pictogramme 4'),
                feat5: champLigne('Pictogramme 5'),
                feat6: champLigne('Pictogramme 6'),
                seeAll: champLigne('Texte du bouton du bas'),
            }), 'Le texte de la section des sessions de la page universite'),
        }),
```

- [ ] **Étape 2 : ajouter les deux collections**

Dans le bloc `collections` :

```ts
        'university-thematics': collection({
            label: '🎓 Cartes de thématiques',
            slugField: 'title',
            path: 'src/content/university-thematics/*',
            format: { data: 'json' },
            columns: ['title'],
            schema: {
                title: fields.slug({
                    name: {
                        label: 'Nom de la fiche',
                        description: "Sert de nom de fichier et de reperage dans la liste. N'apparait pas sur le site.",
                    },
                }),
                ...perLang(() => ({
                    title: champLigne('Titre de la carte'),
                    subtitle: champLigne('Sous-titre'),
                    description: champParagraphes('Description'),
                }), 'La carte de cette thematique, page universite'),
            },
        }),
        'university-sessions': collection({
            label: '🎓 Cartes de sessions',
            slugField: 'title',
            path: 'src/content/university-sessions/*',
            format: { data: 'json' },
            columns: ['title'],
            schema: {
                title: fields.slug({
                    name: {
                        label: 'Nom de la fiche',
                        description: "Sert de nom de fichier et de reperage dans la liste. N'apparait pas sur le site.",
                    },
                }),
                ...perLang(() => ({
                    title: champLigne('Titre de la carte'),
                    description: champParagraphes('Description'),
                }), 'La carte de cette session, page universite'),
            },
        }),
```

- [ ] **Étape 3 : déclarer le groupe dans la navigation**

Remplacer le bloc `navigation` par :

```ts
        navigation: {
            "Page d'accueil": [
                'homepage',
                'thematicsSection', 'thematics',
                'sessionsSection', 'sessions',
                'statsSection',
                'reasonsSection', 'reasons',
            ],
            'Page université': [
                'university',
                'universityThematicsSection', 'university-thematics',
                'universitySessionsSection', 'university-sessions',
            ],
            'Événements': ['events'],
            'Tout le site': ['footerSection', 'helpSection'],
        },
```

**Rien ne doit être oublié dans cette liste** : une entrée absente disparaît de l'interface.

Modifier aussi le libellé du singleton des chiffres pour dire qu'il est partagé — il n'apparaît que dans le groupe de la home alors qu'il sert les deux pages :

```ts
            label: '📝 Chiffres clés (les deux pages)',
```

- [ ] **Étape 4 : vérifier dans le CMS**

```bash
npm run dev:cms
```

Ouvrir `http://127.0.0.1:4321/keystatic` et confirmer : un groupe « Page université » apparaît avec ses cinq entrées, chacune s'ouvre sans erreur, et les cartes listent bien six thématiques et trois sessions.

- [ ] **Étape 5 : commit**

```bash
git add keystatic.config.ts
git commit -m "feat(cms): groupe Page universite dans le menu"
```

---

## Tâche 8 : le composant et les routes

**Fichiers :**
- Créer : `src/components/pages/UniversityPage.astro`
- Créer : `src/pages/universites.astro`
- Créer : `src/pages/[lang]/universites.astro`
- Modifier : `src/i18n/ui.ts`

**Interfaces consommées :** les cinq sections (tâches 1 à 4), les collections (tâche 6)

- [ ] **Étape 1 : ajouter les clés SEO**

Dans `src/i18n/ui.ts`, ajouter dans **chacun des trois blocs de langue**, à côté des clés `seo.home.*` :

```ts
    "seo.university.title": "Ateliers Climat & Océan pour l'Enseignement Supérieur",
    "seo.university.description": "Ateliers scientifiques sur le climat, l'océan et la biodiversité pour les universités et grandes écoles. Formats immersifs pour étudiants et personnels.",
```

Version anglaise :

```ts
    "seo.university.title": "Climate & Ocean Workshops for Higher Education",
    "seo.university.description": "Science-based workshops on climate, ocean and biodiversity for universities and colleges. Immersive formats for students and staff.",
```

Version espagnole :

```ts
    "seo.university.title": "Talleres de Clima y Océano para Educación Superior",
    "seo.university.description": "Talleres científicos sobre clima, océano y biodiversidad para universidades y escuelas superiores. Formatos inmersivos para estudiantes y personal.",
```

Ajouter également, dans les trois blocs, le libellé du lien de navigation :

```ts
    "nav.university": "Universités",   // fr
    "nav.university": "Universities",  // en
    "nav.university": "Universidades", // es
```

- [ ] **Étape 2 : créer le composant**

Créer `src/components/pages/UniversityPage.astro` :

```astro
---
// Page destinee au public universitaire. Elle compose quatre des cinq
// sections de la home : les 6 bonnes raisons en sont absentes, leur contenu
// etant entierement tourne vers l entreprise.
//
// La bande de chiffres est partagee avec la home, singleton compris : memes
// nombres, memes legendes.
import Layout from "../../layouts/Layout.astro";
import { getCollection, getEntry } from "astro:content";
import { t } from "../../i18n/ui";
import { langBlock } from "../../i18n/langBlock";
import Hero from "../sections/Hero.astro";
import Thematics from "../sections/Thematics.astro";
import Sessions from "../sections/Sessions.astro";
import Stats from "../sections/Stats.astro";
import universityThematicsUi from "../../content/ui/university-thematics.json";
import universitySessionsUi from "../../content/ui/university-sessions.json";
import statsUi from "../../content/ui/stats.json";

interface Props {
  lang: string;
}

const { lang } = Astro.props;

const university = (await getEntry("university", "index"))!.data;

const parRang = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id);
const thematics = (await getCollection("university-thematics")).sort(parRang);
const sessions = (await getCollection("university-sessions")).sort(parRang);
---

<Layout title={t(lang, "seo.university.title")} description={t(lang, "seo.university.description")} alternates>
  <main class="pt-[80px]">
    <Hero intro={langBlock(university, lang)} ctaHref="#thematics" />
    <Thematics chrome={langBlock(universityThematicsUi, lang)} cards={thematics} lang={lang} id="thematics" />
    <Sessions chrome={langBlock(universitySessionsUi, lang)} cards={sessions} lang={lang} />
    <Stats chrome={langBlock(statsUi, lang)} />
  </main>
</Layout>
```

`OrganizationSchema` n'est pas repris : son commentaire indique qu'il est destiné à la page d'accueil, et `/contact` ne le porte pas non plus.

- [ ] **Étape 3 : créer les routes**

Créer `src/pages/universites.astro` :

```astro
---
import UniversityPage from "../components/pages/UniversityPage.astro";
---

<UniversityPage lang="fr" />
```

Créer `src/pages/[lang]/universites.astro`, sur le modèle exact de `src/pages/[lang]/contact.astro` :

```astro
---
import UniversityPage from "../../components/pages/UniversityPage.astro";

export function getStaticPaths() {
  return [{ params: { lang: "en" } }, { params: { lang: "es" } }];
}

const { lang } = Astro.params;
---

<UniversityPage lang={lang} />
```

- [ ] **Étape 4 : vérifier**

```bash
npx astro build
echo "--- les trois pages existent ---"
for p in universites en/universites es/universites; do test -f dist/$p/index.html && echo "OK $p"; done
echo "--- quatre sections, pas cinq ---"
grep -o '<section' dist/universites/index.html | wc -l
echo "--- pas de section reasons ---"
grep -o 'id="reasons"' dist/universites/index.html | wc -l
echo "--- hreflang emis ---"
grep -o 'hreflang="[a-z-]*"' dist/universites/index.html | sort -u
echo "--- les photos des cartes se resolvent malgre la collection distincte ---"
grep -o '/assets/images/activities/[a-z0-9.-]*' dist/universites/index.html | sort -u
echo "--- la home a toujours ses cinq sections ---"
grep -o '<section' dist/index.html | wc -l
echo "--- sitemap ---"
grep -o 'universites' dist/sitemap-0.xml | wc -l
```

Attendu : trois `OK`, `4` sections, `0` occurrence de `id="reasons"`, quatre `hreflang` (`fr`, `en`, `es`, `x-default`), `5` sections sur la home, et `3` occurrences dans le sitemap.

Les photos sont le point le plus facile à casser : les six thématiques et les trois sessions doivent lister exactement les mêmes fichiers que la home, `THEMATIC_IMAGES` et `SESSION_IMAGES` étant partagées. Une liste vide signifierait que la clé calculée depuis le nom de fiche ne correspond plus.

- [ ] **Étape 5 : commit**

```bash
git add src/components/pages/UniversityPage.astro src/pages/universites.astro "src/pages/[lang]/universites.astro" src/i18n/ui.ts
git commit -m "feat(universite): la page et ses trois routes"
```

---

## Tâche 9 : le lien dans le header

**Fichiers :**
- Modifier : `src/components/Header.astro`

**Interfaces consommées :** `nav.university` (tâche 8), les routes (tâche 8)

- [ ] **Étape 1 : ajouter le lien dans la nav desktop**

Dans `src/components/Header.astro`, à l'intérieur du `<nav class="hidden md:flex …">`, **avant** le commentaire `<!-- CTA -->` :

```astro
        <a
          href={`${prefix}/universites`}
          class="text-[15px] lg:text-[16px] font-semibold text-black hover:text-[#f05600] transition-colors whitespace-nowrap"
        >
          {t(lang, "nav.university")}
        </a>
```

La page existant dans les trois langues, le lien utilise `prefix` comme ses voisins et n'a pas de condition de langue.

- [ ] **Étape 2 : ajouter le lien dans le menu burger**

Dans le `<div id="mobile-menu" …>`, entre le `<LanguagePicker />` et le lien CTA :

```astro
    <a href={`${prefix}/universites`} class="block text-[16px] font-semibold text-black">
      {t(lang, "nav.university")}
    </a>
```

- [ ] **Étape 3 : vérifier**

```bash
npx astro build
echo "--- 2 liens par page, dans les trois langues ---"
for p in index en/index es/index; do printf "%-10s " $p; grep -o 'href="[^"]*universites"' dist/$p.html | sort | uniq -c | tr '\n' ' '; echo; done
```

Attendu, sur chaque ligne, deux occurrences : `/universites` pour la home française, `/en/universites` pour l'anglaise, `/es/universites` pour l'espagnole.

- [ ] **Étape 4 : vérification visuelle**

```bash
npm run dev
```

Ouvrir `http://localhost:4321/universites` et confirmer : quatre sections, pas de bloc « 6 bonnes raisons », la bande de chiffres identique à celle de la home, les cartes affichées mais vides de texte — c'est le résultat attendu tant que le CMS n'est pas rempli. Puis passer la fenêtre sous 768 px et vérifier que « Universités » apparaît dans le menu burger.

- [ ] **Étape 5 : commit**

```bash
git add src/components/Header.astro
git commit -m "feat(nav): lien Universites dans le header"
```

---

## Vérification finale

- [ ] **Étape 1 : build complet**

```bash
npm run build
```

Attendu : `No new URLs to scrape — cache is up to date.` puis `[build] Complete!`.

- [ ] **Étape 2 : la convention d'écriture fonctionne sur les champs université**

```bash
npm run dev:cms
```

Dans le CMS, écrire dans le titre du hero université : `Cap sur **l'avenir** et __la science__`, enregistrer, puis ouvrir `/universites` : « l'avenir » doit s'afficher en orange et « la science » en cyan.

Dans le même champ, écrire `<script>alert(1)</script>`, enregistrer : la balise doit s'afficher telle quelle sur la page, sans s'exécuter.

Rétablir ensuite un contenu vide.

- [ ] **Étape 3 : la home est intacte**

```bash
git diff qa --stat -- src/content/thematics src/content/sessions src/content/reasons src/content/homepage src/content/ui/thematics.json src/content/ui/sessions.json src/content/ui/stats.json src/content/ui/reasons.json src/content/ui/footer.json
```

Attendu : aucune sortie. Aucun contenu de la home n'a été modifié par ce travail.
