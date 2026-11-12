import { config, fields, collection, singleton } from '@keystatic/core';
import {
    ENTREE_LIGNE, ENTREE_PARAGRAPHE, bandeauAide, bandeauSeo,
    aideCouleur, aideLigne, aideLangues, aidePhotos,
} from './src/keystatic/aide';

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

// TOUT texte affiche sur le site se declare avec l'une des trois fabriques
// ci-dessous, et s'affiche avec RichText (champLigne, champMultiligne) ou
// RichBody (champParagraphes). C'est ce qui garantit que chaque champ, ancien
// ou nouveau, suit la meme convention d'ecriture (src/i18n/richText.ts) :
// la couleur ne vient que des marqueurs, aucun champ n'en a par defaut.
//
// La convention elle-meme n'est expliquee qu'a un seul endroit, la page
// "Comment ecrire les textes" (helpSection, src/keystatic/aide.ts). Chaque
// section y renvoie une fois, par le bandeau que pose parLangue. Sous un
// champ, on ne dit que ce qui lui est propre : ou il apparait, et ce que
// fait la touche Entree quand elle fait quelque chose.

/** Phrase propre au champ suivie, s'il y a lieu, du comportement d'Entree. */
const decrire = (precision?: string, entree?: string) =>
    [precision, entree].filter(Boolean).join(' ') || undefined;

/** Texte d'une seule ligne, rendu par RichText. Entree n'y fait rien. */
const champLigne = (label: string, precision?: string) =>
    fields.text({ label, description: decrire(precision) });

/** Texte rendu par RichText ou Entree fait passer a la ligne (<br>). */
const champMultiligne = (label: string, precision?: string) =>
    fields.text({ label, description: decrire(precision, ENTREE_LIGNE), multiline: true });

/** Texte rendu par RichBody : chaque Entree ouvre un nouveau paragraphe. */
const champParagraphes = (label: string, precision?: string) =>
    fields.text({ label, description: decrire(precision, ENTREE_PARAGRAPHE), multiline: true });

// Le referencement est le seul texte du site qui ne s'affiche pas sur le site :
// il part dans les balises <title> et <meta description>, que Google reprend
// dans ses resultats. Les marqueurs n'y ont donc aucun sens (bandeauSeo le dit
// en haut de la section), et la longueur est contrainte par Google. Keystatic
// refuse la saisie au-dela.
const champTitreSeo = (label: string, precision: string) =>
    fields.text({
        label,
        description: precision + ' Google coupe au-delà de 60 caractères.',
        validation: { length: { max: 60 } },
    });
const champDescriptionSeo = (label: string, precision: string) =>
    fields.text({
        label,
        description: precision + ' Google coupe au-delà de 160 caractères.',
        validation: { length: { max: 160 } },
        multiline: true,
    });

/** Les trois blocs de langue d'une entree, precedes du bandeau d'aide. Les
 *  champs ne sont ecrits qu'une fois : la fabrique les instancie pour chaque
 *  langue et decline la meme phrase de presentation. Sans elle, chaque champ
 *  etait recopie trois fois, et une correction devait etre repercutee sur les
 *  trois copies. Le bandeau n'ecrit rien dans le JSON. */
const parLangue = <T extends Parameters<typeof fields.object>[0]>(
    sujet: string,
    champs: () => T,
    bandeau = bandeauAide,
) => ({
    aide: bandeau(),
    fr: fields.object(champs(), { label: 'Français', description: sujet + ', version française.' }),
    en: fields.object(champs(), { label: 'Anglais', description: sujet + ', version anglaise.' }),
    es: fields.object(champs(), { label: 'Espagnol', description: sujet + ', version espagnole.' }),
});

/** Les pages Ecoles (/ecoles) et Enseignement superieur (/universites) ont la
 *  meme forme et chacune ses propres textes. Une seule fabrique les decrit,
 *  pour qu'un champ ajoute a l'une le soit aussi a l'autre. La cle est le nom
 *  technique de la page, celui des dossiers de src/content. Les cartes ont
 *  leurs propres collections, distinctes de celles de l'accueil : le menu se
 *  construit a partir de navigation, et une collection ne figure que dans un
 *  seul groupe. */
const pageEducation = (cle: 'schools' | 'university', page: string) => ({
    singletons: {
        [cle]: singleton({
            label: '📝 Introduction',
            path: `src/content/${cle}/index`,
            format: { data: 'json' },
            schema: {
                ...parLangue(`Le bandeau en haut de la ${page}`, () => ({
                    titleBase: champLigne('Accroche au-dessus du titre'),
                    title: champLigne('Titre principal'),
                    body: champParagraphes('Texte'),
                    tagline: champLigne('Phrase sous les paragraphes'),
                    cta: champLigne('Texte du bouton'),
                })),
            },
        }),
        [`${cle}ThematicsSection`]: singleton({
            label: '📝 Thématiques',
            path: `src/content/ui/${cle}-thematics`,
            format: { data: 'json' },
            schema: {
                ...parLangue(`Le texte au-dessus des cartes de thematiques de la ${page}`, () => ({
                    heading: champLigne('Titre'),
                    badge: champLigne('Pastille'),
                    body: champParagraphes('Texte'),
                    learnMore: champLigne('Texte du bouton des cartes'),
                })),
            },
        }),
        [`${cle}ReasonsSection`]: singleton({
            label: '📝 Team building',
            path: `src/content/ui/${cle}-reasons`,
            format: { data: 'json' },
            schema: {
                ...parLangue(`L'introduction de la section team building de la ${page}`, () => ({
                    heading: champLigne('Titre'),
                    body: champParagraphes('Texte'),
                })),
            },
        }),
        [`${cle}SessionsSection`]: singleton({
            label: '📝 Ateliers et masterclasses',
            path: `src/content/ui/${cle}-sessions`,
            format: { data: 'json' },
            schema: {
                ...parLangue(`Le texte de la section des ateliers de la ${page}`, () => ({
                    heading: champMultiligne('Titre'),
                    feat1: champLigne('Indication 1 (icone horloge)'),
                    feat2: champLigne('Indication 2 (icone feuille)'),
                    feat3: champLigne('Indication 3 (icone curseur)'),
                    feat4: champLigne('Indication 4 (icone ecran)'),
                    feat5: champLigne('Indication 5 (icone personne)'),
                    feat6: champLigne('Indication 6 (icone organisation)'),
                    seeAll: champLigne('Texte du bouton sous les cartes'),
                })),
            },
        }),
    },
    collections: {
        [`${cle}-thematics`]: collection({
            label: '🗂️ Les thématiques',
            slugField: 'title',
            path: `src/content/${cle}-thematics/*`,
            format: { data: 'json' },
            columns: ['title'],
            schema: {
                title: fields.slug({
                    name: {
                        label: 'Nom de la fiche',
                        description: "Sert de nom de fichier et de reperage dans la liste. N'apparait pas sur le site. Commencez par thematic-07- : le numero fixe l'ordre d'affichage et la suite du nom choisit la photo. Passez par Paul pour ajouter une photo.",
                    },
                }),
                ...parLangue(`La carte de cette thématique, ${page}`, () => ({
                    title: champLigne('Titre de la carte'),
                    subtitle: champLigne('Sous-titre'),
                    description: champParagraphes('Description'),
                })),
            },
        }),
        [`${cle}-sessions`]: collection({
            label: '🗂️ Les ateliers',
            slugField: 'title',
            path: `src/content/${cle}-sessions/*`,
            format: { data: 'json' },
            columns: ['title'],
            schema: {
                title: fields.slug({
                    name: {
                        label: 'Nom de la fiche',
                        description: "Sert de nom de fichier et de reperage dans la liste. N'apparait pas sur le site. Commencez par session-04- : le numero fixe l'ordre d'affichage et la suite du nom choisit la photo. Passez par Paul pour ajouter une photo.",
                    },
                }),
                ...parLangue(`La carte de cet atelier, ${page}`, () => ({
                    title: champLigne('Titre de la carte'),
                    description: champParagraphes('Description'),
                })),
            },
        }),
        [`${cle}-reasons`]: collection({
            label: '🗂️ Les 6 raisons',
            slugField: 'title',
            path: `src/content/${cle}-reasons/*`,
            format: { data: 'json' },
            columns: ['title'],
            schema: {
                title: fields.slug({
                    name: {
                        label: 'Nom de la fiche',
                        description: "Sert de nom de fichier et de reperage dans la liste. N'apparait pas sur le site.",
                    },
                }),
                ...parLangue(`La carte de cette raison, ${page}`, () => ({
                    title: champLigne('Titre de la carte'),
                    text: champParagraphes('Texte'),
                })),
            },
        }),
    },
});
const ecoles = pageEducation('schools', 'page écoles');
const enseignementSuperieur = pageEducation('university', 'page enseignement supérieur');

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
                'reasonsSection', 'reasons',
            ],
            'Écoles': [
                'schools',
                'schoolsThematicsSection', 'schools-thematics',
                'schoolsSessionsSection', 'schools-sessions',
                'schoolsReasonsSection', 'schools-reasons',
            ],
            'Enseignement supérieur': [
                'university',
                'universityThematicsSection', 'university-thematics',
                'universitySessionsSection', 'university-sessions',
                'universityReasonsSection', 'university-reasons',
            ],
            // La bande de chiffres est le seul texte que les trois pages se
            // partagent vraiment : la ranger sous l'une d'elles laissait
            // croire qu'on n'y touchait que celle-la.
            'Les trois pages': ['statsSection'],
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
        // Page de contact. Les cinq messages d'erreur decrivent des etats
        // techniques : ils sont editables pour pouvoir en adoucir le ton, pas
        // pour changer ce qu'ils signalent.
        contactSection: singleton({
            label: '📝 Page de contact',
            path: 'src/content/ui/contact',
            format: { data: 'json' },
            schema: {
                ...parLangue('La page de contact', () => ({
                    title: champLigne('Titre de la page'),
                    subtitle: champMultiligne("Texte d'introduction"),
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
                    successBody: champMultiligne('Confirmation, texte', "Remplace le formulaire une fois le message parti."),
                    error: champLigne('Erreur generale', "S'affiche sous le formulaire quand l'envoi echoue."),
                    error400: champLigne('Erreur, informations invalides'),
                    error429: champLigne('Erreur, trop de tentatives'),
                    error500: champLigne('Erreur, service indisponible'),
                    errorNetwork: champLigne('Erreur, serveur injoignable'),
                })),
            },
        }),
        // Une seule entree pour tout le referencement, plutot qu'un champ perdu
        // dans chaque page : ces textes se relisent ensemble, pour verifier
        // qu'ils ne se repetent pas d'une page a l'autre.
        seoSection: singleton({
            label: '🔎 Referencement Google',
            path: 'src/content/ui/seo',
            format: { data: 'json' },
            schema: {
                ...parLangue('Le referencement des pages', () => ({
                    homeTitle: champTitreSeo('Accueil, titre', "Pour la page d'accueil."),
                    homeDescription: champDescriptionSeo('Accueil, description', "Pour la page d'accueil."),
                    contactTitle: champTitreSeo('Contact, titre', 'Pour la page de contact.'),
                    contactDescription: champDescriptionSeo('Contact, description', 'Pour la page de contact.'),
                    universityTitle: champTitreSeo('Enseignement supérieur, titre', 'Pour la page enseignement supérieur.'),
                    universityDescription: champDescriptionSeo('Enseignement supérieur, description', 'Pour la page enseignement supérieur.'),
                    schoolsTitle: champTitreSeo('Écoles, titre', 'Pour la page écoles.'),
                    schoolsDescription: champDescriptionSeo('Écoles, description', 'Pour la page écoles.'),
                    siteDescription: champDescriptionSeo('Description generale du site', "Sert de repli pour une page qui n'a pas sa propre description."),
                    organization: fields.text({
                    label: "Description de l'organisation",
                    description: "Fiche d'identite envoyee aux moteurs de recherche, au format schema.org. Elle ne s'affiche nulle part et n'a pas de limite de longueur.",
                    multiline: true,
                    }),
                }), bandeauSeo),
            },
        }),
        // Page d'aide, affichee uniquement dans le CMS : la SEULE explication
        // de la convention d'ecriture, a laquelle renvoie le bandeau de chaque
        // section. Ses blocs sont des champs d'affichage (src/keystatic/aide.ts)
        // qui n'ecrivent rien : help.json reste vide.
        helpSection: singleton({
            label: '❓ Comment écrire les textes',
            path: 'src/content/ui/help',
            format: { data: 'json' },
            schema: {
                couleur: aideCouleur(),
                ligne: aideLigne(),
                langues: aideLangues(),
                photos: aidePhotos(),
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
                ...parLangue("La bande de chiffres, identique sur l'accueil, la page écoles et la page enseignement supérieur", () => ({
                    heading: champLigne('Titre'),
                    badgeScience: champLigne('Pastille', 'Apparait a deux endroits : sur la bande des chiffres et au-dessus des 6 bonnes raisons.'),
                    participants: champLigne('Legende du 1er chiffre', "Sous le compteur +600 000. Le nombre lui-meme est anime, il n'est pas modifiable ici."),
                    organizations: champLigne('Legende du 2e chiffre', 'Sous le compteur +2 000.'),
                    years: champLigne('Legende du 3e chiffre', 'Sous le compteur +5.'),
                })),
            },
        }),
        // Section "Nos thematiques" de l'accueil : le texte au-dessus des
        // cartes. Les cartes elles-memes sont la collection thematics.
        thematicsSection: singleton({
            label: '📝 Thématiques',
            path: 'src/content/ui/thematics',
            format: { data: 'json' },
            schema: {
                ...parLangue("Le texte au-dessus des cartes de thematiques", () => ({
                    heading: champLigne('Titre'),
                    badge: champLigne('Pastille'),
                    body: champParagraphes('Texte'),
                    learnMore: champLigne('Texte du bouton des cartes'),
                })),
            },
        }),
        // Haut et bas de page, presents sur toutes les pages du site.
        footerSection: singleton({
            label: '📝 Header and footer',
            path: 'src/content/ui/footer',
            format: { data: 'json' },
            schema: {
                ...parLangue('Les deux bouts de page, communs a tout le site', () => ({
                    headerCta: champLigne('Bouton du bandeau du haut', "Le bouton orange en haut a droite, sur toutes les pages."),
                    headerHome: champLigne("Lien vers la page d'accueil", "Le premier lien à droite du logo, sur toutes les pages. Il mène à l'accueil, la page destinée aux entreprises."),
                    headerEducation: champLigne('Onglet Éducation', "Le second onglet à droite du logo, sur toutes les pages. Il ouvre un menu vers les pages écoles et enseignement supérieur."),
                    headerSchools: champLigne('Lien vers la page écoles', "Premier lien du menu Éducation. Il mène à /ecoles."),
                    headerHigherEd: champLigne('Lien vers la page enseignement supérieur', "Second lien du menu Éducation. Il mène à /universites."),
                    heading: champLigne('Titre'),
                    ctaBody: champMultiligne('Phrases sous le titre'),
                    ctaBtn: champLigne('Texte du bouton'),
                    copyright: champLigne('Mention de bas de page'),
                })),
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
                ...parLangue('Le bandeau bleu des ateliers', () => ({
                    heading: champMultiligne('Titre'),
                    feat1: champLigne('Indication 1 (icone horloge)'),
                    feat2: champLigne('Indication 2 (icone feuille)'),
                    feat3: champLigne('Indication 3 (icone curseur)'),
                    feat4: champLigne('Indication 4 (icone internet)'),
                    feat5: champLigne('Indication 5 (icone personne)'),
                    feat6: champLigne('Indication 6 (icone immeuble)'),
                    seeAll: champLigne('Texte du bouton'),
                })),
            },
        }),
        // Section "6 bonnes raisons" : l'introduction. Les cartes elles-memes
        // sont la collection reasons.
        reasonsSection: singleton({
            label: '📝 Team building',
            path: 'src/content/ui/reasons',
            format: { data: 'json' },
            schema: {
                ...parLangue("L'introduction de la section team building", () => ({
                    heading: champLigne('Titre'),
                    body: champParagraphes('Texte'),
                })),
            },
        }),
        homepage: singleton({
            label: '📝 Introduction',
            path: 'src/content/homepage/index',
            format: { data: 'json' },
            // Un bloc par langue plutot qu'un bloc par texte : on redige une
            // page entiere d'une traite, comme on la lit sur le site.
            schema: {
                ...parLangue("Le bandeau en haut de la page d'accueil", () => ({
                    titleBase: champLigne('Accroche au-dessus du titre'),
                    title: champLigne('Titre principal'),
                    body: champParagraphes('Texte'),
                    tagline: champLigne('Phrase sous les paragraphes'),
                    cta: champLigne('Texte du bouton'),
                })),
            },
        }),
        ...ecoles.singletons,
        ...enseignementSuperieur.singletons,
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
                ...parLangue('La carte de cette session', () => ({
                    title: champLigne('Titre de la carte'),
                    description: champParagraphes('Description'),
                })),
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
                ...parLangue('La carte de cette raison', () => ({
                    title: champLigne('Titre de la carte'),
                    text: champParagraphes('Texte'),
                })),
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
                ...parLangue('La carte de cette thématique', () => ({
                    title: champLigne('Titre de la carte'),
                    subtitle: champLigne('Sous-titre'),
                    description: champParagraphes('Description'),
                })),
            },
        }),
        ...ecoles.collections,
        ...enseignementSuperieur.collections,
    },
});
