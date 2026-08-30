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
        body1: z.string().optional(),
        body2: z.string().optional(),
        body3: z.string().optional(),
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
};
