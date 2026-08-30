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

const activities = defineCollection({
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
const formats = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        fr: cardBlock,
        en: cardBlock,
        es: cardBlock,
    }),
});

export const collections = {
    activities,
    formats,
    homepage,
};
