namespace SchoolManagementAPI.DTOs;

public class ClassSummaryDto
{
    public int Id { get; set; }
    public int Grade { get; set; }
    public string Section { get; set; } = "";
    public string DisplayName => $"Grade {Grade} {Section}";
    public int? ClassTeacherId { get; set; }
    public string? ClassTeacherName { get; set; }
    public string SessionStart { get; set; } = "07:30";
    public string SessionEnd { get; set; } = "";
    public string IntervalTime { get; set; } = "10:30";
}

public class SubjectSummaryDto
{
    public int Id { get; set; }
    public string SubjectName { get; set; } = "";
    public string? NameSinhala { get; set; }
}

public class AssignClassTeacherDto
{
    public int ClassId { get; set; }
    public int TeacherId { get; set; }
    public int AcademicYear { get; set; }
}

public class WeeklyScheduleEntryDto
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public int AcademicYear { get; set; }
    public string DayOfWeek { get; set; } = "";
    public int SubjectId { get; set; }
    public string SubjectName { get; set; } = "";
    public int TeacherId { get; set; }
    public string TeacherName { get; set; } = "";
    public int OrderIndex { get; set; } = 1;
}

// Replaces the full weekly timetable for one class/year in one call.
// TeacherId is optional per row — leave null to default to the class
// teacher; only set it explicitly for the Grade 5 English exception.
public class SaveTimetableDto
{
    public int ClassId { get; set; }
    public int AcademicYear { get; set; }
    public List<TimetableRowDto> Entries { get; set; } = new();
}

public class TimetableRowDto
{
    public string DayOfWeek { get; set; } = "";
    public int SubjectId { get; set; }
    public int? TeacherId { get; set; }
    public int OrderIndex { get; set; } = 1;
}