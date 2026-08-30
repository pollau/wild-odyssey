// Le bloc d'une langue dans un objet groupe par langue, qu il vienne d un
// singleton de decor ou d une fiche de collection : les deux ont la meme
// forme { fr: {...}, en: {...}, es: {...} }.
//
// Renvoie un objet vide quand la langue manque. Keystatic omet les champs
// vides du JSON, donc une cle absente veut dire "pas de texte dans cette
// langue" et non "pas encore traduit" : on ne replie jamais sur l anglais.
export const langBlock = (o: unknown, lang: string): Record<string, string> =>
    ((o as Record<string, Record<string, string>> | undefined)?.[lang] ?? {});
