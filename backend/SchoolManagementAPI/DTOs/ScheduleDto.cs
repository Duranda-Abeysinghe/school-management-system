namespace SchoolManagementAPI.DTOs;

public class ScheduleDto
{
    public int? ClassId { get; set; }
    public int? SubjectId { get; set; }
    public int? TeacherId { get; set; }
    public string Day { get; set; } = string.Empty;      // "Monday", "Tuesday", etc.
    public string StartTime { get; set; } = string.Empty; // "08:00"
    public string EndTime { get; set; } = string.Empty;   // "09:00"
    public string Room { get; set; } = string.Empty;
}