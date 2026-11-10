import { defineCollection, z } from 'astro:content';

// Une thematique : le nom de la fiche est technique (nom de fichier), les
// textes affiches vivent dans un bloc par langue.
const cardBlock = z
    .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
    })
    .optional();

const reasonBlock = z
    .object({
        title: z.string().optional(),
        text: z.string().optional(),
    })
    .optional();

const thematics = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        fr: cardBlock,
        en: cardBlock,
        es: cardBlock,
    }),
});

// Bandeau d'introduction de l'accueil : un bloc par langue, pilote par
// Keystatic. Tout est optionnel, car Keystatic omet les champs vides du JSON.
const introBlock = z
    .object({
        titleBase: z.string().optional(),
        title: z.string().optional(),
        body: z.string().optional(),
        tagline: z.string().optional(),
        cta: z.string().optional(),
    })
    .optional();

const homepage = defineCollection({
    type: 'data',
    schema: z.object({
        fr: introBlock,
        en: introBlock,
        es: introBlock,
    }),
});

// Pages par public de l'onglet Education : enseignement superieur
// (/universites) et ecoles (/ecoles). Chacune a son hero et ses propres
// cartes, sous la meme forme que la home. Les definitions sont des fabriques
// instanciees une fois par page, plutot que recopiees.
const audienceIntro = () => defineCollection({
    type: 'data',
    schema: z.object({
        fr: introBlock,
        en: introBlock,
        es: introBlock,
    }),
});

// Collections distinctes de celles de la home et entre pages : le menu du CMS
// se construit a partir de ui.navigation, et une collection ne peut figurer
// que dans un seul groupe.
const audienceThematics = () => defineCollection({
    type: 'data',
    schema: z.object({ title: z.string(), fr: cardBlock, en: cardBlock, es: cardBlock }),
});

const audienceSessions = () => defineCollection({
    type: 'data',
    schema: z.object({ title: z.string(), fr: cardBlock, en: cardBlock, es: cardBlock }),
});

const audienceReasons = () => defineCollection({
    type: 'data',
    schema: z.object({ title: z.string(), fr: reasonBlock, en: reasonBlock, es: reasonBlock }),
});

// Les trois facons dont un atelier se deroule : atelier collaboratif,
// masterclass, marche oceane. Meme forme que les thematiques.
const sessions = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        fr: cardBlock,
        en: cardBlock,
        es: cardBlock,
    }),
});

// Les 6 bonnes raisons de monter a bord. L'icone n'existe pas : la carte
// affiche son rang, pas de pictogramme.
const reasons = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        fr: reasonBlock,
        en: reasonBlock,
        es: reasonBlock,
    }),
});

export const collections = {
    thematics,
    sessions,
    reasons,
    homepage,
    university: audienceIntro(),
    'university-thematics': audienceThematics(),
    'university-sessions': audienceSessions(),
    'university-reasons': audienceReasons(),
    schools: audienceIntro(),
    'schools-thematics': audienceThematics(),
    'schools-sessions': audienceSessions(),
    'schools-reasons': audienceReasons(),
};
