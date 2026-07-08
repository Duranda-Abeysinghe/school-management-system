namespace SchoolManagementAPI.Models;

public class Announcement
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Target { get; set; } = "All";
    public string Priority { get; set; } = "Normal";
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}