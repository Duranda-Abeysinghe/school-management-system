namespace SchoolManagementAPI.Models;

public class Request
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string? Type { get; set; }
    public string? Message { get; set; }
    public string? FileUrl { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public Student? Student { get; set; }
}