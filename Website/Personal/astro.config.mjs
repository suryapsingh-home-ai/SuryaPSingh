// @ts-check
import { defineConfig } from 'astro/config';

// Update `site` after you know your live URL (GitHub Pages / Cloudflare Pages).
// If this folder is published as a project site under a subpath, set `base` too
// (e.g. base: '/personal/'). Leave base as '/' for a root site or custom domain.
export default defineConfig({
  site: 'https://suryapsingh-home-ai.github.io',
  // Project Pages URL: https://suryapsingh-home-ai.github.io/SuryaPSingh/
  // Use '/' instead if you later attach a custom domain at the site root.
  base: '/SuryaPSingh/',
  trailingSlash: 'ignore',
});
