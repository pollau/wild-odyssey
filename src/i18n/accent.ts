// Titres a plusieurs couleurs.
//
// Un titre s'ecrit en une seule chaine. Deux marqueurs et un retour a la ligne
// suffisent a decrire tous les titres du site :
//
//   **texte**   couleur d'accent principale, l'orange de la charte
//   __texte__   couleur d'accent secondaire, le cyan. Un seul titre s'en sert,
//               celui de la bande de chiffres, qui melange les deux couleurs
//   un retour a la ligne dans le champ force un retour a la ligne a l'ecran
//
// Le decoupage renvoie des morceaux typés. Le composant AccentTitle les rend
// sous forme de noeuds et jamais de HTML : ce que saisit l'editeur est donc
// toujours echappe, taper une balise l'affiche au lieu de l'executer.
//
// Comportements aux limites, verifies : une paire non fermee laisse ses
// marqueurs visibles, plusieurs paires colorent chacune leur contenu, un
// marqueur isole ne declenche rien. Rien ne casse la page. Corollaire a
// connaitre : les doubles asterisques et les doubles tirets bas sont reserves
// a la couleur, on ne peut pas en afficher deux litteralement dans un titre.
// Les asterisques et tirets bas simples restent libres.
export type TitleBit = {
    text: string;
    kind: 'plain' | 'primary' | 'secondary' | 'break';
};

export function accentBits(source: string): TitleBit[] {
    const bits: TitleBit[] = [];
    // Un retour a la ligne coupe le morceau en deux et insere une rupture.
    const push = (text: string, kind: TitleBit['kind']) => {
        text.split('\n').forEach((part, i) => {
            if (i > 0) bits.push({ text: '', kind: 'break' });
            if (part) bits.push({ text: part, kind });
        });
    };
    const marker = /\*\*(.+?)\*\*|__(.+?)__/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = marker.exec(source)) !== null) {
        if (m.index > last) push(source.slice(last, m.index), 'plain');
        push(m[1] ?? m[2], m[1] !== undefined ? 'primary' : 'secondary');
        last = marker.lastIndex;
    }
    if (last < source.length) push(source.slice(last), 'plain');
    return bits;
}
