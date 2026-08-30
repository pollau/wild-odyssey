import { config, fields, collection, singleton, type ComponentSchema } from '@keystatic/core';

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

/** Rend les trois blocs de langue d une meme forme de champs.
 *
 *  La forme est une fonction et non un objet : chaque langue doit recevoir
 *  ses propres instances de champs Keystatic, pas trois references vers les
 *  memes. `quoi` decrit le bloc, la phrase finale est completee ici. */
const perLang = <S extends Record<string, ComponentSchema>>(shape: () => S, quoi: string) => ({
    fr: fields.object(shape(), { label: 'Français', description: `${quoi}, version française.` }),
    en: fields.object(shape(), { label: 'Anglais', description: `${quoi}, version anglaise.` }),
    es: fields.object(shape(), { label: 'Espagnol', description: `${quoi}, version espagnole.` }),
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
            'Page université': [
                'university',
                'universityThematicsSection', 'university-thematics',
                'universitySessionsSection', 'university-sessions',
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
            label: '📝 Chiffres clés (les deux pages)',
            path: 'src/content/ui/stats',
            format: { data: 'json' },
            schema: perLang(() => ({
                heading: champLigne('Titre'),
                badgeScience: fields.text({ label: 'Pastille', description: "Apparait a deux endroits : en cyan sur la bande des chiffres, en blanc au-dessus des 6 bonnes raisons. Deux asterisques mettent un passage en orange, deux tirets bas en cyan." }),
                participants: fields.text({ label: 'Legende du 1er chiffre', description: "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici. Deux asterisques mettent un passage en orange, deux tirets bas en cyan." }),
                organizations: fields.text({ label: 'Legende du 2e chiffre', description: 'Sous le compteur +2 000. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.' }),
                years: fields.text({ label: 'Legende du 3e chiffre', description: 'Sous le compteur +5. Deux asterisques mettent un passage en orange, deux tirets bas en cyan.' }),
            }), "La bande de chiffres de la page d'accueil"),
        }),
        // Section "Nos thematiques" de l'accueil : le texte simple seulement.
        // Les deux moities du titre colore restent dans ui.ts pour l'instant.
        thematicsSection: singleton({
            label: '📝 Thématiques',
            path: 'src/content/ui/thematics',
            format: { data: 'json' },
            schema: perLang(() => ({
                heading: champLigne('Titre'),
                badge: champLigne('Pastille'),
                body: champParagraphes('Texte'),
                learnMore: champLigne('Texte du bouton des cartes'),
            }), 'Le texte au-dessus des cartes de thematiques'),
        }),
        // Bas de page, present sur toutes les pages du site. Le titre colore
        // "Et vous ?" reste dans le code : il est coupe en deux morceaux pour
        // le style, le rendre editable demanderait de revoir la mise en forme.
        footerSection: singleton({
            label: '📝 Pied de page',
            path: 'src/content/ui/footer',
            format: { data: 'json' },
            schema: {
                ...perLang(() => ({
                    heading: champLigne('Titre'),
                    ctaBody: champLigne('Phrases sous le titre', undefined, true),
                    ctaBtn: champLigne('Texte du bouton'),
                    copyright: champLigne('Mention de bas de page'),
                }), 'Le bloc en bas de toutes les pages'),
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
            schema: perLang(() => ({
                heading: champLigne('Titre', undefined, true),
                feat1: champLigne('Indication 1 (icone horloge)'),
                feat2: champLigne('Indication 2 (icone feuille)'),
                feat3: champLigne('Indication 3 (icone curseur)'),
                feat4: champLigne('Indication 4 (icone internet)'),
                feat5: champLigne('Indication 5 (icone personne)'),
                feat6: champLigne('Indication 6 (icone immeuble)'),
                seeAll: champLigne('Texte du bouton'),
            }), 'Le bandeau bleu des ateliers'),
        }),
        // Section "6 bonnes raisons". Seuls les titres sont ici pour l'instant,
        // les textes des cartes vivent encore dans src/i18n/ui.ts.
        reasonsSection: singleton({
            label: '📝 6 bonnes raisons',
            path: 'src/content/ui/reasons',
            format: { data: 'json' },
            schema: perLang(() => ({
                heading: champLigne('Titre'),
                body: champParagraphes('Texte'),
            }), "L'introduction des 6 raisons"),
        }),
        homepage: singleton({
            label: '📝 Introduction',
            path: 'src/content/homepage/index',
            format: { data: 'json' },
            // Un bloc par langue plutot qu'un bloc par texte : on redige une
            // page entiere d'une traite, comme on la lit sur le site.
            schema: perLang(() => ({
                titleBase: champLigne('Accroche au-dessus du titre', 'Par defaut en noir.'),
                title: champLigne('Titre principal', 'Par defaut en orange.'),
                body: champParagraphes('Texte'),
                tagline: champLigne('Phrase sous les paragraphes', 'Par defaut en orange.'),
                cta: champLigne('Texte du bouton'),
            }), "Le bandeau en haut de la page d'accueil"),
        }),
        university: singleton({
            label: '🎓 Introduction',
            path: 'src/content/university/index',
            format: { data: 'json' },
            schema: perLang(() => ({
                titleBase: champLigne('Accroche', 'Au-dessus du titre, en noir.'),
                title: champLigne('Titre', 'En orange.'),
                body: champParagraphes('Texte'),
                tagline: champLigne('Phrase de fin', 'En orange, sous le texte.'),
                cta: champLigne('Texte du bouton'),
            }), "Le bandeau d'introduction de la page universite"),
        }),
        universityThematicsSection: singleton({
            label: '🎓 Thématiques',
            path: 'src/content/ui/university-thematics',
            format: { data: 'json' },
            schema: perLang(() => ({
                heading: champLigne('Titre'),
                badge: champLigne('Pastille'),
                body: champParagraphes('Texte'),
                learnMore: champLigne('Texte du bouton des cartes'),
            }), 'Le texte au-dessus des cartes de thematiques de la page universite'),
        }),
        universitySessionsSection: singleton({
            label: '🎓 Ateliers et masterclasses',
            path: 'src/content/ui/university-sessions',
            format: { data: 'json' },
            schema: perLang(() => ({
                heading: champLigne('Titre'),
                feat1: champLigne('Pictogramme 1', 'Le petit texte sous la premiere icone.'),
                feat2: champLigne('Pictogramme 2'),
                feat3: champLigne('Pictogramme 3'),
                feat4: champLigne('Pictogramme 4'),
                feat5: champLigne('Pictogramme 5'),
                feat6: champLigne('Pictogramme 6'),
                seeAll: champLigne('Texte du bouton du bas'),
            }), 'Le texte de la section des sessions de la page universite'),
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
                ...perLang(() => ({
                    title: champLigne('Titre de la carte'),
                    description: champParagraphes('Description'),
                }), 'La carte de cette session'),
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
                ...perLang(() => ({
                    title: champLigne('Titre de la carte'),
                    text: champParagraphes('Texte'),
                }), 'La carte de cette raison'),
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
                ...perLang(() => ({
                    title: champLigne('Titre de la carte'),
                    subtitle: champLigne('Sous-titre'),
                    description: champParagraphes('Description'),
                }), 'La carte de cette thématique'),
            },
        }),
        'university-thematics': collection({
            label: '🎓 Cartes de thématiques',
            slugField: 'title',
            path: 'src/content/university-thematics/*',
            format: { data: 'json' },
            columns: ['title'],
            schema: {
                title: fields.slug({
                    name: {
                        label: 'Nom de la fiche',
                        description: "Sert de nom de fichier et de reperage dans la liste. N'apparait pas sur le site.",
                    },
                }),
                ...perLang(() => ({
                    title: champLigne('Titre de la carte'),
                    subtitle: champLigne('Sous-titre'),
                    description: champParagraphes('Description'),
                }), 'La carte de cette thematique, page universite'),
            },
        }),
        'university-sessions': collection({
            label: '🎓 Cartes de sessions',
            slugField: 'title',
            path: 'src/content/university-sessions/*',
            format: { data: 'json' },
            columns: ['title'],
            schema: {
                title: fields.slug({
                    name: {
                        label: 'Nom de la fiche',
                        description: "Sert de nom de fichier et de reperage dans la liste. N'apparait pas sur le site.",
                    },
                }),
                ...perLang(() => ({
                    title: champLigne('Titre de la carte'),
                    description: champParagraphes('Description'),
                }), 'La carte de cette session, page universite'),
            },
        }),
    },
});
