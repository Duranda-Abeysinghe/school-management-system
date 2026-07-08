namespace SchoolManagementAPI.Models;

public class Schedule
{
    public int Id { get; set; }
    public int? ClassId { get; set; }
    public int? SubjectId { get; set; }
    public int? TeacherId { get; set; }
    public string Day { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Room { get; set; } = string.Empty;
    public Class? Class { get; set; }
    public Subject? Subject { get; set; }
    public Teacher? Teacher { get; set; }
}