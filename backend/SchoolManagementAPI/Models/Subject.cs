namespace SchoolManagementAPI.Models;

public class Subject
{
    public int Id { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public int? TeacherId { get; set; }
    public string Type { get; set; } = "Core";
    public Teacher? Teacher { get; set; }
}