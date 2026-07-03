// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

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
  integrations: [/*keystatic(),*/ react(), sitemap({
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