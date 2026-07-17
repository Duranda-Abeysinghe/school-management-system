using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

// One class teacher per class, per academic year. Kept separate from
// Class.TeacherId (which stays as the "current" convenience field used
// elsewhere) so past years' assignments aren't lost when a new teacher
// takes over a class.
public class ClassTeacherAssignment
{
    public int Id { get; set; }

    public int ClassId { get; set; }
    [ForeignKey("ClassId")]
    public Class? Class { get; set; }

    public int TeacherId { get; set; }
    [ForeignKey("TeacherId")]
    public Teacher? Teacher { get; set; }

    public int AcademicYear { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// No periods — just which subjects fall on which weekday for a class
// in a given year, and who teaches them (normally the class teacher;
// only the Grade 5 English case points at a different teacher).
// Separate from the existing period-based Schedule table.
public class WeeklySchedule
{
    public int Id { get; set; }

    public int ClassId { get; set; }
    [ForeignKey("ClassId")]
    public Class? Class { get; set; }

    public int AcademicYear { get; set; }

    public string DayOfWeek { get; set; } = ""; // Monday..Friday

    public int SubjectId { get; set; }
    [ForeignKey("SubjectId")]
    public Subject? Subject { get; set; }

    public int TeacherId { get; set; }
    [ForeignKey("TeacherId")]
    public Teacher? Teacher { get; set; }

    public int OrderIndex { get; set; } = 1;
}