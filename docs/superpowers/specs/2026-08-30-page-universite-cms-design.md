# Page université pilotée par le CMS — design

Date : 2026-08-30
Base : branche `qa` (`be4bda5`)
Statut : validé, prêt pour le plan d'implémentation

## Contexte

La page d'accueil s'adresse aux entreprises. On ajoute une page équivalente pour le
public universitaire, éditable par le content manager dans Keystatic au même titre
que la home.

Un premier design existe, daté du 2 août : `2026-08-02-page-universite-design.md`.
**Il est caduc.** Il précède le remaniement CMS et repose sur des notions disparues —
suffixes `_fr`, collection `activities`, textes en dur dans `ui.ts`, vocabulaire
« formats ». La branche `feat/page-universite` qui l'implémente n'est pas une base
de travail.

Le présent design part de `qa`, seule branche de référence.

### Vocabulaire

Le code s'est aligné sur deux mots, à respecter partout :

- **thematic** — une thématique d'atelier (océan, biodiversité, empreinte carbone…)
- **session** — une façon de dérouler un atelier (atelier collaboratif, masterclass,
  marche océane)

« Format » et « workshop » ne doivent plus apparaître comme termes génériques, ni
dans le code, ni dans le CMS, ni dans les noms de fichiers. `session-01-workshop`
reste valide : « workshop » y désigne l'atelier collaboratif en particulier.

Les deux publics sont **entreprises** (la home) et **universités**. C'est l'état
final : le modèle les nomme explicitement plutôt que de se généraliser.

## Ce que la page reprend

| Section | Décor | Cartes |
|---|---|---|
| Hero | propre à l'université | — |
| Thématiques | propre à l'université | propres à l'université |
| Sessions | propre à l'université | propres à l'université, mêmes trois sessions |
| Chiffres | **partagé avec la home, à l'identique** | — |
| 6 bonnes raisons | **absente** | **absente** |

Les six bonnes raisons ne figurent pas sur la page université : leur contenu est
entièrement corporate (fédérer les équipes, EcoVadis, B Corp, CSRD).

Les textes des cartes diffèrent d'un public à l'autre, y compris pour une thématique
présente des deux côtés. **Le partage ne porte donc pas sur le contenu** — il porte
sur le markup, les schémas, les photos et la bande de chiffres. La duplication est
éditoriale, pas structurelle.

## Périmètre

Dans le périmètre :

- extraction des cinq sections de `HomePage.astro` en composants réutilisables
- une page `/universites` dans les trois langues (`fr`, `en`, `es`)
- trois nouveaux singletons de décor et deux nouvelles collections de cartes
- l'entrée de ces cinq éléments dans `ui.navigation`, sous un groupe « Page
  université »
- une fabrique de champs par langue dans `keystatic.config.ts`
- le décor de section transmis en props aux composants, au lieu de transiter par
  `src/i18n/ui.ts`
- un lien « Universités » dans le header, dans les trois langues

Hors périmètre :

- **le correctif du sélecteur de langue** — traité séparément sur la branche
  `fix/language-picker-404`, qui reprend les trois commits restés sur
  `feat/page-universite`. Sans lui, `/evenements` propose toujours `/en/evenements`,
  qui renvoie un 404. Indépendant de ce travail.
- le pied de page et la page d'aide du CMS, inchangés et partagés
- les chiffres animés, qui restent codés en dur
- le partage d'une même carte entre deux publics : chaque public a ses propres
  cartes, il n'y a rien à mutualiser côté contenu

## Décisions reprises de `qa`

Le design s'inscrit dans les conventions posées et ne les rediscute pas :

**Les langues sont des blocs, pas des suffixes.** Chaque objet éditable porte
`fr`, `en`, `es`.

**Aucun repli entre langues sur le contenu.** Une carte non traduite s'affiche vide
plutôt qu'en anglais. Keystatic omettant les champs vides du JSON, une clé absente
signifie « pas de texte dans cette langue », pas « pas encore traduit ».

**Une seule convention d'écriture pour tout le texte éditable**, interprétée par
`src/i18n/richText.ts` : `**texte**` en orange, `__texte__` en cyan, un retour à la
ligne pour un nouveau paragraphe ou un saut de ligne. Deux composants la rendent —
`RichText` en ligne, `RichBody` en paragraphes — et `plainText()` nettoie les
marqueurs pour les attributs comme `alt`. Le parseur ne produit que des données,
jamais du HTML.

**Le rang vit dans le nom de fichier** (`thematic-01-…`), seule source de l'ordre
d'affichage.

**Les photos sont hors CMS**, dans `THEMATIC_IMAGES` et `SESSION_IMAGES`. Le champ
image de Keystatic perd sa valeur à chaque enregistrement, constaté et reproduit.
La clé est le nom du fichier sans son rang.

**Les chiffres des stats sont hors CMS** : `StatCounter` les anime et a besoin
d'entiers.

**Les aides du CMS sont factorisées** par `champLigne` et `champParagraphes`, qui
collent la bonne phrase de convention sous chaque champ. Tout nouveau champ passe
par elles.

## Architecture

### 1. Extraction des sections

C'est le geste central. `HomePage.astro` porte cinq sections dont le markup est
identique à ce dont la page université a besoin — seule la source de données change.

Cinq composants dans `src/components/sections/` :

| Composant | Props |
|---|---|
| `Hero.astro` | `intro` |
| `Thematics.astro` | `chrome`, `cards`, `lang` |
| `Sessions.astro` | `chrome`, `cards`, `lang` |
| `Stats.astro` | `chrome` |
| `Reasons.astro` | `chrome`, `badgeScience`, `cards`, `lang` |

`HomePage.astro` en compose cinq, `UniversityPage.astro` en compose quatre. Le markup
n'existe qu'une fois.

**Une dépendance cachée devient explicite au passage** : la pastille `badgeScience`
est utilisée par la section des chiffres **et** par celle des raisons, alors qu'elle
est stockée dans `src/content/ui/stats.json`. `Reasons` la reçoit donc en prop
distincte de son propre décor.

### 2. Deux collections de cartes par public

Les cartes université vivent dans **leurs propres collections**, et non dans celles
de la home distinguées par un préfixe.

```
src/content/thematics/thematic-01-….json              ← entreprises
src/content/university-thematics/thematic-01-….json   ← universités
src/content/sessions/session-01-workshop.json         ← entreprises
src/content/university-sessions/session-01-….json     ← universités
```

Ce choix est dicté par `ui.navigation`, introduit sur `qa` : **le menu du CMS est
construit uniquement à partir de cette liste**, et une collection ne peut figurer que
dans un seul groupe. Des cartes université logées dans la collection de la home ne
seraient atteignables que sous « Page d'accueil », dans une liste où l'éditeur
devrait deviner lesquelles sont les siennes — exactement ce que la navigation
cherche à éviter.

Trois conséquences heureuses, par rapport à un préfixe partagé :

- aucun filtre à la lecture, `getCollection('university-thematics')` suffit
- les noms de fiches restent `thematic-01-…`, la numérotation d'un public étant
  indépendante de l'autre
- **la clé de photo est inchangée** : la regex `^thematic-\d+-` fonctionne telle
  quelle et les deux publics partagent `THEMATIC_IMAGES` sans rien redéclarer

Le coût est de deux déclarations de collection supplémentaires, de chaque côté —
Zod et Keystatic. Le schéma Zod réutilise `cardBlock` tel quel ; le schéma Keystatic
réutilise la fabrique `perLang` décrite plus bas.

**Nommage, à ne pas se tromper.** Avec les collections de `src/content/config.ts`,
le nom de la collection Astro **doit être exactement le nom du dossier** — c'est le
cas aujourd'hui pour `thematics`, `sessions` et `reasons`. Les deux nouvelles
s'appellent donc `university-thematics` et `university-sessions`, en clés entre
guillemets dans l'objet `collections` puisque le tiret interdit l'identifiant nu :

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

Les mêmes noms sont repris comme clés côté Keystatic et dans `ui.navigation`, pour
qu'un seul identifiant désigne la même chose partout. La lecture se fait donc avec
`getCollection('university-thematics')`.

Le nombre de cartes n'a pas à coïncider entre les deux publics.

**Contenu initial des cartes.** L'implémentation crée six fiches dans
`university-thematics` et trois dans `university-sessions`, sur les mêmes sujets que
la home. Chaque fiche porte son `title` technique renseigné — pour être identifiable
dans la liste du CMS et pour que sa photo se résolve — et ses **trois blocs de langue
vides**.

Ce n'est pas un oubli : recopier les textes entreprises produirait la page dupliquée
qu'on cherche à éviter, et masquerait ce qui reste à écrire. Une carte vide s'affiche
vide, conformément à la règle « aucun repli ». La page part en QA avec sa structure
et son décor, et l'éditeur la remplit carte par carte.

### 3. Le décor université — trois singletons

| Singleton | Fichier | Champs |
|---|---|---|
| Hero université | `src/content/university/index.json` | `titleBase`, `title`, `body`, `tagline`, `cta` |
| Thématiques (université) | `src/content/ui/university-thematics.json` | `heading`, `badge`, `body`, `learnMore` |
| Sessions (université) | `src/content/ui/university-sessions.json` | `heading`, `feat1`…`feat6`, `seeAll` |

Chaque champ est déclaré par `champLigne` ou `champParagraphes`, comme son
équivalent de la home, pour que l'aide affichée sous le champ reste identique.

Les chiffres (`ui/stats.json`) et le pied de page (`ui/footer.json`) restent
partagés : aucun nouveau fichier, aucune saisie en double.

Le hero université est une collection Astro `university` de `type: 'data'`, en
parallèle de `homepage`, avec le même bloc d'introduction. Les deux fichiers
`ui/university-*.json` ne sont pas des collections : ils sont importés directement,
comme leurs équivalents de la home.

### 4. La navigation du CMS

`ui.navigation` gagne un groupe, calqué sur celui de la home :

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

Chaque groupe est autonome : le texte d'une section y voisine ses cartes, et
l'éditeur ne quitte jamais la page sur laquelle il travaille. La section des chiffres
n'apparaît que dans le groupe de la home, puisqu'elle est partagée — son libellé doit
le dire.

**Aucun élément ne doit être oublié dans cette liste** : ce qui n'y figure pas
disparaît de l'interface.

### 5. La fabrique de champs par langue

`keystatic.config.ts` fait 415 lignes. Les aides sont désormais factorisées par
`champLigne` et `champParagraphes`, mais **le triplet de langues reste recopié trois
fois** dans chaque singleton et chaque collection, mot pour mot.

Ajouter cinq entrées université en recopiant ce motif ajouterait une centaine de
lignes de répétition, et chaque retouche de libellé devrait être faite six fois.

```ts
// Rend les trois blocs de langue d'une meme forme de champs. La forme est une
// fonction et non un objet : chaque langue doit recevoir ses propres instances
// de champs Keystatic, pas trois references vers les memes.
const perLang = (shape: () => Record<string, unknown>, quoi: string) => ({
    fr: fields.object(shape(), { label: 'Français', description: `${quoi}, version française.` }),
    en: fields.object(shape(), { label: 'Anglais',  description: `${quoi}, version anglaise.` }),
    es: fields.object(shape(), { label: 'Espagnol', description: `${quoi}, version espagnole.` }),
});
```

Elle est appliquée aux entrées existantes — sans changer leur schéma ni les JSON
produits — puis aux cinq nouvelles, qui deviennent quasi gratuites.

**C'est un remaniement à diff nul côté contenu** : les JSON produits doivent rester
identiques au bit près. C'est le point de vérification principal de cette partie.

### 6. Le décor passe en props

`src/i18n/ui.ts` importe aujourd'hui les JSON de décor et les réexporte en clés
plates (`thematics.badge`, `sessions.feat1`…), lues par `t()`. Ajouter l'université
obligerait à doubler ce mapping — une trentaine de clés `university.*` qui ne
feraient que réexporter un autre fichier.

À la place, chaque page importe le JSON dont elle a besoin, en extrait le bloc de la
langue courante, et le passe en prop à la section.

`ui.ts` perd donc les clés `thematics.*`, `sessions.*`, `reasons.*`, `stats.*` et
`badge.science`, ainsi que les imports correspondants, et redevient le fichier des
chaînes que le CMS ne pilote pas : `nav.*`, `seo.*`, `contact.*`.

`footer.json` reste câblé comme aujourd'hui : `Footer.astro` est un composant global,
hors périmètre.

### 7. Routes et i18n

La page sort dans les trois langues dès le départ :

- `src/pages/universites.astro` → `/universites`
- `src/pages/[lang]/universites.astro` → `/en/universites`, `/es/universites`

Le `Layout` reçoit `alternates`, donc les `hreflang` sont émis pour les trois
locales. Le lien « Universités » du header n'a pas besoin de garde-fou de langue et
utilise `` `${prefix}/universites` `` comme ses voisins, avec un libellé
`nav.university` présent dans les trois blocs de `ui.ts`.

Une langue non saisie dans le CMS affiche des blocs vides — règle déjà retenue pour
les cartes.

## Inventaire des fichiers

| Fichier | Action |
|---|---|
| `src/components/sections/{Hero,Thematics,Sessions,Stats,Reasons}.astro` | créés |
| `src/components/pages/HomePage.astro` | réécrit en composition de cinq sections |
| `src/components/pages/UniversityPage.astro` | créé, composition de quatre sections |
| `src/pages/universites.astro` | créé |
| `src/pages/[lang]/universites.astro` | créé |
| `src/content/university/index.json` | créé |
| `src/content/ui/university-thematics.json` | créé |
| `src/content/ui/university-sessions.json` | créé |
| `src/content/university-thematics/thematic-0*.json` | créés (6) |
| `src/content/university-sessions/session-0*.json` | créés (3) |
| `src/content/config.ts` | collections `university`, `university-thematics`, `university-sessions` |
| `keystatic.config.ts` | fabrique `perLang`, 3 singletons, 2 collections, navigation |
| `src/i18n/ui.ts` | perd le décor de section, gagne `seo.university.*` et `nav.university` |
| `src/components/Header.astro` | lien « Universités » |

Ni `thematicImages.ts` ni `sessionImages.ts` ne changent : les deux publics
partagent les mêmes tables, et la clé reste le nom de fiche sans son rang.

## Flux de données

```
src/content/university/index.json          ─┐
src/content/ui/university-thematics.json   ─┤
src/content/ui/university-sessions.json    ─┼─→ UniversityPage ─→ Hero
src/content/ui/stats.json        (partagé) ─┤                     Thematics
src/content/university-thematics/*.json    ─┤                     Sessions
src/content/university-sessions/*.json     ─┘                     Stats

src/content/homepage/index.json            ─┐
src/content/ui/{thematics,sessions,        ─┼─→ HomePage ───────→ Hero
                reasons,stats}.json        ─┤                     Thematics
src/content/{thematics,sessions,           ─┘                     Sessions
              reasons}/*.json                                     Stats
                                                                  Reasons
```

## Ordre d'implémentation

Le travail se sépare en deux moitiés, et la première doit être terminée et vérifiée
avant que la seconde commence :

1. **Un remaniement à rendu constant** — la fabrique `perLang`, l'extraction des cinq
   sections, le passage du décor en props, l'allègement de `ui.ts`. Aucune page
   nouvelle, aucun contenu nouveau. Le site doit sortir identique.
2. **L'ajout de la page université** — collections, singletons, navigation, routes,
   composant, lien de header. Rien de la home ne bouge plus.

Mélanger les deux rendrait impossible de distinguer une régression de la home d'un
effet attendu de la nouvelle page.

## Vérification

Le projet n'a pas de tests automatisés. Vérification par build et inspection du HTML
généré, plus un contrôle visuel.

**Non-régression de la home** — c'est le risque principal. La référence est capturée
**avant** la première modification : `npm run build`, puis copie de `dist/` de côté.

1. `npm run build` passe
2. le HTML de `/`, `/en/` et `/es/` est équivalent à la référence. Déplacer du markup
   dans un composant Astro peut déplacer des espaces et des retours à la ligne : la
   comparaison se fait **après normalisation des espaces**, et non octet à octet. Ce
   qui doit être strictement identique : le texte visible, la liste des classes de
   chaque élément, et les `href` et `src`.
3. les JSON produits par Keystatic après la fabrique `perLang` sont identiques aux
   actuels : `git diff` vide sur `src/content/` après une édition-annulation dans le
   CMS

**Page université :**

4. `/universites`, `/en/universites` et `/es/universites` répondent et affichent
   quatre sections, sans section « 6 bonnes raisons »
5. le hero, l'intro des thématiques et l'intro des sessions reflètent les trois
   nouveaux fichiers de décor
6. la bande de chiffres affiche les mêmes valeurs et les mêmes légendes que la home
7. la home n'affiche que ses cartes, la page université que les siennes
8. les photos des cartes université se résolvent via `THEMATIC_IMAGES` et
   `SESSION_IMAGES`, sans table dédiée
9. les trois pages émettent leurs `hreflang` vers les deux autres locales
10. le lien « Universités » est présent dans les trois langues, desktop et burger
11. les trois pages apparaissent dans `dist/sitemap-0.xml`
12. `npm run dev:cms` : le groupe « Page université » apparaît dans le menu avec ses
    cinq entrées, chacune éditable, et une modification se propage à la page
13. les marqueurs `**` et `__` saisis dans un champ université produisent bien les
    couleurs, et une balise tapée dans un champ s'affiche telle quelle

## Évolutions prévues

Notées pour que le design ne les bloque pas, non planifiées :

- **un troisième public** — le modèle nomme les deux publics explicitement. Un
  troisième demanderait un troisième groupe de navigation et trois entrées de plus.
  Le motif est répétable ; c'est à ce moment qu'il faudrait se demander si le décor
  ne gagnerait pas à être regroupé par page plutôt que par section.
- **partage d'une carte entre publics** — si une thématique venait à porter le même
  texte des deux côtés, il faudrait un mécanisme de référence plutôt qu'une copie.
  Rien ne le demande aujourd'hui, et ce serait le signe que la prémisse a changé.
- **`Footer.astro`** pourrait rejoindre le modèle en props, par cohérence, le jour où
  on y touchera pour autre chose.
