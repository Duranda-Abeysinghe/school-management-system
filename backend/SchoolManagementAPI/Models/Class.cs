namespace SchoolManagementAPI.Models;

public class Class
{
    public int Id { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;

    // NEW — numeric grade derived from ClassName ("Grade 3" -> 3),
    // used so the primary timetable can query/group by grade without
    // parsing ClassName text everywhere.
    public int? Grade { get; set; }

    public int? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    public ICollection<Student> Students { get; set; } = new List<Student>();
}