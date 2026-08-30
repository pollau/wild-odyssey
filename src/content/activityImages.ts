// Photos des cartes de thematiques, volontairement hors Keystatic.
//
// Deux raisons. D'abord le champ image de Keystatic perd sa valeur a
// chaque enregistrement d'une fiche (constate et reproduit) : la photo
// disparaissait des qu'on editait un texte. Ensuite les photos ne sont
// pas du contenu que l'on veut voir modifie depuis le CMS.
//
// La cle est le nom du fichier de la thematique, sans l'extension.
export const ACTIVITY_IMAGES: Record<string, { src: string; position: string }> = {
  "desirable-future": { src: "/assets/images/activities/futur-desirable.jpg", position: "center" },
  "climate-carbon-footprint": { src: "/assets/images/activities/carbon-globe-blocks.jpg", position: "center" },
  "climate-skepticism": { src: "/assets/images/activities/climate-skeptic-dinner.webp", position: "center" },
  "tailor-made-experience": { src: "/assets/images/activities/experience-sur-mesure.jpg", position: "center" },
  "ocean": { src: "/assets/images/activities/ocean.jpg", position: "bottom" },
  "biodiversity": { src: "/assets/images/activities/biodiversite.jpg", position: "bottom" },
};
