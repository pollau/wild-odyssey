import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
    storage: import.meta.env.PROD
        ? {
            kind: 'github',
            repo: 'pollau/wild-odyssey',
            clientId: 'Ov23liIAbyk1IMYRqHI5',
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

                // Section À Propos
                aboutTitle: fields.text({ label: 'Titre À Propos', defaultValue: 'Lionel Raybaud' }),
                aboutBio: fields.text({
                    label: 'Biographie',
                    multiline: true,
                    defaultValue: 'Passionné par le vivant, Lionel est certifié par le Ministère de la Transition Écologique...'
                }),
                aboutImage: fields.image({
                    label: 'Photo Profil',
                    directory: 'public/assets/images/about',
                    publicPath: '/assets/images/about/',
                }),

                // Section Contact
                contactEmail: fields.text({ label: 'Email Contact', defaultValue: 'lionel.raybaud.green@gmail.com' }),
                contactPhone: fields.text({ label: 'Téléphone', defaultValue: '+33 6 50 32 18 94' }),
                contactLinkedin: fields.text({ label: 'LinkedIn URL', defaultValue: 'https://www.linkedin.com/in/lionel-raybaud/' }),
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
