import { config, fields, collection, singleton } from '@keystatic/core';

// Stockage :
//  - prod  : cloud (Keystatic Cloud gere l'auth, les modifs partent en commits
//            GitHub depuis le navigateur, aucun serveur requis)
//  - local : fichiers du disque par defaut, pratique pour iterer vite.
//            PUBLIC_KEYSTATIC_STORAGE=cloud (npm run dev:cms) force le mode
//            cloud en local pour tester exactement le parcours de Lionel.
//            Keystatic Cloud n'autorise cette auth locale que depuis
//            http://127.0.0.1 (option "Allow local development" du projet).
const useCloud =
    import.meta.env.PROD || import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'cloud';

export default config({
    storage: useCloud
        ? // Pas de branchPrefix : un prefixe filtrerait le selecteur de branches
          // et empecherait de reprendre une branche existante (qa, une branche
          // technique...). Sans lui, toutes les branches du repo sont
          // selectionnables. Contrepartie : les branches creees depuis
          // l'interface ne sont plus prefixees automatiquement, a nommer
          // explicitement (ex. contenu-hero) pour rester lisibles.
          { kind: 'cloud' }
        : { kind: 'local' },
    cloud: {
        project: 'wild-odyssey/wild-odyssey',
    },
    singletons: {
        events: singleton({
            label: '📅 Événements',
            path: 'src/content/events',
            format: { data: 'json' },
            schema: {
                list: fields.array(
                    fields.object({
                        externalUrl: fields.url({ label: "🔗 Lien de l'événement (Eventbrite, BilletWeb, Meetup…)" }),
                        published:   fields.checkbox({ label: '✅ Publié sur le site', defaultValue: false }),
                    }),
                    {
                        label: 'Événements',
                        itemLabel: (props) => props.fields.externalUrl.value || 'Nouvel événement',
                    }
                ),
            },
        }),
        // Section "Chiffres" de l'accueil. Les libelles vivent dans
        // src/content/ui/stats.json ; ui.ts ne fait que les referencer, il n'y a
        // donc jamais deux sources pour un meme texte.
        statsSection: singleton({
            label: 'Accueil — Chiffres',
            path: 'src/content/ui/stats',
            format: { data: 'json' },
            schema: {
                badgeScience_fr: fields.text({ label: 'Badge (FR) — affiche aussi au-dessus des 6 raisons' }),
                badgeScience_en: fields.text({ label: 'Badge (EN)' }),
                badgeScience_es: fields.text({ label: 'Badge (ES)' }),
                participants_fr: fields.text({ label: 'Libelle Participants (FR)' }),
                participants_en: fields.text({ label: 'Libelle Participants (EN)' }),
                participants_es: fields.text({ label: 'Libelle Participants (ES)' }),
                organizations_fr: fields.text({ label: 'Libelle Organisations (FR)' }),
                organizations_en: fields.text({ label: 'Libelle Organisations (EN)' }),
                organizations_es: fields.text({ label: 'Libelle Organisations (ES)' }),
                years_fr: fields.text({ label: "Libelle Annees d'experience (FR)" }),
                years_en: fields.text({ label: "Libelle Annees d'experience (EN)" }),
                years_es: fields.text({ label: "Libelle Annees d'experience (ES)" }),
            },
        }),
        // Section "Nos thematiques" de l'accueil : le texte simple seulement.
        // Les deux moities du titre colore restent dans ui.ts pour l'instant.
        workshopsSection: singleton({
            label: 'Accueil — Thematiques',
            path: 'src/content/ui/workshops',
            format: { data: 'json' },
            schema: {
                badge_fr: fields.text({ label: 'Badge (FR)' }),
                badge_en: fields.text({ label: 'Badge (EN)' }),
                badge_es: fields.text({ label: 'Badge (ES)' }),
                body1_fr: fields.text({ label: 'Paragraphe 1 (FR)', multiline: true }),
                body1_en: fields.text({ label: 'Paragraphe 1 (EN)', multiline: true }),
                body1_es: fields.text({ label: 'Paragraphe 1 (ES)', multiline: true }),
                body2_fr: fields.text({ label: 'Paragraphe 2 (FR)', multiline: true }),
                body2_en: fields.text({ label: 'Paragraphe 2 (EN)', multiline: true }),
                body2_es: fields.text({ label: 'Paragraphe 2 (ES)', multiline: true }),
                body3_fr: fields.text({ label: 'Paragraphe 3 (FR) — optionnel, masque si vide', multiline: true }),
                body3_en: fields.text({ label: 'Paragraphe 3 (EN) — optionnel, masque si vide', multiline: true }),
                body3_es: fields.text({ label: 'Paragraphe 3 (ES) — optionnel, masque si vide', multiline: true }),
                learnMore_fr: fields.text({ label: 'Bouton des cartes (FR)' }),
                learnMore_en: fields.text({ label: 'Bouton des cartes (EN)' }),
                learnMore_es: fields.text({ label: 'Bouton des cartes (ES)' }),
            },
        }),
        homepage: singleton({
            label: 'Homepage',
            path: 'src/content/homepage/index',
            format: { data: 'json' },
            schema: {
                // Le hero affiche heroTitleBase (en noir) puis heroTitle (en orange).
                // Tout champ present dans le JSON doit etre declare ici, sinon
                // Keystatic refuse d'ouvrir la page ("Key ... is not allowed").
                heroTitleBase_fr: fields.text({ label: 'Hero — accroche noire (FR)' }),
                heroTitle_fr: fields.text({ label: 'Hero — titre orange (FR)' }),
                heroTitleBase_en: fields.text({ label: 'Hero — accroche noire (EN)' }),
                heroTitle_en: fields.text({ label: 'Hero — titre orange (EN)' }),
                heroTitleBase_es: fields.text({ label: 'Hero — accroche noire (ES)' }),
                heroTitle_es: fields.text({ label: 'Hero — titre orange (ES)' }),
                contactEmail: fields.text({ label: 'Contact Email' }),
            },
        }),
    },
    collections: {
        activities: collection({
            label: 'Workshops',
            slugField: 'title',
            path: 'src/content/activities/*',
            format: { data: 'json' },
            schema: {
                // Ordre d'affichage des cartes sur la homepage (croissant).
                order: fields.number({ label: "Ordre d'affichage" }),
                title: fields.slug({ name: { label: 'Name' } }),
                subtitle: fields.text({ label: 'Subtitle (tagline)' }),
                description: fields.text({ label: 'Description (EN)', multiline: true }),
                title_fr: fields.text({ label: 'Name (FR)' }),
                subtitle_fr: fields.text({ label: 'Sous-titre (FR)' }),
                description_fr: fields.text({ label: 'Description (FR)', multiline: true }),
                subtitle_en: fields.text({ label: 'Sous-titre (EN)' }),
                title_es: fields.text({ label: 'Name (ES)' }),
                subtitle_es: fields.text({ label: 'Sous-titre (ES)' }),
                description_es: fields.text({ label: 'Description (ES)', multiline: true }),
                duration: fields.text({ label: 'Duration (e.g. "From 2h")' }),
                participants: fields.text({ label: 'Group size (e.g. "14–30 people")' }),
                format: fields.multiselect({
                    label: 'Formats',
                    options: [
                        { label: 'Workshop', value: 'workshop' },
                        { label: 'Masterclass', value: 'masterclass' },
                        { label: 'Ocean Walk', value: 'ocean-walk' },
                        { label: 'Custom', value: 'custom' },
                    ],
                }),
                theme: fields.select({
                    label: 'Theme',
                    options: [
                        { label: 'Desirable Futures', value: 'desirable-futures' },
                        { label: 'Ocean & Systemic', value: 'ocean' },
                        { label: 'Biodiversity', value: 'biodiversity' },
                        { label: 'Carbon Footprint', value: 'carbon' },
                        { label: 'Climate Skeptic Dinner', value: 'climate-skeptic' },
                        { label: 'Tailor-made', value: 'tailor-made' },
                    ],
                    defaultValue: 'desirable-futures',
                }),
                // Cadrage de la photo dans la carte. Defaut "bottom" pour coller
                // au repli du composant (object-position) et ne rien changer aux
                // cartes qui n'ont pas ce champ aujourd'hui.
                imagePosition: fields.select({
                    label: 'Cadrage de la photo',
                    options: [
                        { label: 'Haut', value: 'top' },
                        { label: 'Centre', value: 'center' },
                        { label: 'Bas', value: 'bottom' },
                    ],
                    defaultValue: 'bottom',
                }),
                image: fields.image({
                    label: 'Cover image',
                    directory: 'public/assets/images/activities',
                    publicPath: '/assets/images/activities/',
                }),
            },
        }),
    },
});
