// Titres bicolores.
//
// Un titre s'ecrit en une seule chaine, et la partie a mettre dans la couleur
// d'accent est encadree de doubles asterisques :
//
//   "Une methodologie commune, **des thematiques au choix.**"
//
// Le decoupage renvoie une alternance : indices pairs dans la couleur normale,
// indices impairs dans la couleur d'accent. Le composant rend des noeuds et
// jamais du HTML, donc ce que saisit l'editeur reste toujours echappe : taper
// une balise l'affiche telle quelle au lieu de l'executer.
//
// Comportement en cas de saisie bancale, verifie : une paire non fermee laisse
// les asterisques visibles, plusieurs paires colorent chacune leur contenu,
// et une double asterisque isolee ne declenche rien. Rien ne casse la page.
// Corollaire a connaitre : la double asterisque est reservee a la couleur, on
// ne peut pas en afficher deux litteralement dans un meme titre. Les
// asterisques simples, elles, restent libres.
export const accentParts = (s: string): string[] => s.split(/\*\*(.+?)\*\*/g);
