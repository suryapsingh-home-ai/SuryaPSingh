using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Data;
using PersonalWebsite.Data.Models;

namespace PersonalWebsite.Services;

public class SiteContentService(AppDbContext db) : ISiteContentService
{
    public Task<ProfileInfo?> GetProfileAsync() =>
        db.Profile.AsNoTracking().FirstOrDefaultAsync();

    public async Task UpdateProfileAsync(ProfileInfo profile)
    {
        var existing = await db.Profile.FirstOrDefaultAsync();
        if (existing is null)
        {
            db.Profile.Add(profile);
        }
        else
        {
            existing.FullName = profile.FullName;
            existing.Tagline = profile.Tagline;
            existing.Email = profile.Email;
            existing.Phone = profile.Phone;
            existing.Location = profile.Location;
            existing.GitHubUrl = profile.GitHubUrl;
            existing.LinkedInUrl = profile.LinkedInUrl;
            existing.ResumeUrl = profile.ResumeUrl;
        }

        await db.SaveChangesAsync();
    }

    public Task<IReadOnlyList<SiteSection>> GetVisibleSectionsAsync() =>
        db.Sections.AsNoTracking()
            .Where(s => s.IsVisible)
            .OrderBy(s => s.SortOrder)
            .ToListAsync()
            .ContinueWith(t => (IReadOnlyList<SiteSection>)t.Result);

    public Task<IReadOnlyList<SiteSection>> GetAllSectionsAsync() =>
        db.Sections.OrderBy(s => s.SortOrder).ToListAsync()
            .ContinueWith(t => (IReadOnlyList<SiteSection>)t.Result);

    public Task<SiteSection?> GetSectionByIdAsync(int id) =>
        db.Sections.FirstOrDefaultAsync(s => s.Id == id);

    public async Task SaveSectionAsync(SiteSection section)
    {
        if (section.Id == 0)
            db.Sections.Add(section);
        else
            db.Sections.Update(section);

        await db.SaveChangesAsync();
    }

    public async Task DeleteSectionAsync(int id)
    {
        var section = await db.Sections.FindAsync(id);
        if (section is not null)
        {
            db.Sections.Remove(section);
            await db.SaveChangesAsync();
        }
    }

    public Task<IReadOnlyList<Skill>> GetSkillsAsync() =>
        db.Skills.AsNoTracking().OrderBy(s => s.SortOrder).ToListAsync()
            .ContinueWith(t => (IReadOnlyList<Skill>)t.Result);

    public async Task SaveSkillAsync(Skill skill)
    {
        if (skill.Id == 0)
            db.Skills.Add(skill);
        else
            db.Skills.Update(skill);

        await db.SaveChangesAsync();
    }

    public async Task DeleteSkillAsync(int id)
    {
        var skill = await db.Skills.FindAsync(id);
        if (skill is not null)
        {
            db.Skills.Remove(skill);
            await db.SaveChangesAsync();
        }
    }

    public Task<IReadOnlyList<Project>> GetProjectsAsync(bool visibleOnly = true)
    {
        var query = db.Projects.AsNoTracking().AsQueryable();
        if (visibleOnly)
            query = query.Where(p => p.IsVisible);

        return query.OrderBy(p => p.SortOrder).ToListAsync()
            .ContinueWith(t => (IReadOnlyList<Project>)t.Result);
    }

    public async Task SaveProjectAsync(Project project)
    {
        if (project.Id == 0)
            db.Projects.Add(project);
        else
            db.Projects.Update(project);

        await db.SaveChangesAsync();
    }

    public async Task DeleteProjectAsync(int id)
    {
        var project = await db.Projects.FindAsync(id);
        if (project is not null)
        {
            db.Projects.Remove(project);
            await db.SaveChangesAsync();
        }
    }
}
