// Photos des cartes de thematiques, volontairement hors Keystatic.
//
// Deux raisons. D'abord le champ image de Keystatic perd sa valeur a
// chaque enregistrement d'une fiche (constate et reproduit) : la photo
// disparaissait des qu'on editait un texte. Ensuite les photos ne sont
// pas du contenu que l'on veut voir modifie depuis le CMS.
//
// La cle est le nom du fichier de la thematique, sans l'extension.
export const ACTIVITY_IMAGES: Record<string, { src: string; position: string }> = {
  "2030-glorieuses": { src: "/assets/images/activities/futur-desirable.jpg", position: "center" },
  "carbon-footprint": { src: "/assets/images/activities/carbon-globe-blocks.jpg", position: "center" },
  "climate-skeptic-dinner": { src: "/assets/images/activities/climate-skeptic-dinner.webp", position: "center" },
  "experience-sur-mesure": { src: "/assets/images/activities/experience-sur-mesure.jpg", position: "center" },
  "ocean-systemic": { src: "/assets/images/activities/ocean.jpg", position: "bottom" },
  "risks-dependencies": { src: "/assets/images/activities/biodiversite.jpg", position: "bottom" },
};
