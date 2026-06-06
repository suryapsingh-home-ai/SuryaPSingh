namespace PersonalWebsite.Data.Models;

public class BlogPost
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public BlogCategory Category { get; set; } = null!;
    public DateTime PublishedAt { get; set; }
    public bool IsPublished { get; set; }
}
