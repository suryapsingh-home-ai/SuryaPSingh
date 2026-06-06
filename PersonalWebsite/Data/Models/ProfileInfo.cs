namespace PersonalWebsite.Data.Models;

public class ProfileInfo
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? GitHubUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? ResumeUrl { get; set; }
}
