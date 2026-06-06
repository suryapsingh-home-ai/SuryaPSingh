using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Data.Models;

namespace PersonalWebsite.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ProfileInfo> Profile => Set<ProfileInfo>();
    public DbSet<SiteSection> Sections => Set<SiteSection>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<BlogCategory> BlogCategories => Set<BlogCategory>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SiteSection>()
            .HasIndex(s => s.Key)
            .IsUnique();

        modelBuilder.Entity<BlogCategory>()
            .HasIndex(c => c.Slug)
            .IsUnique();

        modelBuilder.Entity<BlogPost>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        modelBuilder.Entity<BlogPost>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Posts)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
