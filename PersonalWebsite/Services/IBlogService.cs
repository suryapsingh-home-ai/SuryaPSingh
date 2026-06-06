using PersonalWebsite.Data.Models;

namespace PersonalWebsite.Services;

public interface IBlogService
{
    Task<IReadOnlyList<BlogCategory>> GetCategoriesAsync();
    Task<IReadOnlyList<BlogPost>> GetPublishedPostsAsync(string? categorySlug = null);
    Task<BlogPost?> GetPostBySlugAsync(string slug);
    Task<IReadOnlyList<BlogPost>> GetAllPostsAsync();
    Task<BlogPost?> GetPostByIdAsync(int id);
    Task SavePostAsync(BlogPost post);
    Task DeletePostAsync(int id);
    Task SaveCategoryAsync(BlogCategory category);
    Task DeleteCategoryAsync(int id);
}
