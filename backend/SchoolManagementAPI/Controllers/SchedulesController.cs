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
public class SchedulesController : ControllerBase
{
    private readonly AppDbContext _db;
    private static readonly string[] DayOrder =
        { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };

    public SchedulesController(AppDbContext db) { _db = db; }

    private static object Shape(Schedule s) => new
    {
        s.Id, s.ClassId, s.SubjectId, s.TeacherId,
        s.Day,
        StartTime = s.StartTime.ToString(@"hh\:mm"),
        EndTime   = s.EndTime.ToString(@"hh\:mm"),
        s.Room,
        ClassName   = s.Class != null ? s.Class.ClassName + " " + s.Class.Section : null,
        SubjectName = s.Subject != null ? s.Subject.SubjectName : null,
        TeacherName = s.Teacher != null ? s.Teacher.FullName : null
    };

    // GET /api/schedules  -> full list for Admin management page
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var list = await _db.Schedules
                .Include(s => s.Class).Include(s => s.Subject).Include(s => s.Teacher)
                .ToListAsync();

            var ordered = list
                .OrderBy(s => Array.IndexOf(DayOrder, s.Day))
                .ThenBy(s => s.StartTime)
                .Select(Shape);

            return Ok(ordered);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // GET /api/schedules/teacher/5  -> used by Teacher "My Schedule" page
    [HttpGet("teacher/{teacherId}")]
    public async Task<IActionResult> GetByTeacher(int teacherId)
    {
        try
        {
            var list = await _db.Schedules
                .Include(s => s.Class).Include(s => s.Subject).Include(s => s.Teacher)
                .Where(s => s.TeacherId == teacherId)
                .ToListAsync();

            var ordered = list
                .OrderBy(s => Array.IndexOf(DayOrder, s.Day))
                .ThenBy(s => s.StartTime)
                .Select(Shape);

            return Ok(ordered);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // GET /api/schedules/class/3  -> used by Student "Class Schedule" page
    [HttpGet("class/{classId}")]
    public async Task<IActionResult> GetByClass(int classId)
    {
        try
        {
            var list = await _db.Schedules
                .Include(s => s.Class).Include(s => s.Subject).Include(s => s.Teacher)
                .Where(s => s.ClassId == classId)
                .ToListAsync();

            var ordered = list
                .OrderBy(s => Array.IndexOf(DayOrder, s.Day))
                .ThenBy(s => s.StartTime)
                .Select(Shape);

            return Ok(ordered);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] ScheduleDto dto)
    {
        try
        {
            var entry = new Schedule
            {
                ClassId   = dto.ClassId,
                SubjectId = dto.SubjectId,
                TeacherId = dto.TeacherId,
                Day       = dto.Day,
                StartTime = TimeSpan.Parse(dto.StartTime),
                EndTime   = TimeSpan.Parse(dto.EndTime),
                Room      = dto.Room
            };
            _db.Schedules.Add(entry);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Created", Data = entry });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] ScheduleDto dto)
    {
        var entry = await _db.Schedules.FindAsync(id);
        if (entry == null) return NotFound(new ResponseDto { Success = false, Message = "Not found" });

        entry.ClassId   = dto.ClassId;
        entry.SubjectId = dto.SubjectId;
        entry.TeacherId = dto.TeacherId;
        entry.Day       = dto.Day;
        entry.StartTime = TimeSpan.Parse(dto.StartTime);
        entry.EndTime   = TimeSpan.Parse(dto.EndTime);
        entry.Room      = dto.Room;

        await _db.SaveChangesAsync();
        return Ok(new ResponseDto { Success = true, Message = "Updated" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var entry = await _db.Schedules.FindAsync(id);
        if (entry == null) return NotFound(new ResponseDto { Success = false, Message = "Not found" });
        _db.Schedules.Remove(entry);
        await _db.SaveChangesAsync();
        return Ok(new ResponseDto { Success = true, Message = "Deleted" });
    }
}