// Le seul endroit ou l'on interprete un texte saisi dans le CMS.
//
// Une seule convention, valable dans tous les champs du CMS :
//
//   **texte**   orange
//   __texte__   cyan
//   ==texte==   bleu
//   Entree      un nouveau paragraphe, ou un saut de ligne dans un titre
//
// Les marqueurs sont la seule source de couleur editoriale. Un texte sans
// marqueur prend la couleur de son fond, fixee par le composant : noir ou
// gris sur fond clair, blanc sur fond sombre. Aucun champ n'a de couleur
// d'accent par defaut, tous se comportent de la meme facon. Seuls les
// pastilles, les boutons et les etats (page courante, erreur) gardent leur
// propre couleur dans le composant.
//
// Le parseur ne produit que des donnees. Ce sont les composants RichText et
// RichBody qui rendent ces donnees, sous forme de noeuds et jamais de HTML :
// le texte saisi est donc toujours echappe par Astro. Taper une balise
// l'affiche telle quelle au lieu de l'executer, verifie en injectant un
// <script> dans un champ.
//
// Comportements aux limites, verifies : une paire non fermee laisse ses
// marqueurs visibles, plusieurs paires colorent chacune leur contenu, un
// marqueur isole ne declenche rien. Rien ne casse la page. Corollaire :
// les doubles asterisques, doubles tirets bas et doubles egal sont reserves
// a la couleur, on ne peut pas en afficher deux litteralement dans un meme
// texte. Les caracteres simples restent libres.

/** Les couleurs d'accent, definies ici et nulle part ailleurs : le marqueur a
 *  taper, la classe Tailwind du site, et le nom montre dans l'aide du CMS.
 *  Ajouter une couleur, c'est ajouter une ligne ici. La classe reste ecrite
 *  en entier pour que Tailwind la trouve en lisant ce fichier. */
export const ACCENTS = {
    orange: { marqueur: '**', classe: 'text-[#f05600]', nom: 'orange' },
    cyan: { marqueur: '__', classe: 'text-[#47cdf2]', nom: 'cyan' },
    blue: { marqueur: '==', classe: 'text-[#0698c0]', nom: 'bleu' },
} as const;

export type Accent = 'none' | keyof typeof ACCENTS;
export type Segment = { text: string; accent: Accent };

/** La couleur seule, en hexadecimal, pour l'aide du CMS qui n'a pas Tailwind. */
export const couleurAccent = (accent: keyof typeof ACCENTS) =>
    ACCENTS[accent].classe.slice('text-['.length, -1);

// Un groupe capturant par marqueur, dans l'ordre de ACCENTS :
// /\*\*(.+?)\*\*|__(.+?)__|==(.+?)==/g
const ORDRE = Object.keys(ACCENTS) as (keyof typeof ACCENTS)[];
const echapper = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MARKER = new RegExp(
    ORDRE.map((a) => echapper(ACCENTS[a].marqueur)).map((m) => `${m}(.+?)${m}`).join('|'),
    'g',
);

function parseLine(line: string): Segment[] {
    const segments: Segment[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    MARKER.lastIndex = 0;
    while ((m = MARKER.exec(line)) !== null) {
        if (m.index > last) segments.push({ text: line.slice(last, m.index), accent: 'none' });
        const groupe = m.slice(1).findIndex((g) => g !== undefined);
        segments.push({ text: m[groupe + 1], accent: ORDRE[groupe] });
        last = MARKER.lastIndex;
    }
    if (last < line.length) segments.push({ text: line.slice(last), accent: 'none' });
    return segments;
}

/** Decoupe un texte en paragraphes, chacun en segments colores. */
export function parseRichText(source: string | undefined): Segment[][] {
    return (source ?? '').split('\n').map(parseLine);
}

/** Idem, en ecartant les paragraphes vides : deux Entree de suite ne creent
 *  pas de paragraphe fantome. */
export function parseParagraphs(source: string | undefined): Segment[][] {
    return parseRichText(source).filter((p) => p.some((s) => s.text.trim() !== ''));
}

/** Le meme texte, debarrasse de ses marqueurs et de ses retours a la ligne.
 *  Pour les attributs HTML, un alt ou un title, qui ne peuvent recevoir que
 *  du texte brut : sans ce nettoyage ils afficheraient les marqueurs. */
export function plainText(source: string | undefined): string {
    return (source ?? '')
        .replace(MARKER, (_full, ...groupes) => groupes.slice(0, ORDRE.length).find((g) => g !== undefined))
        .split('\n').join(' ');
}
