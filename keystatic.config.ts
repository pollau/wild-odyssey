import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
    storage: import.meta.env.PROD
        ? { kind: 'cloud' }
        : { kind: 'local' },
    cloud: {
        project: 'wild-odyssey/wild-odyssey',
    },
    singletons: {
        homepage: singleton({
            label: 'Homepage',
            path: 'src/content/homepage/index',
            format: { data: 'json' },
            schema: {
                heroTitle_fr: fields.text({ label: 'Hero Title (FR)' }),
                heroTitle_en: fields.text({ label: 'Hero Title (EN)' }),
                heroTitle_es: fields.text({ label: 'Hero Title (ES)' }),
                statsParticipants: fields.text({ label: 'Stats — Participants', defaultValue: '+500.000' }),
                statsOrganizations: fields.text({ label: 'Stats — Organizations', defaultValue: '+2.000' }),
                statsYears: fields.text({ label: 'Stats — Years of experience', defaultValue: '+5' }),
                contactEmail: fields.text({ label: 'Contact Email' }),
            },
        }),
    },
    collections: {
        activities: collection({
            label: 'Workshops',
            slugField: 'title',
            path: 'src/content/activities/*',
            format: { data: 'json' },
            schema: {
                title: fields.slug({ name: { label: 'Name' } }),
                subtitle: fields.text({ label: 'Subtitle (tagline)' }),
                description: fields.text({ label: 'Description (EN)', multiline: true }),
                title_fr: fields.text({ label: 'Name (FR)' }),
                description_fr: fields.text({ label: 'Description (FR)', multiline: true }),
                title_es: fields.text({ label: 'Name (ES)' }),
                description_es: fields.text({ label: 'Description (ES)', multiline: true }),
                duration: fields.text({ label: 'Duration (e.g. "From 2h")' }),
                participants: fields.text({ label: 'Group size (e.g. "14–30 people")' }),
                format: fields.multiselect({
                    label: 'Formats',
                    options: [
                        { label: 'Workshop', value: 'workshop' },
                        { label: 'Masterclass', value: 'masterclass' },
                        { label: 'Ocean Walk', value: 'ocean-walk' },
                        { label: 'Custom', value: 'custom' },
                    ],
                }),
                theme: fields.select({
                    label: 'Theme',
                    options: [
                        { label: 'Desirable Futures', value: 'desirable-futures' },
                        { label: 'Ocean & Systemic', value: 'ocean' },
                        { label: 'Biodiversity', value: 'biodiversity' },
                        { label: 'Carbon Footprint', value: 'carbon' },
                    ],
                    defaultValue: 'desirable-futures',
                }),
                image: fields.image({
                    label: 'Cover image',
                    directory: 'public/assets/images/activities',
                    publicPath: '/assets/images/activities/',
                }),
            },
        }),
    },
});
