import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
    storage: import.meta.env.PROD
        ? {
            kind: 'github',
            repo: 'PaulDELACELLE/wild-odyssey',
        }
        : {
            kind: 'local',
        },
    singletons: {
        homepage: singleton({
            label: 'Page d\'accueil',
            path: 'src/content/homepage/index',
            format: { data: 'json' },
            schema: {
                heroTitle: fields.text({ label: 'Titre Hero' }),
                heroSubtitle: fields.text({ label: 'Sous-titre Hero', multiline: true }),
                heroImage: fields.image({
                    label: 'Image Hero Background',
                    directory: 'public/assets/images/hero',
                    publicPath: '/assets/images/hero/',
                    validation: { isRequired: true },
                }),
            },
        }),
    },
    collections: {
        activities: collection({
            label: 'Activités',
            slugField: 'title',
            path: 'src/content/activities/*',
            format: { data: 'json' },
            schema: {
                title: fields.slug({ name: { label: 'Titre' } }),
                description: fields.text({ label: 'Description', multiline: true }),
                duration: fields.text({ label: 'Durée' }),
                participants: fields.text({ label: 'Participants' }),
                color: fields.text({ label: 'Couleur (Tailwind class)', defaultValue: 'bg-primary' }),
                image: fields.image({
                    label: 'Image',
                    directory: 'public/assets/images/activities',
                    publicPath: '/assets/images/activities/',
                }),
            },
        }),
    },
});
