using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Data;
using PersonalWebsite.Data.Models;

namespace PersonalWebsite.Services;

public class BlogService(AppDbContext db) : IBlogService
{
    public Task<IReadOnlyList<BlogCategory>> GetCategoriesAsync() =>
        db.BlogCategories.AsNoTracking().OrderBy(c => c.Name).ToListAsync()
            .ContinueWith(t => (IReadOnlyList<BlogCategory>)t.Result);

    public Task<IReadOnlyList<BlogPost>> GetPublishedPostsAsync(string? categorySlug = null)
    {
        var query = db.BlogPosts.AsNoTracking()
            .Include(p => p.Category)
            .Where(p => p.IsPublished);

        if (!string.IsNullOrWhiteSpace(categorySlug))
            query = query.Where(p => p.Category.Slug == categorySlug);

        return query.OrderByDescending(p => p.PublishedAt).ToListAsync()
            .ContinueWith(t => (IReadOnlyList<BlogPost>)t.Result);
    }

    public Task<BlogPost?> GetPostBySlugAsync(string slug) =>
        db.BlogPosts.AsNoTracking()
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished);

    public Task<IReadOnlyList<BlogPost>> GetAllPostsAsync() =>
        db.BlogPosts.Include(p => p.Category)
            .OrderByDescending(p => p.PublishedAt)
            .ToListAsync()
            .ContinueWith(t => (IReadOnlyList<BlogPost>)t.Result);

    public Task<BlogPost?> GetPostByIdAsync(int id) =>
        db.BlogPosts.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);

    public async Task SavePostAsync(BlogPost post)
    {
        if (post.Id == 0)
            db.BlogPosts.Add(post);
        else
            db.BlogPosts.Update(post);

        await db.SaveChangesAsync();
    }

    public async Task DeletePostAsync(int id)
    {
        var post = await db.BlogPosts.FindAsync(id);
        if (post is not null)
        {
            db.BlogPosts.Remove(post);
            await db.SaveChangesAsync();
        }
    }

    public async Task SaveCategoryAsync(BlogCategory category)
    {
        if (category.Id == 0)
            db.BlogCategories.Add(category);
        else
            db.BlogCategories.Update(category);

        await db.SaveChangesAsync();
    }

    public async Task DeleteCategoryAsync(int id)
    {
        var category = await db.BlogCategories.FindAsync(id);
        if (category is not null)
        {
            db.BlogCategories.Remove(category);
            await db.SaveChangesAsync();
        }
    }
}
