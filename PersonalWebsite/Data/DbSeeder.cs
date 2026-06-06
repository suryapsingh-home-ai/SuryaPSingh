using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Data.Models;

namespace PersonalWebsite.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        if (await db.Profile.AnyAsync())
            return;

        db.Profile.Add(new ProfileInfo
        {
            FullName = "Surya Partap Singh",
            Tagline = ".NET Senior Software Developer · 11+ Years Experience",
            Email = "surya.psingh@yahoo.com",
            Phone = "+1 (949) 617-4866",
            Location = "Irvine, California, USA · H1-B (I-140 approved)",
            GitHubUrl = "https://github.com/SuryaPSingh-Projects-Portfolio",
            LinkedInUrl = "https://linkedin.com/in/surya-psingh",
            ResumeUrl = "/resume/Singh_Surya_Resume.docx"
        });

        db.Sections.AddRange(
            new SiteSection
            {
                Key = "about",
                Title = "About Me",
                SortOrder = 1,
                Content = """
                    .NET Senior Software Developer with over **11 years** of hands-on experience building enterprise-grade
                    applications using C#, ASP.NET, .NET Core, Web API, Azure Cloud, and N-Tier architectures.

                    Holds a **Master's degree in Computer Applications** with a proven track record of delivering solutions
                    for global clients across the USA and UK. Has contributed to renowned organizations including
                    **Tata Consultancy Services (TCS)**, **HCL Technologies**, **NIIT Technologies**, **Collabera Inc.**,
                    **Randstad Technologies USA**, **SEW USA**, and **Neilson Technology Services**.

                    Broad domain expertise spanning **BFSI, Insurance, Travel, Hi-Tech, Retail, Utilities, and Healthcare**.
                    Successfully held diverse roles including Software Developer, Senior Developer, Technical Lead, and Project Lead.

                    Experienced in designing **Microservices** architectures following **Domain-Driven Design (DDD)** principles,
                    with strong foundations in OOAD, UML, SOLID principles, and design patterns. Hands-on with AI-powered
                    development tools including Cursor, Claude Code, GitHub Copilot, and MCP Server integration.
                    """
            },
            new SiteSection
            {
                Key = "experience",
                Title = "Professional Experience",
                SortOrder = 2,
                Content = """
                    **Neilson Technology Services — Senior Developer**
                    *Nov 2021 – Present · Irvine, CA · Financials / Insurance*

                    - Delivered Microservices APIs using C#, .NET Core Web API, CQRS, MediatR, AutoMapper, and Clean DDD Architecture
                    - Owned Canada month-end financial processing including T-error resolution and regulatory reporting
                    - Engineered automated policy certificates, welcome packs, and endorsements
                    - Architected AI-Assisted Development workflow with Claude Code, Cursor IDE, and GitHub Copilot
                    - Built custom MCP server distributing Agents.md context to AI coding editors
                    - Built AI Agent Cortex using Ollama for local codebase Q&A with zero cloud dependency
                    - Led DataDog observability rollout across 10+ services; created NFS Framework .NET DataDog NuGet package

                    **Smart Energy Water (SEW) — Senior Developer**
                    *May 2020 – Nov 2021 · Irvine, CA · Utilities*

                    - Developed Microservices APIs (Move-In/Move-Out, Transfer Services, Payment Location, Experian Credit Check)
                    - Built AI/Analytics reporting module for utility clients
                    - Developed flexible E-Bill retrieval API supporting local file system, SFTP, and Azure Blob Storage

                    **Randstad Technologies / Princess Cruises — Senior Developer**
                    *Jul 2017 – May 2020 · Santa Clarita, CA · Travel & HR*

                    - Architected Paycard Application using ASP.NET Core MVC and Microservices DDD architecture with PGP Encryption
                    - Implemented Payroll validation Tool (ASP.NET MVC Web API with Angular)
                    - Developed MDMS EPIC Dashboard for SQL Agent job monitoring
                    - POC for Azure AI Cognitive Services (Face Recognition, Speech Recognition)

                    **Collabera / Nationwide Insurance — Developer**
                    *Feb 2016 – Jul 2017 · Brea, CA · Insurance*

                    - Worked on QEC, Portal, ALW, and Salesforce applications
                    - Implemented Oracle Co-browsing solution; developed ASP.NET MVC Web API for third-party aggregation
                    - Salesforce developer — resolved production tickets

                    **Earlier Career**
                    - **NIIT Technologies** (Apr 2011 – Feb 2016) — SITA London, FIS Global, HCC International, Advent Group
                    - **HCL Technologies** (Feb 2010 – Feb 2011) — Internal CRM, mobile SFA
                    - **Tata Consultancy Services** (Jan 2006 – Apr 2009) — Nuffield Health, Credit Suisse, Agilent, HAYS, Commerzbank, Geologix, Barista Lavazza
                    """
            },
            new SiteSection
            {
                Key = "certifications",
                Title = "Certifications",
                SortOrder = 3,
                Content = """
                    - **Microsoft Certified: Azure Developer Associate**
                    - **Microsoft Certified: Azure Solutions Architect Expert**
                    - **TOGAF Standard 9.2 Certified**
                    """
            },
            new SiteSection
            {
                Key = "education",
                Title = "Education",
                SortOrder = 4,
                Content = """
                    **Master of Computer Applications (MCA)**
                    DAV Institute of Management and Technology — M.D. University, Rohtak
                    *July 2000 – July 2003*

                    **Bachelor of Science (B.Sc.)**
                    Rajdhani College, New Delhi — University of Delhi
                    *July 1997 – July 2000*
                    """
            }
        );

        var categories = new[]
        {
            new BlogCategory { Name = ".NET & C#", Slug = "dotnet" },
            new BlogCategory { Name = "Architecture", Slug = "architecture" },
            new BlogCategory { Name = "DevOps & Observability", Slug = "devops" },
            new BlogCategory { Name = "AI & ML", Slug = "ai" }
        };
        db.BlogCategories.AddRange(categories);
        await db.SaveChangesAsync();

        db.BlogPosts.AddRange(
            new BlogPost
            {
                Title = "Building a Blazor Server CMS from Scratch",
                Slug = "blazor-server-cms",
                Summary = "How to structure a content-managed personal site with EF Core and interactive server components.",
                CategoryId = categories[0].Id,
                PublishedAt = DateTime.UtcNow.AddDays(-14),
                IsPublished = true,
                Content = """
                    ## Why Blazor Server?

                    Blazor Server gives you a rich interactive UI without shipping a large JavaScript bundle.
                    For a personal site with an admin panel, this means fast iteration in C# end to end.

                    ## Key design choices

                    - **EF Core + SQLite** for zero-config local development
                    - **Section-based CMS** so every part of the homepage is editable
                    - **Cookie auth** for a simple admin area
                    """
            },
            new BlogPost
            {
                Title = "Rolling Out DataDog Observability Across Microservices",
                Slug = "datadog-microservices-observability",
                Summary = "Lessons from leading DataDog implementation across 10+ .NET services including custom NuGet instrumentation.",
                CategoryId = categories[2].Id,
                PublishedAt = DateTime.UtcNow.AddDays(-7),
                IsPublished = true,
                Content = """
                    ## The challenge

                    When you have 10+ microservices in production, consistent observability is not optional.

                    ### What worked

                    1. Standardize instrumentation via a shared NuGet package
                    2. Establish dashboards and alerting rules per service domain
                    3. Create runbooks tied to alert thresholds
                    4. Track MTTR as the primary success metric

                    A plug-and-play DataDog package for Web APIs, Azure Functions, and Hosted Services
                    dramatically reduced onboarding time for new services.
                    """
            },
            new BlogPost
            {
                Title = "AI-Assisted Development with MCP and Agents.md",
                Slug = "ai-assisted-development-mcp",
                Summary = "Architecting an AI-assisted workflow using Claude Code, Cursor IDE, and a custom MCP server.",
                CategoryId = categories[3].Id,
                PublishedAt = DateTime.UtcNow.AddDays(-3),
                IsPublished = true,
                Content = """
                    ## Consistent AI guidance across the team

                    AI coding assistants are only as good as the context they receive.

                    ### Our approach

                    - Distribute **Agents.md** context via a custom **MCP server**
                    - Standardize on Cursor IDE and GitHub Copilot alongside Claude Code
                    - Build local tooling (AI Agent Cortex) for codebase Q&A without cloud dependency

                    The result: faster delivery velocity and shorter code review cycles.
                    """
            }
        );

        db.Skills.AddRange(
            new Skill { Name = "C#", Category = "Languages", SortOrder = 1 },
            new Skill { Name = "Python", Category = "Languages", SortOrder = 2 },
            new Skill { Name = "JavaScript / TypeScript", Category = "Languages", SortOrder = 3 },
            new Skill { Name = "ASP.NET Core", Category = "Backend", SortOrder = 4 },
            new Skill { Name = ".NET Core Web API", Category = "Backend", SortOrder = 5 },
            new Skill { Name = "Entity Framework Core", Category = "Backend", SortOrder = 6 },
            new Skill { Name = "WCF / WPF", Category = "Backend", SortOrder = 7 },
            new Skill { Name = "React", Category = "Frontend", SortOrder = 8 },
            new Skill { Name = "Vue 2", Category = "Frontend", SortOrder = 9 },
            new Skill { Name = "Angular", Category = "Frontend", SortOrder = 10 },
            new Skill { Name = "Blazor", Category = "Frontend", SortOrder = 11 },
            new Skill { Name = "SQL Server / T-SQL", Category = "Data", SortOrder = 12 },
            new Skill { Name = "PostgreSQL", Category = "Data", SortOrder = 13 },
            new Skill { Name = "Oracle", Category = "Data", SortOrder = 14 },
            new Skill { Name = "Azure Cloud", Category = "Cloud", SortOrder = 15 },
            new Skill { Name = "Azure OpenAI / AI Foundry", Category = "AI", SortOrder = 16 },
            new Skill { Name = "Semantic Kernel", Category = "AI", SortOrder = 17 },
            new Skill { Name = "DataDog", Category = "DevOps", SortOrder = 18 },
            new Skill { Name = "Microservices / DDD / CQRS", Category = "Architecture", SortOrder = 19 },
            new Skill { Name = "Docker / IIS", Category = "DevOps", SortOrder = 20 },
            new Skill { Name = "Git / TFS / SVN", Category = "Tools", SortOrder = 21 },
            new Skill { Name = "Agile / Scrum / TDD", Category = "Methodology", SortOrder = 22 }
        );

        db.Projects.AddRange(
            new Project
            {
                Title = "NFS Framework — DataDog NuGet Package",
                Description = "Plug-and-play DataDog instrumentation package for Web APIs, Azure Functions, and Hosted Services, adopted across Neilson Financial services.",
                TechStack = "C#, .NET Core, DataDog, NuGet",
                SortOrder = 1
            },
            new Project
            {
                Title = "AI Agent Cortex",
                Description = "Local code Q&A: index a repo, semantic search with Ollama, answers with file references — zero cloud dependency.",
                TechStack = ".NET 9, Blazor Server, Semantic Kernel, Ollama",
                RepositoryUrl = "https://github.com/SuryaPSingh-Projects-Portfolio/AI",
                SortOrder = 2
            },
            new Project
            {
                Title = "Paycard Application — Princess Cruises",
                Description = "ASP.NET Core MVC and .NET Core Web API application with Microservices DDD architecture and PGP Encryption for PCI compliance.",
                TechStack = "ASP.NET Core, Web API, Angular, Microservices, DDD",
                SortOrder = 3
            },
            new Project
            {
                Title = "SEW Utility Microservices",
                Description = "Move-In/Move-Out, Transfer Services, Payment Location, and Experian Credit Check APIs for South West Gas implementation.",
                TechStack = "C#, .NET Core Web API, PostgreSQL, CQRS, TDD",
                SortOrder = 4
            },
            new Project
            {
                Title = "Shopping — E-Commerce Portfolio",
                Description = "Product catalog, Stripe Checkout, webhooks; one Django API powering React, Vue, and Angular frontends.",
                TechStack = "Django REST, Stripe; React / Vue / Angular",
                RepositoryUrl = "https://github.com/SuryaPSingh-Projects-Portfolio/E-Commerce",
                SortOrder = 5
            },
            new Project
            {
                Title = "Sentryx — API Monitoring",
                Description = "Third-party API monitoring: uptime, latency, and error tracking from one dashboard.",
                TechStack = "Go (chi), React, TypeScript, Vite, Docker",
                RepositoryUrl = "https://github.com/SuryaPSingh-Projects-Portfolio/Operations",
                SortOrder = 6
            }
        );

        await db.SaveChangesAsync();
    }
}
