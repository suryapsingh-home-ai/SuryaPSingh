using PersonalWebsite.Data.Models;

namespace PersonalWebsite.Services;

public interface ISiteContentService
{
    Task<ProfileInfo?> GetProfileAsync();
    Task UpdateProfileAsync(ProfileInfo profile);
    Task<IReadOnlyList<SiteSection>> GetVisibleSectionsAsync();
    Task<IReadOnlyList<SiteSection>> GetAllSectionsAsync();
    Task<SiteSection?> GetSectionByIdAsync(int id);
    Task SaveSectionAsync(SiteSection section);
    Task DeleteSectionAsync(int id);
    Task<IReadOnlyList<Skill>> GetSkillsAsync();
    Task SaveSkillAsync(Skill skill);
    Task DeleteSkillAsync(int id);
    Task<IReadOnlyList<Project>> GetProjectsAsync(bool visibleOnly = true);
    Task SaveProjectAsync(Project project);
    Task DeleteProjectAsync(int id);
}
