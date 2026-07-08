namespace SchoolManagementAPI.DTOs;

public class TeacherUpdateDto
{
    public string  FullName { get; set; } = "";
    public string  Email    { get; set; } = "";
    public string? Phone    { get; set; }
    public string? Gender   { get; set; }
    public string? Subject  { get; set; }
    public string? Address  { get; set; }
    public string  Status   { get; set; } = "Active";
}