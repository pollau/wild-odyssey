import { defineCollection, z } from 'astro:content';

const activities = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        description: z.string(),
        title_fr: z.string().optional(),
        description_fr: z.string().optional(),
        title_es: z.string().optional(),
        description_es: z.string().optional(),
        duration: z.string().optional(),
        participants: z.string().optional(),
        format: z.array(z.string()).optional(),
        theme: z.string().optional(),
        image: z.string().nullable().optional(),
    }),
});

const homepage = defineCollection({
    type: 'data',
    schema: z.object({
        heroTitle_fr: z.string().optional(),
        heroTitle_en: z.string().optional(),
        heroTitle_es: z.string().optional(),
        statsParticipants: z.string().optional(),
        statsOrganizations: z.string().optional(),
        statsYears: z.string().optional(),
        contactEmail: z.string().optional(),
    }),
});

export const collections = {
    activities,
    homepage,
};
