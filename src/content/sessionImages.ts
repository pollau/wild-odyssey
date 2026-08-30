// Photos des cartes de sessions, volontairement hors Keystatic, pour les memes
// raisons que src/content/thematicImages.ts : le champ image de Keystatic perd
// sa valeur a chaque enregistrement, et les photos ne sont pas du contenu que
// l'on veut voir modifie depuis le CMS.
//
// La cle est le nom du fichier SANS son rang : session-01-workshop se lit ici
// sous la cle "workshop".
export const SESSION_IMAGES: Record<string, string> = {
  "workshop": "/assets/images/activities/workshop-lionel.jpg",
  "masterclass": "/assets/images/activities/masterclass-lionel.jpg",
  "ocean-walk": "/assets/images/activities/marche-oceane.jpg",
};
