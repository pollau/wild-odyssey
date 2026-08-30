// Le seul endroit ou l'on interprete un texte saisi dans le CMS.
//
// Une seule convention, valable dans tous les champs du CMS :
//
//   **texte**   couleur d'accent principale, l'orange de la charte
//   __texte__   couleur d'accent secondaire, le cyan
//   Entree      un nouveau paragraphe, ou un saut de ligne dans un titre
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
// les doubles asterisques et les doubles tirets bas sont reserves a la
// couleur, on ne peut pas en afficher deux litteralement dans un meme texte.
// Les asterisques et tirets bas simples restent libres.

export type Accent = 'none' | 'primary' | 'secondary';
export type Segment = { text: string; accent: Accent };

const MARKER = /\*\*(.+?)\*\*|__(.+?)__/g;

function parseLine(line: string): Segment[] {
    const segments: Segment[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    MARKER.lastIndex = 0;
    while ((m = MARKER.exec(line)) !== null) {
        if (m.index > last) segments.push({ text: line.slice(last, m.index), accent: 'none' });
        segments.push({
            text: m[1] ?? m[2],
            accent: m[1] !== undefined ? 'primary' : 'secondary',
        });
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
