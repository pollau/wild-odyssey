// L'aide affichee dans le CMS : le bandeau en haut de chaque section et la
// page "Comment ecrire les textes". Ce sont des champs d'affichage : ils
// montrent du texte dans le formulaire et n'enregistrent rien.
//
// Les marqueurs, leurs couleurs et les exemples viennent de richText.ts, le
// parseur du site : l'aide ne peut pas annoncer autre chose que ce que le
// site affiche.
//
// Pas de JSX ici : ce fichier est charge par keystatic.config.ts, un .ts.
import { createElement as h, type ReactNode } from 'react';
import type { BasicFormField } from '@keystatic/core';
import { ACCENTS, couleurAccent, parseRichText } from '../i18n/richText';

/** Ce que fait la touche Entree, dit sous les champs concernes et repris
 *  mot pour mot par la page d'aide. Les champs d'une seule ligne n'ont pas
 *  de phrase : Entree n'y fait rien. */
export const ENTREE_LIGNE = 'Entrée passe à la ligne.';
export const ENTREE_PARAGRAPHE = 'Entrée crée un nouveau paragraphe.';

// Les polices sont celles de l'interface Keystatic (variables de @keystar/ui) :
// sans elles, ces blocs prendraient la police par defaut du navigateur.
const S = {
    note: { fontFamily: 'var(--kui-typography-font-family-base)', fontSize: 14, lineHeight: 1.6 },
    bandeau: { margin: 0, padding: '8px 12px', borderRadius: 6, background: 'rgba(127, 127, 127, 0.12)' },
    titre: { fontSize: 17, fontWeight: 600, margin: '0 0 8px' },
    liste: { margin: '6px 0 10px', paddingLeft: 22 },
    code: { fontFamily: 'var(--kui-typography-font-family-code)', padding: '1px 5px', borderRadius: 4, background: 'rgba(127, 127, 127, 0.18)' },
    // Un bout de page du site : fond blanc, texte noir, comme les sections claires.
    site: { display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: '#fff', color: '#000', fontWeight: 600 },
    lien: { color: 'inherit', textDecoration: 'underline' },
} as const;

/** Champ d'affichage : rend `contenu` dans le formulaire. `serialize` renvoie
 *  undefined, Keystatic n'ecrit donc aucune cle dans le JSON. */
const note = (contenu: () => ReactNode): BasicFormField<null> => ({
    kind: 'form',
    Input: () => h('div', { style: S.note }, contenu()),
    defaultValue: () => null,
    parse: () => null,
    serialize: () => ({ value: undefined }),
    validate: (valeur) => valeur,
    reader: { parse: () => null },
});

/** Un texte rendu comme sur le site, avec ses couleurs. */
const apercu = (source: string) =>
    h('span', { style: S.site }, ...parseRichText(source).flatMap((segments, i) => [
        i > 0 ? h('br', { key: `br${i}` }) : null,
        ...segments.map((s, j) =>
            s.accent === 'none' ? s.text : h('span', { key: `${i}-${j}`, style: { color: couleurAccent(s.accent) } }, s.text)),
    ]));

const code = (texte: string) => h('code', { style: S.code }, texte);

/** Lien vers la page d'aide. Il garde la branche courante en mode cloud
 *  (/keystatic/branch/<branche>/...) et s'ouvre dans un nouvel onglet, pour
 *  ne rien perdre de la saisie en cours. */
const lienAide = () => {
    const base = typeof location === 'undefined'
        ? '/keystatic'
        : location.pathname.split(/\/(?:singleton|collection)\//)[0];
    return h('a', { href: `${base}/singleton/helpSection`, target: '_blank', rel: 'noopener', style: S.lien },
        '❓ Comment écrire les textes');
};

/** Bandeau en haut de chaque section : la convention n'est rappelee qu'ici,
 *  une fois, et pas sous chaque champ. */
export const bandeauAide = () => note(() =>
    h('p', { style: S.bandeau }, '🎨 Couleurs et retours à la ligne : voir ', lienAide(), '.'));

/** Bandeau du referencement, dont les textes ne s'affichent pas sur le site. */
export const bandeauSeo = () => note(() =>
    h('p', { style: S.bandeau },
        "🔎 Ces textes s'affichent dans les résultats de recherche Google, pas sur les pages. "
        + "Les marqueurs de couleur n'y fonctionnent pas."));

// Les blocs de la page d'aide.
const EXEMPLE = 'Une méthodologie commune, **des thématiques au choix.**';

export const aideCouleur = () => note(() => h('div', null,
    h('h3', { style: S.titre }, '🎨 Mettre un passage en couleur'),
    h('p', null, 'Tous les champs fonctionnent de la même façon. Sans marqueur, le texte garde la couleur '
        + "normale de l'endroit : noir sur fond clair, blanc sur fond sombre."),
    h('p', null, "Pour colorer un passage, on l'encadre de deux signes identiques :"),
    h('ul', { style: S.liste }, ...Object.values(ACCENTS).map(({ marqueur, nom }) => {
        const source = `${marqueur}en ${nom}${marqueur}`;
        return h('li', { key: nom }, code(source), '  donne  ', apercu(source));
    })),
    h('p', null, 'Exemple, tel qu\'on le tape :'),
    h('p', null, code(EXEMPLE)),
    h('p', null, 'et tel qu\'il s\'affiche sur le site :'),
    h('p', null, apercu(EXEMPLE)),
    h('p', { style: { marginTop: 12 } }, 'À savoir :'),
    h('ul', { style: S.liste },
        h('li', null, 'Seul le passage encadré change de couleur, le reste du texte ne bouge pas.'),
        h('li', null, 'Si un signe manque, rien ne casse : les signes restent simplement visibles.'),
        h('li', null, 'Pas de marqueurs dans les boutons et les pastilles : ils ont déjà leur propre couleur.'),
        h('li', null, 'Le référencement Google ignore les marqueurs.')),
));

export const aideLigne = () => note(() => h('div', null,
    h('h3', { style: S.titre }, '↩️ Aller à la ligne'),
    h('p', null, 'Sous certains champs, une phrase indique ce que fait la touche Entrée :'),
    h('ul', { style: S.liste },
        h('li', null, h('strong', null, ENTREE_PARAGRAPHE), " Dans les textes, avec l'espace entre deux paragraphes."),
        h('li', null, h('strong', null, ENTREE_LIGNE), ' Dans certains titres, la suite passe simplement à la ligne.'),
        h('li', null, h('strong', null, 'Pas de phrase.'), ' Le champ tient sur une seule ligne.')),
));

export const aideLangues = () => note(() => h('div', null,
    h('h3', { style: S.titre }, '🌍 Les trois langues'),
    h('p', null, 'Chaque section contient un bloc Français, un Anglais et un Espagnol. '
        + "Un champ laissé vide n'affiche rien dans cette langue : le site ne va jamais "
        + "chercher la version d'une autre langue à la place."),
));

export const aidePhotos = () => note(() => h('div', null,
    h('h3', { style: S.titre }, '📷 Les photos'),
    h('p', null, 'Les photos ne se changent pas depuis le CMS, elles font partie de la maquette. '
        + 'Passez par Paul pour en remplacer une.'),
));
