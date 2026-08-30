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

// La convention d'ecriture, telle qu'elle est expliquee a l'editeur sous chaque
// champ. Deux phrases seulement, selon que le champ est rendu en ligne ou en
// paragraphes : c'est exactement la distinction entre RichText et RichBody.
// Elles vivent ici et nulle part ailleurs, pour qu'une reformulation ne soit
// pas a repercuter sur quatre-vingt-quinze champs.
const AIDE_LIGNE =
    'Deux asterisques mettent un passage en orange, deux tirets bas en cyan. '
    + 'Un retour a la ligne fait passer la suite sur une nouvelle ligne.';
const AIDE_PARAGRAPHES =
    'Un retour a la ligne cree un nouveau paragraphe. '
    + 'Deux asterisques mettent un passage en orange, deux tirets bas en cyan.';

/** Champ rendu en ligne. `precision` ajoute une phrase propre au champ, par
 *  exemple ou il apparait sur le site, ou sa couleur par defaut. */
const champLigne = (label: string, precision?: string, multiline = false) =>
    fields.text({
        label,
        description: precision ? precision + ' ' + AIDE_LIGNE : AIDE_LIGNE,
        multiline,
    });

/** Champ rendu en paragraphes : un retour a la ligne en ouvre un nouveau. */
const champParagraphes = (label: string, precision?: string) =>
    fields.text({
        label,
        description: precision ? precision + ' ' + AIDE_PARAGRAPHES : AIDE_PARAGRAPHES,
        multiline: true,
    });

// Le referencement est le seul texte du site qui ne s'affiche pas sur le site :
// il part dans les balises <title> et <meta description>, que Google reprend
// dans ses resultats. Les marqueurs de couleur n'y ont donc aucun sens, et la
// longueur est contrainte par Google. Keystatic refuse la saisie au-dela.
const AIDE_SEO = "Ce texte s'affiche dans les resultats de recherche Google, pas sur la page. Les marqueurs de couleur n'y fonctionnent pas.";
const champTitreSeo = (label: string, precision: string) =>
    fields.text({
        label,
        description: precision + ' ' + AIDE_SEO + ' Google coupe au-dela de 60 caracteres.',
        validation: { length: { max: 60 } },
    });
const champDescriptionSeo = (label: string, precision: string) =>
    fields.text({
        label,
        description: precision + ' ' + AIDE_SEO + ' Google coupe au-dela de 160 caracteres.',
        validation: { length: { max: 160 } },
        multiline: true,
    });

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
            'Page de contact': ['contactSection'],
            'Tout le site': ['footerSection', 'seoSection', 'helpSection'],
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
        // Une seule entree pour tout le referencement, plutot qu'un champ perdu
        // dans chaque page : ces textes se relisent ensemble, pour verifier
        // qu'ils ne se repetent pas d'une page a l'autre.
        // Page de contact. Les cinq messages d'erreur decrivent des etats
        // techniques : ils sont editables pour pouvoir en adoucir le ton, pas
        // pour changer ce qu'ils signalent.
        contactSection: singleton({
            label: '📝 Page de contact',
            path: 'src/content/ui/contact',
            format: { data: 'json' },
            schema: {
                fr: fields.object({
                        title: champLigne('Titre de la page'),
                        subtitle: champLigne("Texte d'introduction", undefined, true),
                        lastName: champLigne('Libelle du champ Nom'),
                        firstName: champLigne('Libelle du champ Prenom'),
                        organization: champLigne('Libelle du champ Organisation'),
                        role: champLigne('Libelle du champ Role'),
                        email: champLigne('Libelle du champ Email'),
                        phone: champLigne('Libelle du champ Telephone'),
                        message: champLigne('Libelle du champ Message'),
                        consent: champLigne('Case a cocher de consentement'),
                        optional: champLigne('Mention des champs facultatifs', 'Affichee entre parentheses a cote du libelle.'),
                        submit: champLigne("Texte du bouton d'envoi"),
                        successTitle: champLigne('Confirmation, titre', "Remplace le formulaire une fois le message parti."),
                        successBody: champLigne('Confirmation, texte', "Remplace le formulaire une fois le message parti.", true),
                        error: champLigne('Erreur generale', "S'affiche sous le formulaire quand l'envoi echoue."),
                        error400: champLigne('Erreur, informations invalides'),
                        error429: champLigne('Erreur, trop de tentatives'),
                        error500: champLigne('Erreur, service indisponible'),
                        errorNetwork: champLigne('Erreur, serveur injoignable'),
                }, { label: 'Français', description: 'La page de contact, version française.' }),
                en: fields.object({
                        title: champLigne('Titre de la page'),
                        subtitle: champLigne("Texte d'introduction", undefined, true),
                        lastName: champLigne('Libelle du champ Nom'),
                        firstName: champLigne('Libelle du champ Prenom'),
                        organization: champLigne('Libelle du champ Organisation'),
                        role: champLigne('Libelle du champ Role'),
                        email: champLigne('Libelle du champ Email'),
                        phone: champLigne('Libelle du champ Telephone'),
                        message: champLigne('Libelle du champ Message'),
                        consent: champLigne('Case a cocher de consentement'),
                        optional: champLigne('Mention des champs facultatifs', 'Affichee entre parentheses a cote du libelle.'),
                        submit: champLigne("Texte du bouton d'envoi"),
                        successTitle: champLigne('Confirmation, titre', "Remplace le formulaire une fois le message parti."),
                        successBody: champLigne('Confirmation, texte', "Remplace le formulaire une fois le message parti.", true),
                        error: champLigne('Erreur generale', "S'affiche sous le formulaire quand l'envoi echoue."),
                        error400: champLigne('Erreur, informations invalides'),
                        error429: champLigne('Erreur, trop de tentatives'),
                        error500: champLigne('Erreur, service indisponible'),
                        errorNetwork: champLigne('Erreur, serveur injoignable'),
                }, { label: 'Anglais', description: 'La page de contact, version anglaise.' }),
                es: fields.object({
                        title: champLigne('Titre de la page'),
                        subtitle: champLigne("Texte d'introduction", undefined, true),
                        lastName: champLigne('Libelle du champ Nom'),
                        firstName: champLigne('Libelle du champ Prenom'),
                        organization: champLigne('Libelle du champ Organisation'),
                        role: champLigne('Libelle du champ Role'),
                        email: champLigne('Libelle du champ Email'),
                        phone: champLigne('Libelle du champ Telephone'),
                        message: champLigne('Libelle du champ Message'),
                        consent: champLigne('Case a cocher de consentement'),
                        optional: champLigne('Mention des champs facultatifs', 'Affichee entre parentheses a cote du libelle.'),
                        submit: champLigne("Texte du bouton d'envoi"),
                        successTitle: champLigne('Confirmation, titre', "Remplace le formulaire une fois le message parti."),
                        successBody: champLigne('Confirmation, texte', "Remplace le formulaire une fois le message parti.", true),
                        error: champLigne('Erreur generale', "S'affiche sous le formulaire quand l'envoi echoue."),
                        error400: champLigne('Erreur, informations invalides'),
                        error429: champLigne('Erreur, trop de tentatives'),
                        error500: champLigne('Erreur, service indisponible'),
                        errorNetwork: champLigne('Erreur, serveur injoignable'),
                }, { label: 'Espagnol', description: 'La page de contact, version espagnole.' }),
            },
        }),
        seoSection: singleton({
            label: '🔎 Referencement Google',
            path: 'src/content/ui/seo',
            format: { data: 'json' },
            schema: {
                fr: fields.object({
                        homeTitle: champTitreSeo('Accueil, titre', "Pour la page d'accueil."),
                        homeDescription: champDescriptionSeo('Accueil, description', "Pour la page d'accueil."),
                        contactTitle: champTitreSeo('Contact, titre', 'Pour la page de contact.'),
                        contactDescription: champDescriptionSeo('Contact, description', 'Pour la page de contact.'),
                        siteDescription: champDescriptionSeo('Description generale du site', "Sert de repli pour une page qui n'a pas sa propre description."),
                        organization: fields.text({
                            label: "Description de l'organisation",
                            description: "Fiche d'identite envoyee aux moteurs de recherche, au format schema.org. Elle ne s'affiche nulle part et n'a pas de limite de longueur.",
                            multiline: true,
                        }),
                }, { label: 'Français', description: 'Le referencement des pages françaises.' }),
                en: fields.object({
                        homeTitle: champTitreSeo('Accueil, titre', "Pour la page d'accueil."),
                        homeDescription: champDescriptionSeo('Accueil, description', "Pour la page d'accueil."),
                        contactTitle: champTitreSeo('Contact, titre', 'Pour la page de contact.'),
                        contactDescription: champDescriptionSeo('Contact, description', 'Pour la page de contact.'),
                        siteDescription: champDescriptionSeo('Description generale du site', "Sert de repli pour une page qui n'a pas sa propre description."),
                        organization: fields.text({
                            label: "Description de l'organisation",
                            description: "Fiche d'identite envoyee aux moteurs de recherche, au format schema.org. Elle ne s'affiche nulle part et n'a pas de limite de longueur.",
                            multiline: true,
                        }),
                }, { label: 'Anglais', description: 'Le referencement des pages anglaises.' }),
                es: fields.object({
                        homeTitle: champTitreSeo('Accueil, titre', "Pour la page d'accueil."),
                        homeDescription: champDescriptionSeo('Accueil, description', "Pour la page d'accueil."),
                        contactTitle: champTitreSeo('Contact, titre', 'Pour la page de contact.'),
                        contactDescription: champDescriptionSeo('Contact, description', 'Pour la page de contact.'),
                        siteDescription: champDescriptionSeo('Description generale du site', "Sert de repli pour une page qui n'a pas sa propre description."),
                        organization: fields.text({
                            label: "Description de l'organisation",
                            description: "Fiche d'identite envoyee aux moteurs de recherche, au format schema.org. Elle ne s'affiche nulle part et n'a pas de limite de longueur.",
                            multiline: true,
                        }),
                }, { label: 'Espagnol', description: 'Le referencement des pages espagnoles.' }),
            },
        }),
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
                        heading: champLigne('Titre'),
                    badgeScience: champLigne('Pastille', 'Apparait a deux endroits : en cyan sur la bande des chiffres, en blanc au-dessus des 6 bonnes raisons.'),
                    participants: champLigne('Legende du 1er chiffre', "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici."),
                    organizations: champLigne('Legende du 2e chiffre', 'Sous le compteur +2 000.'),
                    years: champLigne('Legende du 3e chiffre', 'Sous le compteur +5.'),
                }, { label: 'Français', description: "La bande de chiffres de la page d'accueil, version française." }),
                en: fields.object({
                        heading: champLigne('Titre'),
                    badgeScience: champLigne('Pastille', 'Apparait a deux endroits : en cyan sur la bande des chiffres, en blanc au-dessus des 6 bonnes raisons.'),
                    participants: champLigne('Legende du 1er chiffre', "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici."),
                    organizations: champLigne('Legende du 2e chiffre', 'Sous le compteur +2 000.'),
                    years: champLigne('Legende du 3e chiffre', 'Sous le compteur +5.'),
                }, { label: 'Anglais', description: "La bande de chiffres de la page d'accueil, version anglaise." }),
                es: fields.object({
                        heading: champLigne('Titre'),
                    badgeScience: champLigne('Pastille', 'Apparait a deux endroits : en cyan sur la bande des chiffres, en blanc au-dessus des 6 bonnes raisons.'),
                    participants: champLigne('Legende du 1er chiffre', "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici."),
                    organizations: champLigne('Legende du 2e chiffre', 'Sous le compteur +2 000.'),
                    years: champLigne('Legende du 3e chiffre', 'Sous le compteur +5.'),
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
                        heading: champLigne('Titre'),
                        badge: champLigne('Pastille'),
                        body: champParagraphes('Texte'),
                        learnMore: champLigne('Texte du bouton des cartes'),
                }, { label: 'Français', description: "Le texte au-dessus des cartes de thematiques, version française." }),
                en: fields.object({
                        heading: champLigne('Titre'),
                        badge: champLigne('Pastille'),
                        body: champParagraphes('Texte'),
                        learnMore: champLigne('Texte du bouton des cartes'),
                }, { label: 'Anglais', description: "Le texte au-dessus des cartes de thematiques, version anglaise." }),
                es: fields.object({
                        heading: champLigne('Titre'),
                        badge: champLigne('Pastille'),
                        body: champParagraphes('Texte'),
                        learnMore: champLigne('Texte du bouton des cartes'),
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
                        heading: champLigne('Titre'),
                        ctaBody: champLigne('Phrases sous le titre', undefined, true),
                        ctaBtn: champLigne('Texte du bouton'),
                        copyright: champLigne('Mention de bas de page'),
                }, { label: 'Français', description: 'Le bloc en bas de toutes les pages, version française.' }),
                en: fields.object({
                        heading: champLigne('Titre'),
                        ctaBody: champLigne('Phrases sous le titre', undefined, true),
                        ctaBtn: champLigne('Texte du bouton'),
                        copyright: champLigne('Mention de bas de page'),
                }, { label: 'Anglais', description: 'Le bloc en bas de toutes les pages, version anglaise.' }),
                es: fields.object({
                        heading: champLigne('Titre'),
                        ctaBody: champLigne('Phrases sous le titre', undefined, true),
                        ctaBtn: champLigne('Texte du bouton'),
                        copyright: champLigne('Mention de bas de page'),
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
                        heading: champLigne('Titre', undefined, true),
                        feat1: champLigne('Indication 1 (icone horloge)'),
                        feat2: champLigne('Indication 2 (icone feuille)'),
                        feat3: champLigne('Indication 3 (icone curseur)'),
                        feat4: champLigne('Indication 4 (icone internet)'),
                        feat5: champLigne('Indication 5 (icone personne)'),
                        feat6: champLigne('Indication 6 (icone immeuble)'),
                        seeAll: champLigne('Texte du bouton'),
                }, { label: 'Français', description: 'Le bandeau bleu des ateliers, version française.' }),
                en: fields.object({
                        heading: champLigne('Titre', undefined, true),
                        feat1: champLigne('Indication 1 (icone horloge)'),
                        feat2: champLigne('Indication 2 (icone feuille)'),
                        feat3: champLigne('Indication 3 (icone curseur)'),
                        feat4: champLigne('Indication 4 (icone internet)'),
                        feat5: champLigne('Indication 5 (icone personne)'),
                        feat6: champLigne('Indication 6 (icone immeuble)'),
                        seeAll: champLigne('Texte du bouton'),
                }, { label: 'Anglais', description: 'Le bandeau bleu des ateliers, version anglaise.' }),
                es: fields.object({
                        heading: champLigne('Titre', undefined, true),
                        feat1: champLigne('Indication 1 (icone horloge)'),
                        feat2: champLigne('Indication 2 (icone feuille)'),
                        feat3: champLigne('Indication 3 (icone curseur)'),
                        feat4: champLigne('Indication 4 (icone internet)'),
                        feat5: champLigne('Indication 5 (icone personne)'),
                        feat6: champLigne('Indication 6 (icone immeuble)'),
                        seeAll: champLigne('Texte du bouton'),
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
                        heading: champLigne('Titre'),
                        body: champParagraphes('Texte'),
                }, { label: 'Français', description: "L'introduction des 6 raisons, version française." }),
                en: fields.object({
                        heading: champLigne('Titre'),
                        body: champParagraphes('Texte'),
                }, { label: 'Anglais', description: "L'introduction des 6 raisons, version anglaise." }),
                es: fields.object({
                        heading: champLigne('Titre'),
                        body: champParagraphes('Texte'),
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
                    titleBase: champLigne('Accroche au-dessus du titre', 'Par defaut en noir.'),
                    title: champLigne('Titre principal', 'Par defaut en orange.'),
                        body: champParagraphes('Texte'),
                    tagline: champLigne('Phrase sous les paragraphes', 'Par defaut en orange.'),
                    cta: champLigne('Texte du bouton'),
                }, { label: 'Français', description: "Le bandeau en haut de la page d'accueil, version française." }),
                en: fields.object({
                    titleBase: champLigne('Accroche au-dessus du titre', 'Par defaut en noir.'),
                    title: champLigne('Titre principal', 'Par defaut en orange.'),
                        body: champParagraphes('Texte'),
                    tagline: champLigne('Phrase sous les paragraphes', 'Par defaut en orange.'),
                    cta: champLigne('Texte du bouton'),
                }, { label: 'Anglais', description: "Le bandeau en haut de la page d'accueil, version anglaise." }),
                es: fields.object({
                    titleBase: champLigne('Accroche au-dessus du titre', 'Par defaut en noir.'),
                    title: champLigne('Titre principal', 'Par defaut en orange.'),
                        body: champParagraphes('Texte'),
                    tagline: champLigne('Phrase sous les paragraphes', 'Par defaut en orange.'),
                    cta: champLigne('Texte du bouton'),
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
                        title: champLigne('Titre de la carte'),
                        description: champParagraphes('Description'),
                }, { label: 'Français', description: 'La carte de cette session, version française.' }),
                en: fields.object({
                        title: champLigne('Titre de la carte'),
                        description: champParagraphes('Description'),
                }, { label: 'Anglais', description: 'La carte de cette session, version anglaise.' }),
                es: fields.object({
                        title: champLigne('Titre de la carte'),
                        description: champParagraphes('Description'),
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
                        title: champLigne('Titre de la carte'),
                        text: champParagraphes('Texte'),
                }, { label: 'Français', description: 'La carte de cette raison, version française.' }),
                en: fields.object({
                        title: champLigne('Titre de la carte'),
                        text: champParagraphes('Texte'),
                }, { label: 'Anglais', description: 'La carte de cette raison, version anglaise.' }),
                es: fields.object({
                        title: champLigne('Titre de la carte'),
                        text: champParagraphes('Texte'),
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
                        title: champLigne('Titre de la carte'),
                        subtitle: champLigne('Sous-titre'),
                        description: champParagraphes('Description'),
                }, { label: 'Français', description: 'La carte de cette thématique, version française.' }),
                en: fields.object({
                        title: champLigne('Titre de la carte'),
                        subtitle: champLigne('Sous-titre'),
                        description: champParagraphes('Description'),
                }, { label: 'Anglais', description: 'La carte de cette thématique, version anglaise.' }),
                es: fields.object({
                        title: champLigne('Titre de la carte'),
                        subtitle: champLigne('Sous-titre'),
                        description: champParagraphes('Description'),
                }, { label: 'Espagnol', description: 'La carte de cette thématique, version espagnole.' }),
            },
        }),
    },
});
