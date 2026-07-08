namespace SchoolManagementAPI.Models;

public class Mark
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public int SubjectId { get; set; }
    public string ExamType { get; set; } = string.Empty;
    public int Marks { get; set; }
    public string Grade { get; set; } = string.Empty;
    public Student? Student { get; set; }
    public Subject? Subject { get; set; }
}