// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// L'integration Keystatic injecte des routes `prerender: false` (UI + API),
// incompatibles avec un build 100% statique. On ne l'active donc qu'en dev,
// ou le serveur Astro sait les servir : la prod reste statique et s'appuie sur
// la page pre-rendue src/pages/keystatic + le rewrite d'Azure SWA.
const isDev = process.env.NODE_ENV !== 'production';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.wildodyssey.org',
  output: 'static',
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en', 'es'],
    routing: {
      prefixDefaultLocale: false
    }
  },

  // output: 'static' is the default in Astro 5
  integrations: [...(isDev ? [keystatic()] : []), react(), sitemap({
    filter: (page) => !page.includes('/keystatic/'),
    i18n: {
      defaultLocale: 'fr',
      locales: {
        fr: 'fr-FR',
        en: 'en-US',
        es: 'es-ES',
      },
    },
  })],

  vite: {
    plugins: [tailwindcss()]
  }
});