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
            "Page d'accueil": ['homepage', 'thematicsSection', 'thematics', 'sessionsSection', 'sessions', 'statsSection', 'reasonsSection', 'reasons'],
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
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                    badgeScience: fields.text({ label: 'Pastille bleue', description: "Apparait a deux endroits : sur la bande des chiffres et au-dessus des 6 bonnes raisons." }),
                    participants: fields.text({ label: 'Legende du 1er chiffre', description: "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici." }),
                    organizations: fields.text({ label: 'Legende du 2e chiffre', description: 'Sous le compteur +2 000.' }),
                    years: fields.text({ label: 'Legende du 3e chiffre', description: 'Sous le compteur +5.' }),
                }, { label: 'Français', description: "La bande de chiffres de la page d'accueil, version française." }),
                en: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                    badgeScience: fields.text({ label: 'Pastille bleue', description: "Apparait a deux endroits : sur la bande des chiffres et au-dessus des 6 bonnes raisons." }),
                    participants: fields.text({ label: 'Legende du 1er chiffre', description: "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici." }),
                    organizations: fields.text({ label: 'Legende du 2e chiffre', description: 'Sous le compteur +2 000.' }),
                    years: fields.text({ label: 'Legende du 3e chiffre', description: 'Sous le compteur +5.' }),
                }, { label: 'Anglais', description: "La bande de chiffres de la page d'accueil, version anglaise." }),
                es: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                    badgeScience: fields.text({ label: 'Pastille bleue', description: "Apparait a deux endroits : sur la bande des chiffres et au-dessus des 6 bonnes raisons." }),
                    participants: fields.text({ label: 'Legende du 1er chiffre', description: "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici." }),
                    organizations: fields.text({ label: 'Legende du 2e chiffre', description: 'Sous le compteur +2 000.' }),
                    years: fields.text({ label: 'Legende du 3e chiffre', description: 'Sous le compteur +5.' }),
                }, { label: 'Espagnol', description: "La bande de chiffres de la page d'accueil, version espagnole." }),
            },
        }),
        // Section "Nos thematiques" de l'accueil : le texte simple seulement.
        // Les deux moities du titre colore restent dans ui.ts pour l'instant.
        thematicsSection: singleton({
            label: 'Introduction des thématiques',
            path: 'src/content/ui/thematics',
            format: { data: 'json' },
            schema: {
                fr: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                        badge: fields.text({ label: 'Pastille verte' }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                        learnMore: fields.text({ label: 'Texte du bouton des cartes' }),
                }, { label: 'Français', description: "Le texte au-dessus des cartes de thematiques, version française." }),
                en: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                        badge: fields.text({ label: 'Pastille verte' }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                        learnMore: fields.text({ label: 'Texte du bouton des cartes' }),
                }, { label: 'Anglais', description: "Le texte au-dessus des cartes de thematiques, version anglaise." }),
                es: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                        badge: fields.text({ label: 'Pastille verte' }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                        learnMore: fields.text({ label: 'Texte du bouton des cartes' }),
                }, { label: 'Espagnol', description: "Le texte au-dessus des cartes de thematiques, version espagnole." }),
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
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                        ctaBody: fields.text({
                            label: 'Phrases sous le titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                            multiline: true,
                        }),
                        ctaBtn: fields.text({ label: 'Texte du bouton' }),
                        copyright: fields.text({ label: 'Mention de bas de page' }),
                }, { label: 'Français', description: 'Le bloc en bas de toutes les pages, version française.' }),
                en: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                        ctaBody: fields.text({
                            label: 'Phrases sous le titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                            multiline: true,
                        }),
                        ctaBtn: fields.text({ label: 'Texte du bouton' }),
                        copyright: fields.text({ label: 'Mention de bas de page' }),
                }, { label: 'Anglais', description: 'Le bloc en bas de toutes les pages, version anglaise.' }),
                es: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                        ctaBody: fields.text({
                            label: 'Phrases sous le titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                            multiline: true,
                        }),
                        ctaBtn: fields.text({ label: 'Texte du bouton' }),
                        copyright: fields.text({ label: 'Mention de bas de page' }),
                }, { label: 'Espagnol', description: 'Le bloc en bas de toutes les pages, version espagnole.' }),
                contactEmail: fields.text({
                    label: 'Adresse de contact',
                    description: "Affichee en bas de chaque page et sur la page A propos. Elle alimente aussi les donnees SEO du site.",
                }),
            },
        }),
        // Section qui presente les facons dont un atelier se deroule, a ne pas
        // confondre avec "Thematiques" qui en presente les sujets.
        sessionsSection: singleton({
            label: 'Introduction des ateliers',
            path: 'src/content/ui/sessions',
            format: { data: 'json' },
            schema: {
                fr: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                            multiline: true,
                        }),
                        feat1: fields.text({ label: 'Indication 1 (icone horloge)' }),
                        feat2: fields.text({ label: 'Indication 2 (icone feuille)' }),
                        feat3: fields.text({ label: 'Indication 3 (icone curseur)' }),
                        feat4: fields.text({ label: 'Indication 4 (icone internet)' }),
                        feat5: fields.text({ label: 'Indication 5 (icone personne)' }),
                        feat6: fields.text({ label: 'Indication 6 (icone immeuble)' }),
                        seeAll: fields.text({ label: 'Texte du bouton bleu' }),
                }, { label: 'Français', description: 'Le bandeau bleu des ateliers, version française.' }),
                en: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                            multiline: true,
                        }),
                        feat1: fields.text({ label: 'Indication 1 (icone horloge)' }),
                        feat2: fields.text({ label: 'Indication 2 (icone feuille)' }),
                        feat3: fields.text({ label: 'Indication 3 (icone curseur)' }),
                        feat4: fields.text({ label: 'Indication 4 (icone internet)' }),
                        feat5: fields.text({ label: 'Indication 5 (icone personne)' }),
                        feat6: fields.text({ label: 'Indication 6 (icone immeuble)' }),
                        seeAll: fields.text({ label: 'Texte du bouton bleu' }),
                }, { label: 'Anglais', description: 'Le bandeau bleu des ateliers, version anglaise.' }),
                es: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                            multiline: true,
                        }),
                        feat1: fields.text({ label: 'Indication 1 (icone horloge)' }),
                        feat2: fields.text({ label: 'Indication 2 (icone feuille)' }),
                        feat3: fields.text({ label: 'Indication 3 (icone curseur)' }),
                        feat4: fields.text({ label: 'Indication 4 (icone internet)' }),
                        feat5: fields.text({ label: 'Indication 5 (icone personne)' }),
                        feat6: fields.text({ label: 'Indication 6 (icone immeuble)' }),
                        seeAll: fields.text({ label: 'Texte du bouton bleu' }),
                }, { label: 'Espagnol', description: 'Le bandeau bleu des ateliers, version espagnole.' }),
            },
        }),
        // Section "6 bonnes raisons". Seuls les titres sont ici pour l'instant,
        // les textes des cartes vivent encore dans src/i18n/ui.ts.
        reasonsSection: singleton({
            label: 'Introduction des raisons',
            path: 'src/content/ui/reasons',
            format: { data: 'json' },
            schema: {
                fr: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                }, { label: 'Français', description: "L'introduction des 6 raisons, version française." }),
                en: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                }, { label: 'Anglais', description: "L'introduction des 6 raisons, version anglaise." }),
                es: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                }, { label: 'Espagnol', description: "L'introduction des 6 raisons, version espagnole." }),
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
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                    tagline: fields.text({ label: 'Phrase orange sous les paragraphes' }),
                    cta: fields.text({ label: 'Texte du bouton' }),
                }, { label: 'Français', description: "Le bandeau en haut de la page d'accueil, version française." }),
                en: fields.object({
                    titleBase: fields.text({ label: 'Accroche en noir' }),
                    title: fields.text({ label: 'Titre en orange' }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                    tagline: fields.text({ label: 'Phrase orange sous les paragraphes' }),
                    cta: fields.text({ label: 'Texte du bouton' }),
                }, { label: 'Anglais', description: "Le bandeau en haut de la page d'accueil, version anglaise." }),
                es: fields.object({
                    titleBase: fields.text({ label: 'Accroche en noir' }),
                    title: fields.text({ label: 'Titre en orange' }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                    tagline: fields.text({ label: 'Phrase orange sous les paragraphes' }),
                    cta: fields.text({ label: 'Texte du bouton' }),
                }, { label: 'Espagnol', description: "Le bandeau en haut de la page d'accueil, version espagnole." }),
            },
        }),
    },
    collections: {
        // Les trois facons dont un atelier se deroule. Meme forme que les
        // thematiques : rang dans le nom de fichier, photo hors CMS.
        sessions: collection({
            label: 'Ateliers et masterclasses',
            slugField: 'title',
            path: 'src/content/sessions/*',
            format: { data: 'json' },
            columns: ['title'],
            schema: {
                title: fields.slug({
                    name: {
                        label: 'Nom de la fiche',
                        description: "Sert de nom de fichier et de reperage dans la liste. N'apparait pas sur le site.",
                    },
                }),
                fr: fields.object({
                        title: fields.text({ label: 'Titre de la carte' }),
                        description: fields.text({ label: 'Description', multiline: true }),
                }, { label: 'Français', description: 'La carte de cette session, version française.' }),
                en: fields.object({
                        title: fields.text({ label: 'Titre de la carte' }),
                        description: fields.text({ label: 'Description', multiline: true }),
                }, { label: 'Anglais', description: 'La carte de cette session, version anglaise.' }),
                es: fields.object({
                        title: fields.text({ label: 'Titre de la carte' }),
                        description: fields.text({ label: 'Description', multiline: true }),
                }, { label: 'Espagnol', description: 'La carte de cette session, version espagnole.' }),
            },
        }),
        // Les 6 bonnes raisons de monter a bord. La carte affiche son rang,
        // il n'y a pas de pictogramme a choisir.
        reasons: collection({
            label: '6 bonnes raisons',
            slugField: 'title',
            path: 'src/content/reasons/*',
            format: { data: 'json' },
            columns: ['title'],
            schema: {
                title: fields.slug({
                    name: {
                        label: 'Nom de la fiche',
                        description: "Sert de nom de fichier et de reperage dans la liste. N'apparait pas sur le site.",
                    },
                }),
                fr: fields.object({
                        title: fields.text({ label: 'Titre de la carte' }),
                        text: fields.text({ label: 'Texte', description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.", multiline: true }),
                }, { label: 'Français', description: 'La carte de cette raison, version française.' }),
                en: fields.object({
                        title: fields.text({ label: 'Titre de la carte' }),
                        text: fields.text({ label: 'Texte', description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.", multiline: true }),
                }, { label: 'Anglais', description: 'La carte de cette raison, version anglaise.' }),
                es: fields.object({
                        title: fields.text({ label: 'Titre de la carte' }),
                        text: fields.text({ label: 'Texte', description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.", multiline: true }),
                }, { label: 'Espagnol', description: 'La carte de cette raison, version espagnole.' }),
            },
        }),
        thematics: collection({
            label: 'Thématiques',
            slugField: 'title',
            path: 'src/content/thematics/*',
            format: { data: 'json' },
            // Le rang est porte par le nom de fichier (thematic-01-...), donc
            // le tri par defaut de la liste, fige sur ce nom, donne l'ordre du
            // site. Il n'y a pas de champ d'ordre a maintenir a cote.
            columns: ['title'],
            schema: {
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
