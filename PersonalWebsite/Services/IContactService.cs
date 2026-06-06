using PersonalWebsite.Data.Models;

namespace PersonalWebsite.Services;

public interface IContactService
{
    Task SubmitMessageAsync(ContactMessage message);
    Task<IReadOnlyList<ContactMessage>> GetMessagesAsync();
    Task MarkAsReadAsync(int id);
    Task DeleteMessageAsync(int id);
}
