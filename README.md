# Surya P. Singh — Projects Portfolio

Full-stack projects across **e-commerce**, **real estate**, **social media**, **operations / DevOps**, **AI**, **education**, and a **personal website** — built with Python, Go, Node.js, TypeScript, and .NET, plus React, Vue, Angular, and Blazor frontends.

> This file is ready to use as the GitHub **organization profile** for
> [github.com/SuryaPSingh-Projects-Portfolio](https://github.com/SuryaPSingh-Projects-Portfolio).
> See [Publish this as your shareable link](#publish-this-as-your-shareable-link) at the bottom.

---

## Featured projects

| Project | Purpose | Tech stack | Repository |
|---------|---------|------------|------------|
| **E-Commerce — Shopping** | Product catalog, cart, and Stripe Checkout with webhook-driven order processing. One API powers React, Vue, and Angular frontends. | Python, Django REST, Stripe; React / Vue / Angular | [E-Commerce](https://github.com/SuryaPSingh-Projects-Portfolio/E-Commerce) |
| **Real Estate — RealtyAI** | Schema-driven listings platform (properties, jobs, cars, …) with public browse, search, admin approval, and lister accounts. | Django, Angular, OpenAPI / Swagger, Docker | [RealEstate](https://github.com/SuryaPSingh-Projects-Portfolio/RealEstate) |
| **Social Media — MyWorld** | Social platform with JWT auth, live feed (GraphQL subscriptions), profiles, posts, likes, comments, friend connections, groups, and marketplace. | Node.js, Express, **Apollo Server (GraphQL)**, React (Vite), **Apollo Client**, PostgreSQL, WebSockets | [SocialMedia](https://github.com/SuryaPSingh-Projects-Portfolio/SocialMedia) (app in `MyWorld/`) |
| **Operations — Sentryx** | Third-party API monitoring: uptime, latency, and error tracking for external services from one dashboard. | Go (`chi`), React, TypeScript, Vite, PostgreSQL / SQLite, Docker | [Operations](https://github.com/SuryaPSingh-Projects-Portfolio/Operations) |

Each repository contains its own detailed README with setup and run instructions.

---

## More projects

| Project | Purpose | Tech stack | Location |
|---------|---------|------------|----------|
| **Personal Website** | Professional site with CMS admin, blog, skills, projects, and contact form. | ASP.NET Core 9, Blazor Server, EF Core, SQLite | [PersonalWebsite](https://github.com/SuryaPSingh-Projects-Portfolio/PersonalWebsite) |
| **AI — Cortex** | Local code Q&A assistant: index a repo, semantic search with Ollama embeddings, answers with file references. | .NET 9, Blazor Server, Semantic Kernel, PostgreSQL | [AI](https://github.com/SuryaPSingh-Projects-Portfolio/AI) (`AI_Agent_Cortex/`) |
| **Education — QuizMaster** | Interactive browser quizzes (C#, SQL, Python, Docker, AI, …) with timer, scoring, and explanations. | HTML, CSS, JavaScript | [Education](https://github.com/SuryaPSingh-Projects-Portfolio/Education) (`QuizMaster/`) |
| **Education — OnlineTestAI** | Online testing platform API and Blazor web UI. | ASP.NET Core 9, EF Core, PostgreSQL, Swagger | [Education](https://github.com/SuryaPSingh-Projects-Portfolio/Education) (`TestAI/`) |

---

## Local folder layout

```
Projects-Portfolio/
├── E-Commerce/       → Shopping (Django + multi-frontend)
├── RealEstate/       → RealtyAI
├── SocialMedia/      → MyWorld
├── Operations/       → Sentryx
├── PersonalWebsite/  → Blazor personal site
├── AI/               → AI Agent Cortex
└── Education/        → QuizMaster, OnlineTestAI
```

---

## Skills demonstrated

- **Backend / APIs:** Django REST, Express, Go (`chi`), ASP.NET Core
- **GraphQL:** Apollo Server, Apollo Client, subscriptions (WebSockets), schema + resolvers
- **Frontends:** React, Vue, Angular, Blazor Server
- **Data:** PostgreSQL, SQLite, EF Core migrations, raw SQL schemas
- **Integrations:** Stripe payments & webhooks, JWT auth, OpenAPI / Swagger
- **AI / ML tooling:** Semantic Kernel, Ollama embeddings, local RAG-style Q&A
- **Tooling:** Docker / Docker Compose, CORS, environment-based config, Vite

---

## Highlight: MyWorld (Social Media)

Recent work on **MyWorld** demonstrates patterns common in production social apps:

- **GraphQL-first API** with queries, mutations, and real-time subscriptions
- **Live feed** — new posts, likes, and comments push to all connected clients
- **Social graph** — search users, friend requests, accepted connections
- **Groups & marketplace** — nested features on a shared auth and data layer
- **Portfolio-ready docs** — README, setup guide, seed data, MIT license

Quick start (see `SocialMedia/MyWorld/README.md`):

```bash
createdb myworld && psql -U postgres -d myworld -f SocialMedia/MyWorld/database/schema.sql
cd SocialMedia/MyWorld/backend && npm install && npm run dev
cd SocialMedia/MyWorld/frontend && npm install && npm run dev
```

Demo login: `john@example.com` / `password123`

---

## Contact

- **GitHub:** [SuryaPSingh-Projects-Portfolio](https://github.com/SuryaPSingh-Projects-Portfolio)
- **LinkedIn:** [linkedin.com/in/suryapsingh1979](https://www.linkedin.com/in/suryapsingh1979/)

---

## Publish this as your shareable link

To make `github.com/SuryaPSingh-Projects-Portfolio` show this page:

1. In the org, create a **public** repository named exactly `.github`.
2. Add this file at the path `profile/README.md` inside it.
3. Commit and push — GitHub renders it on the org landing page automatically.

> **Important:** project repos must be **Public** for recruiters and tech leads to browse code.
> For each repo: **Settings → General → Danger Zone → Change visibility → Public**.

---

**License:** Individual projects may use their own licenses (e.g. MyWorld is MIT). Check each repository's `LICENSE` file.
