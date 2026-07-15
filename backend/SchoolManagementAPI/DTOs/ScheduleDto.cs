namespace SchoolManagementAPI.DTOs;

public class ScheduleDto
{
    public int?   ClassId   { get; set; }
    public int?   SubjectId { get; set; }
    public int?   TeacherId { get; set; }
    public string Day       { get; set; } = "";
    public string? StartTime { get; set; }
    public string? EndTime   { get; set; }
    public string? Room      { get; set; }
}