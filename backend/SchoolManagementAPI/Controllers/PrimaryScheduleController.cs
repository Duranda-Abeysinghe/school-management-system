using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PrimaryScheduleController : ControllerBase
{
    private readonly AppDbContext _db;
    public PrimaryScheduleController(AppDbContext db) { _db = db; }

    private static readonly string[] Days =
        { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" };

    private static (string start, string end, string interval) SessionTimes(int grade) => grade switch
    {
        1 or 2 => ("07:30", "11:30", "10:30"),
        3 or 4 => ("07:30", "13:00", "10:30"),
        5      => ("07:30", "13:30", "10:30"),
        _      => ("07:30", "13:00", "10:30")
    };

    // GET /api/primaryschedule/classes?year=2026
    [HttpGet("classes")]
    public async Task<IActionResult> GetClasses([FromQuery] int year)
    {
        try
        {
            if (year == 0) year = DateTime.UtcNow.Year;

            var classes = await _db.Classes
                .Where(c => c.Grade != null)
                .OrderBy(c => c.Grade).ThenBy(c => c.Section)
                .ToListAsync();

            var assignments = await _db.Set<ClassTeacherAssignment>()
                .Where(a => a.AcademicYear == year)
                .Include(a => a.Teacher)
                .ToListAsync();

            var result = classes.Select(c =>
            {
                var (start, end, interval) = SessionTimes(c.Grade!.Value);
                var assignment = assignments.FirstOrDefault(a => a.ClassId == c.Id);
                return new ClassSummaryDto
                {
                    Id = c.Id,
                    Grade = c.Grade!.Value,
                    Section = c.Section,
                    ClassTeacherId = assignment?.TeacherId,
                    ClassTeacherName = assignment?.Teacher?.FullName,
                    SessionStart = start,
                    SessionEnd = end,
                    IntervalTime = interval
                };
            });

            return Ok(result);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // GET /api/primaryschedule/subjects
    [HttpGet("subjects")]
    public async Task<IActionResult> GetSubjects()
    {
        try
        {
            var subjects = await _db.Subjects
                .Where(s => s.NameSinhala != null) // only the 6 primary-school subjects have this set
                .Select(s => new SubjectSummaryDto { Id = s.Id, SubjectName = s.SubjectName, NameSinhala = s.NameSinhala })
                .ToListAsync();
            return Ok(subjects);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // GET /api/primaryschedule/academic-years
    [HttpGet("academic-years")]
    public async Task<IActionResult> GetAcademicYears()
    {
        try
        {
            var fromAssignments = await _db.Set<ClassTeacherAssignment>().Select(a => a.AcademicYear).Distinct().ToListAsync();
            var fromSchedules = await _db.Set<WeeklySchedule>().Select(w => w.AcademicYear).Distinct().ToListAsync();
            var currentYear = DateTime.UtcNow.Year;

            var years = fromAssignments.Union(fromSchedules).Union(new[] { currentYear })
                .OrderByDescending(y => y)
                .ToList();

            return Ok(years);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // POST /api/primaryschedule/class-teacher
    [HttpPost("class-teacher")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignClassTeacher([FromBody] AssignClassTeacherDto dto)
    {
        try
        {
            var cls = await _db.Classes.FindAsync(dto.ClassId);
            if (cls == null) return NotFound(new ResponseDto { Success = false, Message = "Class not found." });

            var teacherExists = await _db.Teachers.AnyAsync(t => t.Id == dto.TeacherId);
            if (!teacherExists) return NotFound(new ResponseDto { Success = false, Message = "Teacher not found." });

            var existing = await _db.Set<ClassTeacherAssignment>()
                .FirstOrDefaultAsync(a => a.ClassId == dto.ClassId && a.AcademicYear == dto.AcademicYear);

            if (existing != null)
            {
                existing.TeacherId = dto.TeacherId;
            }
            else
            {
                _db.Set<ClassTeacherAssignment>().Add(new ClassTeacherAssignment
                {
                    ClassId = dto.ClassId,
                    TeacherId = dto.TeacherId,
                    AcademicYear = dto.AcademicYear
                });
            }

            // Keep Class.TeacherId (the "current" shortcut field used elsewhere
            // in the app, e.g. the existing Schedule Management page) in sync
            // when assigning the current calendar year.
            if (dto.AcademicYear == DateTime.UtcNow.Year)
            {
                cls.TeacherId = dto.TeacherId;
            }

            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Class teacher assigned." });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // GET /api/primaryschedule/timetable?classId=3&year=2026
    [HttpGet("timetable")]
    public async Task<IActionResult> GetTimetable([FromQuery] int classId, [FromQuery] int year)
    {
        try
        {
            var entries = await _db.Set<WeeklySchedule>()
                .Where(w => w.ClassId == classId && w.AcademicYear == year)
                .Include(w => w.Subject)
                .Include(w => w.Teacher)
                .OrderBy(w => w.DayOfWeek).ThenBy(w => w.OrderIndex)
                .Select(w => new WeeklyScheduleEntryDto
                {
                    Id = w.Id,
                    ClassId = w.ClassId,
                    AcademicYear = w.AcademicYear,
                    DayOfWeek = w.DayOfWeek,
                    SubjectId = w.SubjectId,
                    SubjectName = w.Subject!.SubjectName,
                    TeacherId = w.TeacherId,
                    TeacherName = w.Teacher!.FullName,
                    OrderIndex = w.OrderIndex
                })
                .ToListAsync();

            return Ok(entries);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // POST /api/primaryschedule/timetable
    [HttpPost("timetable")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SaveTimetable([FromBody] SaveTimetableDto dto)
    {
        try
        {
            var invalidDay = dto.Entries.FirstOrDefault(e => !Days.Contains(e.DayOfWeek));
            if (invalidDay != null)
                return BadRequest(new ResponseDto { Success = false, Message = $"Invalid day: {invalidDay.DayOfWeek}" });

            var classTeacher = await _db.Set<ClassTeacherAssignment>()
                .FirstOrDefaultAsync(a => a.ClassId == dto.ClassId && a.AcademicYear == dto.AcademicYear);

            if (classTeacher == null)
                return BadRequest(new ResponseDto { Success = false, Message = "Assign a class teacher for this year before building the timetable." });

            var existing = _db.Set<WeeklySchedule>()
                .Where(w => w.ClassId == dto.ClassId && w.AcademicYear == dto.AcademicYear);
            _db.Set<WeeklySchedule>().RemoveRange(existing);

            foreach (var row in dto.Entries)
            {
                _db.Set<WeeklySchedule>().Add(new WeeklySchedule
                {
                    ClassId = dto.ClassId,
                    AcademicYear = dto.AcademicYear,
                    DayOfWeek = row.DayOfWeek,
                    SubjectId = row.SubjectId,
                    TeacherId = row.TeacherId ?? classTeacher.TeacherId,
                    OrderIndex = row.OrderIndex
                });
            }

            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Timetable saved." });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }
}