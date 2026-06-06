# Personal Website — Surya P. Singh

A professional personal website built with **ASP.NET Core 9 Blazor Server**, featuring a content-managed homepage, categorized technical blog, contact form, and admin panel.

## Features

- **About, Experience & Education** — editable site sections seeded from portfolio/resume data
- **Skills & Projects** — grouped skills and featured project cards
- **Technical Blog** — categorized posts with filtering (.NET, Architecture, DevOps, AI)
- **Contact Form** — name, email, phone, message (max 1000 chars with live character count)
- **Admin CMS** — sign in to update or delete profile, sections, skills, projects, blog posts, categories, and view contact messages

## Run locally

```bash
cd PersonalWebsite
dotnet run
```

Open [http://localhost:5000](http://localhost:5000) (or the URL shown in the terminal).

## Admin access

Default credentials (change in `appsettings.json`):

| Setting  | Default        |
|----------|----------------|
| Username | `admin`        |
| Password | `ChangeMe123!` |

Admin panel: [/admin/login](http://localhost:5000/admin/login)

## Tech stack

- .NET 9, Blazor Server (Interactive Server)
- Entity Framework Core + SQLite
- Cookie authentication for admin
- Custom CSS (white, professional theme)

## Customization

1. Update profile and content via the admin panel at `/admin`
2. Change admin credentials in `appsettings.json` under `Admin`
3. Replace seeded content with your actual resume details in admin → Sections / Profile
