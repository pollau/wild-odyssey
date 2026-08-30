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
    // Interface de Keystatic en francais (boutons, menus, messages).
    ui: {
        brand: { name: 'Wild Odyssey' },
        // Menu regroupe par zone du site, dans l'ordre ou on les rencontre.
        // Les cles sont les noms techniques des collections/singletons.
        // Un groupe par zone du site, dans l'ordre ou on la rencontre en
        // descendant la page. Le texte d'une section et ses cartes sont
        // voisins, pour ne plus avoir a editer un meme bloc a deux endroits.
        // Attention : le menu est construit UNIQUEMENT a partir de cette
        // liste. Une section absente d'ici disparait de l'interface.
        navigation: {
            "Page d'accueil": ['homepage', 'workshopsSection', 'activities', 'statsSection'],
            'Événements': ['events'],
            'Tout le site': ['footerSection'],
        },
    },
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
        // MODELE DE REFERENCE pour les autres sections :
        //  - un libelle qui dit ce que c'est, pas le nom technique
        //  - une description qui dit OU le texte apparait sur le site
        //  - les 3 langues du meme texte regroupees, pour voir les manques
        statsSection: singleton({
            label: 'Chiffres clés',
            path: 'src/content/ui/stats',
            format: { data: 'json' },
            schema: {
                fr: fields.object({
                    badgeScience: fields.text({ label: 'Pastille bleue', description: "Apparait a deux endroits : sur la bande des chiffres et au-dessus des 6 bonnes raisons." }),
                    participants: fields.text({ label: 'Legende du 1er chiffre', description: "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici." }),
                    organizations: fields.text({ label: 'Legende du 2e chiffre', description: 'Sous le compteur +2 000.' }),
                    years: fields.text({ label: 'Legende du 3e chiffre', description: 'Sous le compteur +5.' }),
                }, { label: 'Français', description: "La bande de chiffres de la page d'accueil, version française." }),
                en: fields.object({
                    badgeScience: fields.text({ label: 'Pastille bleue', description: "Apparait a deux endroits : sur la bande des chiffres et au-dessus des 6 bonnes raisons." }),
                    participants: fields.text({ label: 'Legende du 1er chiffre', description: "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici." }),
                    organizations: fields.text({ label: 'Legende du 2e chiffre', description: 'Sous le compteur +2 000.' }),
                    years: fields.text({ label: 'Legende du 3e chiffre', description: 'Sous le compteur +5.' }),
                }, { label: 'Anglais', description: "La bande de chiffres de la page d'accueil, version anglaise." }),
                es: fields.object({
                    badgeScience: fields.text({ label: 'Pastille bleue', description: "Apparait a deux endroits : sur la bande des chiffres et au-dessus des 6 bonnes raisons." }),
                    participants: fields.text({ label: 'Legende du 1er chiffre', description: "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici." }),
                    organizations: fields.text({ label: 'Legende du 2e chiffre', description: 'Sous le compteur +2 000.' }),
                    years: fields.text({ label: 'Legende du 3e chiffre', description: 'Sous le compteur +5.' }),
                }, { label: 'Espagnol', description: "La bande de chiffres de la page d'accueil, version espagnole." }),
            },
        }),
        // Section "Nos thematiques" de l'accueil : le texte simple seulement.
        // Les deux moities du titre colore restent dans ui.ts pour l'instant.
        workshopsSection: singleton({
            label: 'Introduction des thématiques',
            path: 'src/content/ui/workshops',
            format: { data: 'json' },
            schema: {
                badge_fr: fields.text({ label: 'Pastille (FR)' }),
                badge_en: fields.text({ label: 'Pastille (EN)' }),
                badge_es: fields.text({ label: 'Pastille (ES)' }),
                body1_fr: fields.text({ label: 'Paragraphe 1 (FR)', multiline: true }),
                body1_en: fields.text({ label: 'Paragraphe 1 (EN)', multiline: true }),
                body1_es: fields.text({ label: 'Paragraphe 1 (ES)', multiline: true }),
                body2_fr: fields.text({ label: 'Paragraphe 2 (FR)', multiline: true }),
                body2_en: fields.text({ label: 'Paragraphe 2 (EN)', multiline: true }),
                body2_es: fields.text({ label: 'Paragraphe 2 (ES)', multiline: true }),
                body3_fr: fields.text({ label: 'Paragraphe 3 (FR), optionnel : laisser vide pour le masquer', multiline: true }),
                body3_en: fields.text({ label: 'Paragraphe 3 (EN), optionnel : laisser vide pour le masquer', multiline: true }),
                body3_es: fields.text({ label: 'Paragraphe 3 (ES), optionnel : laisser vide pour le masquer', multiline: true }),
                learnMore_fr: fields.text({ label: 'Texte du bouton des cartes (FR)' }),
                learnMore_en: fields.text({ label: 'Texte du bouton des cartes (EN)' }),
                learnMore_es: fields.text({ label: 'Texte du bouton des cartes (ES)' }),
            },
        }),
        // Bas de page, present sur toutes les pages du site. Le titre colore
        // "Et vous ?" reste dans le code : il est coupe en deux morceaux pour
        // le style, le rendre editable demanderait de revoir la mise en forme.
        footerSection: singleton({
            label: 'Pied de page',
            path: 'src/content/ui/footer',
            format: { data: 'json' },
            schema: {
                fr: fields.object({
                        ctaBody1: fields.text({ label: 'Phrase 1' }),
                        ctaBody2: fields.text({ label: 'Phrase 2' }),
                        ctaBtn: fields.text({ label: 'Texte du bouton' }),
                        copyright: fields.text({ label: 'Mention de bas de page' }),
                }, { label: 'Français', description: 'Le bloc en bas de toutes les pages, version française.' }),
                en: fields.object({
                        ctaBody1: fields.text({ label: 'Phrase 1' }),
                        ctaBody2: fields.text({ label: 'Phrase 2' }),
                        ctaBtn: fields.text({ label: 'Texte du bouton' }),
                        copyright: fields.text({ label: 'Mention de bas de page' }),
                }, { label: 'Anglais', description: 'Le bloc en bas de toutes les pages, version anglaise.' }),
                es: fields.object({
                        ctaBody1: fields.text({ label: 'Phrase 1' }),
                        ctaBody2: fields.text({ label: 'Phrase 2' }),
                        ctaBtn: fields.text({ label: 'Texte du bouton' }),
                        copyright: fields.text({ label: 'Mention de bas de page' }),
                }, { label: 'Espagnol', description: 'Le bloc en bas de toutes les pages, version espagnole.' }),
                contactEmail: fields.text({
                    label: 'Adresse de contact',
                    description: "Affichee en bas de chaque page et sur la page A propos. Elle alimente aussi les donnees SEO du site.",
                }),
            },
        }),
        homepage: singleton({
            label: 'Introduction',
            path: 'src/content/homepage/index',
            format: { data: 'json' },
            // Un bloc par langue plutot qu'un bloc par texte : on redige une
            // page entiere d'une traite, comme on la lit sur le site.
            schema: {
                fr: fields.object({
                    titleBase: fields.text({ label: 'Accroche en noir' }),
                    title: fields.text({ label: 'Titre en orange' }),
                    body1: fields.text({ label: 'Paragraphe 1', multiline: true }),
                    body2: fields.text({ label: 'Paragraphe 2', multiline: true }),
                    body3: fields.text({ label: 'Paragraphe 3', description: 'Optionnel : laisser vide pour le masquer.', multiline: true }),
                    tagline: fields.text({ label: 'Phrase orange sous les paragraphes' }),
                    cta: fields.text({ label: 'Texte du bouton' }),
                }, { label: 'Français', description: "Le bandeau en haut de la page d'accueil, version française." }),
                en: fields.object({
                    titleBase: fields.text({ label: 'Accroche en noir' }),
                    title: fields.text({ label: 'Titre en orange' }),
                    body1: fields.text({ label: 'Paragraphe 1', multiline: true }),
                    body2: fields.text({ label: 'Paragraphe 2', multiline: true }),
                    body3: fields.text({ label: 'Paragraphe 3', description: 'Optionnel : laisser vide pour le masquer.', multiline: true }),
                    tagline: fields.text({ label: 'Phrase orange sous les paragraphes' }),
                    cta: fields.text({ label: 'Texte du bouton' }),
                }, { label: 'Anglais', description: "Le bandeau en haut de la page d'accueil, version anglaise." }),
                es: fields.object({
                    titleBase: fields.text({ label: 'Accroche en noir' }),
                    title: fields.text({ label: 'Titre en orange' }),
                    body1: fields.text({ label: 'Paragraphe 1', multiline: true }),
                    body2: fields.text({ label: 'Paragraphe 2', multiline: true }),
                    body3: fields.text({ label: 'Paragraphe 3', description: 'Optionnel : laisser vide pour le masquer.', multiline: true }),
                    tagline: fields.text({ label: 'Phrase orange sous les paragraphes' }),
                    cta: fields.text({ label: 'Texte du bouton' }),
                }, { label: 'Espagnol', description: "Le bandeau en haut de la page d'accueil, version espagnole." }),
            },
        }),
    },
    collections: {
        activities: collection({
            label: 'Thématiques',
            slugField: 'title',
            path: 'src/content/activities/*',
            format: { data: 'json' },
            // La 1re colonne de la liste affiche le nom de fichier, en anglais,
            // et n'est pas configurable (son en-tete "Name" est ecrit en dur
            // dans la librairie). On ajoute donc le titre francais a cote,
            // pour retrouver une thematique sans decoder le nom de fichier.
            columns: ['title'],
            schema: {
                // Ordre d'affichage des cartes sur la homepage (croissant).
                order: fields.number({ label: "Ordre d'affichage" }),
                // Nom de la fiche : sert de nom de fichier et d'identifiant
                // dans la liste. Il n'est jamais affiche sur le site, les
                // titres affiches vivent dans les blocs de langue ci-dessous.
                title: fields.slug({
                    name: {
                        label: 'Nom de la fiche',
                        description: "Sert de nom de fichier et de reperage dans la liste. N'apparait pas sur le site.",
                    },
                }),
                fr: fields.object({
                        title: fields.text({ label: 'Titre de la carte' }),
                        subtitle: fields.text({ label: 'Sous-titre' }),
                        description: fields.text({ label: 'Description', multiline: true }),
                }, { label: 'Français', description: 'La carte de cette thématique, version française.' }),
                en: fields.object({
                        title: fields.text({ label: 'Titre de la carte' }),
                        subtitle: fields.text({ label: 'Sous-titre' }),
                        description: fields.text({ label: 'Description', multiline: true }),
                }, { label: 'Anglais', description: 'La carte de cette thématique, version anglaise.' }),
                es: fields.object({
                        title: fields.text({ label: 'Titre de la carte' }),
                        subtitle: fields.text({ label: 'Sous-titre' }),
                        description: fields.text({ label: 'Description', multiline: true }),
                }, { label: 'Espagnol', description: 'La carte de cette thématique, version espagnole.' }),
            },
        }),
    },
});
