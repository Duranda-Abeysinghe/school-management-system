namespace SchoolManagementAPI.Models;

public class Class
{
    public int Id { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public int? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    public ICollection<Student> Students { get; set; } = new List<Student>();
}
