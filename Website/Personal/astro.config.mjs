// @ts-check
import { defineConfig } from 'astro/config';

// Local: http://localhost:4321/
// GitHub Pages: set BASE_PATH=/SuryaPSingh/ in CI (see deploy workflow)
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: 'https://suryapsingh-home-ai.github.io',
  base,
  trailingSlash: 'ignore',
});
