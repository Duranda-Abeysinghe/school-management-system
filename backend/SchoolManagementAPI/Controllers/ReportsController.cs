using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Teacher")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReportsController(AppDbContext db) { _db = db; }

    // ─────────────────────────────────────────────────────────────────
    // STUDENTS REPORT
    // ─────────────────────────────────────────────────────────────────
    [HttpGet("students")]
    public async Task<IActionResult> GetStudentsReport([FromQuery] int? classId, [FromQuery] int? academicYear)
    {
        try
        {
            var query = _db.Students.Include(s => s.Class).AsQueryable();

            if (classId.HasValue)
                query = query.Where(s => s.ClassId == classId);

            if (academicYear.HasValue)
                query = query.Where(s => s.AcademicYear == academicYear);

            var students = await query.OrderBy(s => s.FullName).ToListAsync();

            var report = new
            {
                totalStudents = students.Count,
                activeStudents = students.Count(s => s.Status == "Active"),
                inactiveStudents = students.Count(s => s.Status == "Inactive"),
                maleCount = students.Count(s => s.Gender == "Male"),
                femaleCount = students.Count(s => s.Gender == "Female"),
                byClass = students
                    .GroupBy(s => s.ClassId)
                    .Select(g => new {
                        classId = g.Key,
                        className = g.FirstOrDefault()?.Class?.ClassName + " " + g.FirstOrDefault()?.Class?.Section,
                        count = g.Count()
                    }),
                students = students.Select(s => new {
                    s.Id, s.AdmissionNo, s.FullName, s.Email, s.Gender,
                    s.Status, s.DateOfBirth, s.ParentName,
                    className = s.Class != null ? s.Class.ClassName + " " + s.Class.Section : null
                })
            };

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // TEACHERS REPORT
    // ─────────────────────────────────────────────────────────────────
    [HttpGet("teachers")]
    public async Task<IActionResult> GetTeachersReport()
    {
        try
        {
            var teachers = await _db.Teachers.OrderBy(t => t.FullName).ToListAsync();

            var report = new
            {
                totalTeachers = teachers.Count,
                activeTeachers = teachers.Count(t => t.Status == "Active"),
                inactiveTeachers = teachers.Count(t => t.Status == "Inactive"),
                bySubject = teachers
                    .GroupBy(t => t.Subject)
                    .Select(g => new {
                        subject = g.Key,
                        count = g.Count()
                    }),
                teachers = teachers.Select(t => new {
                    t.Id, t.FullName, t.Email, t.Phone, t.Gender,
                    t.Subject, t.Status
                })
            };

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // ATTENDANCE REPORT
    // ─────────────────────────────────────────────────────────────────
    [HttpGet("attendance")]
    public async Task<IActionResult> GetAttendanceReport([FromQuery] int? classId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var query = _db.Attendance.Include(a => a.Student).Include(a => a.Class).AsQueryable();

            if (classId.HasValue)
                query = query.Where(a => a.ClassId == classId);

            var start = startDate ?? DateTime.Now.AddMonths(-1);
            var end = endDate ?? DateTime.Now;

            query = query.Where(a => a.Date >= start && a.Date <= end);

            var records = await query.ToListAsync();

            var report = new
            {
                dateRange = new { start = start.ToShortDateString(), end = end.ToShortDateString() },
                totalRecords = records.Count,
                presentCount = records.Count(a => a.Status == "Present"),
                absentCount = records.Count(a => a.Status == "Absent"),
                lateCount = records.Count(a => a.Status == "Late"),
                attendanceRate = records.Count > 0 
                    ? Math.Round((double)records.Count(a => a.Status == "Present") / records.Count * 100, 2) 
                    : 0,
                byClass = records
                    .GroupBy(a => a.ClassId)
                    .Select(g => new {
                        classId = g.Key,
                        className = g.FirstOrDefault()?.Class?.ClassName + " " + g.FirstOrDefault()?.Class?.Section,
                        present = g.Count(a => a.Status == "Present"),
                        absent = g.Count(a => a.Status == "Absent"),
                        late = g.Count(a => a.Status == "Late")
                    }),
                records = records
                    .GroupBy(a => a.StudentId)
                    .Select(g => new {
                        studentId = g.Key,
                        studentName = g.FirstOrDefault()?.Student?.FullName,
                        present = g.Count(a => a.Status == "Present"),
                        absent = g.Count(a => a.Status == "Absent"),
                        late = g.Count(a => a.Status == "Late"),
                        attendancePercentage = g.Count() > 0 
                            ? Math.Round((double)g.Count(a => a.Status == "Present") / g.Count() * 100, 2)
                            : 0
                    })
            };

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // MARKS REPORT
    // ─────────────────────────────────────────────────────────────────
    [HttpGet("marks")]
    public async Task<IActionResult> GetMarksReport([FromQuery] int? classId, [FromQuery] int? academicYear)
    {
        try
        {
            var marks = await _db.Marks
                .Include(m => m.Student)
                .Include(m => m.Subject)
                .Where(m => true)
                .ToListAsync();

            var students = await _db.Students
                .Where(s => classId == null || s.ClassId == classId)
                .Where(s => academicYear == null || s.AcademicYear == academicYear)
                .ToListAsync();

            var report = new
            {
                totalMarksRecords = marks.Count,
                averageMarks = marks.Count > 0 ? Math.Round(marks.Average(m => m.Marks), 2) : 0,
                highestMarks = marks.Count > 0 ? marks.Max(m => m.Marks) : 0,
                lowestMarks = marks.Count > 0 ? marks.Min(m => m.Marks) : 0,
                gradeDistribution = marks
                    .GroupBy(m => m.Grade)
                    .Select(g => new {
                        grade = g.Key,
                        count = g.Count(),
                        percentage = Math.Round((double)g.Count() / marks.Count * 100, 2)
                    }),
                bySubject = marks
                    .GroupBy(m => m.Subject?.SubjectName)
                    .Select(g => new {
                        subject = g.Key,
                        count = g.Count(),
                        average = Math.Round(g.Average(m => m.Marks), 2)
                    }),
                studentMarks = marks
                    .GroupBy(m => m.StudentId)
                    .Select(g => new {
                        studentId = g.Key,
                        studentName = g.FirstOrDefault()?.Student?.FullName,
                        marksCount = g.Count(),
                        average = Math.Round(g.Average(m => m.Marks), 2),
                        highestGrade = g.OrderByDescending(m => m.Marks).FirstOrDefault()?.Grade
                    })
            };

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // CLASS STATISTICS REPORT
    // ─────────────────────────────────────────────────────────────────
    [HttpGet("class-statistics")]
    public async Task<IActionResult> GetClassStatisticsReport()
    {
        try
        {
            var classes = await _db.Classes
                .Include(c => c.Teacher)
                .ToListAsync();

            var report = classes.Select(c => new
            {
                classId = c.Id,
                className = c.ClassName + " " + c.Section,
                teacherName = c.Teacher?.FullName,
                totalStudents = _db.Students.Count(s => s.ClassId == c.Id),
                activeStudents = _db.Students.Count(s => s.ClassId == c.Id && s.Status == "Active"),
                inactiveStudents = _db.Students.Count(s => s.ClassId == c.Id && s.Status == "Inactive")
            }).OrderBy(x => x.className).ToList();

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // OVERALL STATISTICS
    // ─────────────────────────────────────────────────────────────────
    [HttpGet("overall-statistics")]
    public async Task<IActionResult> GetOverallStatistics()
    {
        try
        {
            var report = new
            {
                totalStudents = await _db.Students.CountAsync(),
                totalTeachers = await _db.Teachers.CountAsync(),
                totalClasses = await _db.Classes.CountAsync(),
                totalSubjects = await _db.Subjects.CountAsync(),
                totalAttendanceRecords = await _db.Attendance.CountAsync(),
                totalMarksRecords = await _db.Marks.CountAsync(),
                activeStudents = await _db.Students.CountAsync(s => s.Status == "Active"),
                activeTeachers = await _db.Teachers.CountAsync(t => t.Status == "Active"),
                pendingRequests = await _db.Requests.CountAsync(r => r.Status == "Pending"),
                totalAnnouncements = await _db.Announcements.CountAsync()
            };

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }
}
