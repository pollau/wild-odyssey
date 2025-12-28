import { defineCollection, z } from 'astro:content';

const activities = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        // EN
        title_en: z.string().optional(),
        description_en: z.string().optional(),
        // ES
        title_es: z.string().optional(),
        description_es: z.string().optional(),

        duration: z.string().optional(),
        participants: z.string().optional(),
        color: z.string().optional(),
        image: z.string().optional(),
    }),
});

const homepage = defineCollection({
    type: 'data',
    schema: z.object({
        heroTitle: z.string(),
        heroSubtitle: z.string(),
        // EN
        heroTitle_en: z.string().optional(),
        heroSubtitle_en: z.string().optional(),
        // ES
        heroTitle_es: z.string().optional(),
        heroSubtitle_es: z.string().optional(),

        heroImage: z.string().optional(),

        // About
        aboutTitle: z.string().optional(),
        aboutBio: z.string().optional(),
        aboutImage: z.string().optional(),

        // Contact
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        contactLinkedin: z.string().optional(),
    }),
});

export const collections = {
    activities,
    homepage,
};
