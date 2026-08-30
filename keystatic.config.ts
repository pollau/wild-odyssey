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
            "Page d'accueil": [
                'homepage',
                'thematicsSection', 'thematics',
                'sessionsSection', 'sessions',
                'statsSection',
                'reasonsSection', 'reasons',
            ],
            'Événements': ['events'],
            'Tout le site': ['footerSection', 'helpSection'],
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
        // Page d'aide, affichee uniquement dans le CMS. Les blocs objet sans
        // champ ne servent qu'a porter un titre et un texte : ils n'affichent
        // aucune saisie. Ils ecrivent une cle vide dans help.json, d'ou le
        // fichier dedie plutot qu'une note dans chaque entree.
        helpSection: singleton({
            label: '❓ Comment ecrire les textes',
            path: 'src/content/ui/help',
            format: { data: 'json' },
            schema: {
                couleur: fields.object({}, {
                    label: 'Mettre un passage en couleur',
                    description:
                        "Entourez le passage de deux asterisques pour l'orange, de deux tirets bas pour le cyan. "
                        + "Exemple : Une methodologie commune, **des thematiques au choix.** "
                        + "La couleur annoncee sous un champ est celle par defaut : les marqueurs la remplacent, "
                        + "mais seulement pour le passage encadre.",
                }),
                ligne: fields.object({}, {
                    label: 'Aller a la ligne',
                    description:
                        "Dans un texte, un retour a la ligne cree un nouveau paragraphe, avec l'espace qui va avec. "
                        + "Dans un titre, il fait simplement passer la suite sur une nouvelle ligne.",
                }),
                langues: fields.object({}, {
                    label: 'Les trois langues',
                    description:
                        "Chaque page contient un bloc Francais, un Anglais et un Espagnol. "
                        + "Un champ laisse vide n'affiche rien dans cette langue : le site ne va jamais "
                        + "chercher la version d'une autre langue a la place.",
                }),
                photos: fields.object({}, {
                    label: 'Les photos',
                    description:
                        "Les photos ne se changent pas depuis le CMS, elles font partie de la maquette. "
                        + "Passez par Paul pour en remplacer une.",
                }),
            },
        }),
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
            label: '📝 Chiffres clés',
            path: 'src/content/ui/stats',
            format: { data: 'json' },
            schema: {
                fr: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                    badgeScience: fields.text({ label: 'Pastille', description: "Apparait a deux endroits : en cyan sur la bande des chiffres, en blanc au-dessus des 6 bonnes raisons. Deux asterisques mettent un passage en orange, deux tirets bas en cyan." }),
                    participants: fields.text({ label: 'Legende du 1er chiffre', description: "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici. Deux asterisques mettent un passage en orange, deux tirets bas en cyan." }),
                    organizations: fields.text({ label: 'Legende du 2e chiffre', description: 'Sous le compteur +2 000. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.' }),
                    years: fields.text({ label: 'Legende du 3e chiffre', description: 'Sous le compteur +5. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.' }),
                }, { label: 'Français', description: "La bande de chiffres de la page d'accueil, version française." }),
                en: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                    badgeScience: fields.text({ label: 'Pastille', description: "Apparait a deux endroits : en cyan sur la bande des chiffres, en blanc au-dessus des 6 bonnes raisons. Deux asterisques mettent un passage en orange, deux tirets bas en cyan." }),
                    participants: fields.text({ label: 'Legende du 1er chiffre', description: "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici. Deux asterisques mettent un passage en orange, deux tirets bas en cyan." }),
                    organizations: fields.text({ label: 'Legende du 2e chiffre', description: 'Sous le compteur +2 000. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.' }),
                    years: fields.text({ label: 'Legende du 3e chiffre', description: 'Sous le compteur +5. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.' }),
                }, { label: 'Anglais', description: "La bande de chiffres de la page d'accueil, version anglaise." }),
                es: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                    badgeScience: fields.text({ label: 'Pastille', description: "Apparait a deux endroits : en cyan sur la bande des chiffres, en blanc au-dessus des 6 bonnes raisons. Deux asterisques mettent un passage en orange, deux tirets bas en cyan." }),
                    participants: fields.text({ label: 'Legende du 1er chiffre', description: "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici. Deux asterisques mettent un passage en orange, deux tirets bas en cyan." }),
                    organizations: fields.text({ label: 'Legende du 2e chiffre', description: 'Sous le compteur +2 000. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.' }),
                    years: fields.text({ label: 'Legende du 3e chiffre', description: 'Sous le compteur +5. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.' }),
                }, { label: 'Espagnol', description: "La bande de chiffres de la page d'accueil, version espagnole." }),
            },
        }),
        // Section "Nos thematiques" de l'accueil : le texte simple seulement.
        // Les deux moities du titre colore restent dans ui.ts pour l'instant.
        thematicsSection: singleton({
            label: '📝 Thématiques',
            path: 'src/content/ui/thematics',
            format: { data: 'json' },
            schema: {
                fr: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                        badge: fields.text({ label: 'Pastille', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                        learnMore: fields.text({ label: 'Texte du bouton des cartes', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                }, { label: 'Français', description: "Le texte au-dessus des cartes de thematiques, version française." }),
                en: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                        badge: fields.text({ label: 'Pastille', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                        learnMore: fields.text({ label: 'Texte du bouton des cartes', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                }, { label: 'Anglais', description: "Le texte au-dessus des cartes de thematiques, version anglaise." }),
                es: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                        }),
                        badge: fields.text({ label: 'Pastille', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                        learnMore: fields.text({ label: 'Texte du bouton des cartes', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                }, { label: 'Espagnol', description: "Le texte au-dessus des cartes de thematiques, version espagnole." }),
            },
        }),
        // Bas de page, present sur toutes les pages du site. Le titre colore
        // "Et vous ?" reste dans le code : il est coupe en deux morceaux pour
        // le style, le rendre editable demanderait de revoir la mise en forme.
        footerSection: singleton({
            label: '📝 Pied de page',
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
                        ctaBtn: fields.text({ label: 'Texte du bouton', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        copyright: fields.text({ label: 'Mention de bas de page', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
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
                        ctaBtn: fields.text({ label: 'Texte du bouton', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        copyright: fields.text({ label: 'Mention de bas de page', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
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
                        ctaBtn: fields.text({ label: 'Texte du bouton', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        copyright: fields.text({ label: 'Mention de bas de page', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
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
            label: '📝 Ateliers et masterclasses',
            path: 'src/content/ui/sessions',
            format: { data: 'json' },
            schema: {
                fr: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                            multiline: true,
                        }),
                        feat1: fields.text({ label: 'Indication 1 (icone horloge)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat2: fields.text({ label: 'Indication 2 (icone feuille)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat3: fields.text({ label: 'Indication 3 (icone curseur)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat4: fields.text({ label: 'Indication 4 (icone internet)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat5: fields.text({ label: 'Indication 5 (icone personne)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat6: fields.text({ label: 'Indication 6 (icone immeuble)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        seeAll: fields.text({ label: 'Texte du bouton', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                }, { label: 'Français', description: 'Le bandeau bleu des ateliers, version française.' }),
                en: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                            multiline: true,
                        }),
                        feat1: fields.text({ label: 'Indication 1 (icone horloge)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat2: fields.text({ label: 'Indication 2 (icone feuille)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat3: fields.text({ label: 'Indication 3 (icone curseur)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat4: fields.text({ label: 'Indication 4 (icone internet)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat5: fields.text({ label: 'Indication 5 (icone personne)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat6: fields.text({ label: 'Indication 6 (icone immeuble)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        seeAll: fields.text({ label: 'Texte du bouton', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                }, { label: 'Anglais', description: 'Le bandeau bleu des ateliers, version anglaise.' }),
                es: fields.object({
                        heading: fields.text({
                            label: 'Titre',
                            description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                            multiline: true,
                        }),
                        feat1: fields.text({ label: 'Indication 1 (icone horloge)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat2: fields.text({ label: 'Indication 2 (icone feuille)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat3: fields.text({ label: 'Indication 3 (icone curseur)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat4: fields.text({ label: 'Indication 4 (icone internet)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat5: fields.text({ label: 'Indication 5 (icone personne)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        feat6: fields.text({ label: 'Indication 6 (icone immeuble)', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        seeAll: fields.text({ label: 'Texte du bouton', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                }, { label: 'Espagnol', description: 'Le bandeau bleu des ateliers, version espagnole.' }),
            },
        }),
        // Section "6 bonnes raisons". Seuls les titres sont ici pour l'instant,
        // les textes des cartes vivent encore dans src/i18n/ui.ts.
        reasonsSection: singleton({
            label: '📝 6 bonnes raisons',
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
            label: '📝 Introduction',
            path: 'src/content/homepage/index',
            format: { data: 'json' },
            // Un bloc par langue plutot qu'un bloc par texte : on redige une
            // page entiere d'une traite, comme on la lit sur le site.
            schema: {
                fr: fields.object({
                    titleBase: fields.text({
                        label: 'Accroche au-dessus du titre',
                        description: "Par defaut en noir. Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                    }),
                    title: fields.text({
                        label: 'Titre principal',
                        description: "Par defaut en orange. Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                    }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                    tagline: fields.text({
                        label: 'Phrase sous les paragraphes',
                        description: "Par defaut en orange. Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                    }),
                    cta: fields.text({ label: 'Texte du bouton', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                }, { label: 'Français', description: "Le bandeau en haut de la page d'accueil, version française." }),
                en: fields.object({
                    titleBase: fields.text({
                        label: 'Accroche au-dessus du titre',
                        description: "Par defaut en noir. Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                    }),
                    title: fields.text({
                        label: 'Titre principal',
                        description: "Par defaut en orange. Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                    }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                    tagline: fields.text({
                        label: 'Phrase sous les paragraphes',
                        description: "Par defaut en orange. Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                    }),
                    cta: fields.text({ label: 'Texte du bouton', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                }, { label: 'Anglais', description: "Le bandeau en haut de la page d'accueil, version anglaise." }),
                es: fields.object({
                    titleBase: fields.text({
                        label: 'Accroche au-dessus du titre',
                        description: "Par defaut en noir. Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                    }),
                    title: fields.text({
                        label: 'Titre principal',
                        description: "Par defaut en orange. Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                    }),
                        body: fields.text({
                            label: 'Texte',
                            description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.",
                            multiline: true,
                        }),
                    tagline: fields.text({
                        label: 'Phrase sous les paragraphes',
                        description: "Par defaut en orange. Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne.",
                    }),
                    cta: fields.text({ label: 'Texte du bouton', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                }, { label: 'Espagnol', description: "Le bandeau en haut de la page d'accueil, version espagnole." }),
            },
        }),
    },
    collections: {
        // Les trois facons dont un atelier se deroule. Meme forme que les
        // thematiques : rang dans le nom de fichier, photo hors CMS.
        sessions: collection({
            label: '🗂️ Les 3 ateliers',
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
                        title: fields.text({ label: 'Titre de la carte', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        description: fields.text({ label: 'Description', description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.", multiline: true }),
                }, { label: 'Français', description: 'La carte de cette session, version française.' }),
                en: fields.object({
                        title: fields.text({ label: 'Titre de la carte', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        description: fields.text({ label: 'Description', description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.", multiline: true }),
                }, { label: 'Anglais', description: 'La carte de cette session, version anglaise.' }),
                es: fields.object({
                        title: fields.text({ label: 'Titre de la carte', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        description: fields.text({ label: 'Description', description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.", multiline: true }),
                }, { label: 'Espagnol', description: 'La carte de cette session, version espagnole.' }),
            },
        }),
        // Les 6 bonnes raisons de monter a bord. La carte affiche son rang,
        // il n'y a pas de pictogramme a choisir.
        reasons: collection({
            label: '🗂️ Les 6 raisons',
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
                        title: fields.text({ label: 'Titre de la carte', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        text: fields.text({ label: 'Texte', description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.", multiline: true }),
                }, { label: 'Français', description: 'La carte de cette raison, version française.' }),
                en: fields.object({
                        title: fields.text({ label: 'Titre de la carte', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        text: fields.text({ label: 'Texte', description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.", multiline: true }),
                }, { label: 'Anglais', description: 'La carte de cette raison, version anglaise.' }),
                es: fields.object({
                        title: fields.text({ label: 'Titre de la carte', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        text: fields.text({ label: 'Texte', description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.", multiline: true }),
                }, { label: 'Espagnol', description: 'La carte de cette raison, version espagnole.' }),
            },
        }),
        thematics: collection({
            label: '🗂️ Les 6 thématiques',
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
                        title: fields.text({ label: 'Titre de la carte', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        subtitle: fields.text({ label: 'Sous-titre', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        description: fields.text({ label: 'Description', description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.", multiline: true }),
                }, { label: 'Français', description: 'La carte de cette thématique, version française.' }),
                en: fields.object({
                        title: fields.text({ label: 'Titre de la carte', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        subtitle: fields.text({ label: 'Sous-titre', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        description: fields.text({ label: 'Description', description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.", multiline: true }),
                }, { label: 'Anglais', description: 'La carte de cette thématique, version anglaise.' }),
                es: fields.object({
                        title: fields.text({ label: 'Titre de la carte', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        subtitle: fields.text({ label: 'Sous-titre', description: "Deux asterisques mettent un passage en orange, deux tirets bas en cyan. Un retour a la ligne fait passer la suite sur une nouvelle ligne." }),
                        description: fields.text({ label: 'Description', description: "Un retour a la ligne cree un nouveau paragraphe. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.", multiline: true }),
                }, { label: 'Espagnol', description: 'La carte de cette thématique, version espagnole.' }),
            },
        }),
    },
});
