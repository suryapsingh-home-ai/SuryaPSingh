using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Data;
using PersonalWebsite.Data.Models;

namespace PersonalWebsite.Services;

public class ContactService(AppDbContext db) : IContactService
{
    public async Task SubmitMessageAsync(ContactMessage message)
    {
        message.CreatedAt = DateTime.UtcNow;
        message.IsRead = false;
        db.ContactMessages.Add(message);
        await db.SaveChangesAsync();
    }

    public Task<IReadOnlyList<ContactMessage>> GetMessagesAsync() =>
        db.ContactMessages.OrderByDescending(m => m.CreatedAt).ToListAsync()
            .ContinueWith(t => (IReadOnlyList<ContactMessage>)t.Result);

    public async Task MarkAsReadAsync(int id)
    {
        var message = await db.ContactMessages.FindAsync(id);
        if (message is not null)
        {
            message.IsRead = true;
            await db.SaveChangesAsync();
        }
    }

    public async Task DeleteMessageAsync(int id)
    {
        var message = await db.ContactMessages.FindAsync(id);
        if (message is not null)
        {
            db.ContactMessages.Remove(message);
            await db.SaveChangesAsync();
        }
    }
}
