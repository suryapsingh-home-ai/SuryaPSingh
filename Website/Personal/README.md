# Surya Partap Singh — Personal Portfolio

Static professional site (Astro) with a Git-based Admin module (Sveltia CMS) for editing site text. Content lives in `content/site.json` and is seeded from your resume.

## Quick start

```bash
cd Website/Personal
npm install
npm run dev
```

Open http://localhost:4321

Admin UI (after config): http://localhost:4321/admin/

## Edit content

### Option A — Admin UI (recommended)

1. Open `/admin/`
2. Sign in with GitHub (production) or use local backend while developing
3. Edit any text field → save → commit lands in `content/site.json`
4. GitHub Actions rebuilds and publishes the site

Update `public/admin/config.yml`:

- `backend.repo` — your GitHub `owner/repo`
- `backend.base_path` — `Website/Personal` if this stays in the monorepo

### Option B — Edit the JSON file

Change `content/site.json` in the editor and refresh the site.

## Free hosting

### GitHub Pages (workflow included)

Workflow: `.github/workflows/personal-portfolio.yml` (repo root).

1. Push to `main`
2. In the GitHub repo: **Settings → Pages → Source: GitHub Actions**
3. Site URL will look like `https://<org-or-user>.github.io/<repo>/` unless you use a custom domain

If Pages serves from a subpath, set `base` in `astro.config.mjs` (e.g. `base: '/Projects-Portfolio/'`).

### Cloudflare Pages (alternative)

Connect the GitHub repo, set:

- Root directory: `Website/Personal`
- Build command: `npm run build`
- Output directory: `dist`

Free HTTPS subdomain: `*.pages.dev`

## Free domain vs custom domain

- **Free now:** use the host subdomain (`*.github.io` or `*.pages.dev`)
- **Later (~$10/year):** buy a domain (Cloudflare Registrar is a good option) and point DNS to Pages/GitHub

## Resume download

`public/resume/Surya_Singh_Resume.docx` is linked from the hero CTA. Replace that file anytime; keep the same filename or update `hero.secondaryCtaHref` in content.

## Project layout

```
content/site.json          ← all editable text
public/admin/              ← CMS admin UI + config
public/resume/             ← downloadable resume
src/components/            ← page sections
src/pages/index.astro      ← assembles the site
```
