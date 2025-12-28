// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // output: 'static' is the default in Astro 5
  integrations: [keystatic(), react()],

  vite: {
    plugins: [tailwindcss()]
  }
});