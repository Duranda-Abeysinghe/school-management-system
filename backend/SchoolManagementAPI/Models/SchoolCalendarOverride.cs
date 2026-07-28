namespace SchoolManagementAPI.Models;

public class SchoolCalendarOverride
{
    public int Id { get; set; }
    public DateTime OverrideDate { get; set; }
    public bool IsSchoolDay { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}