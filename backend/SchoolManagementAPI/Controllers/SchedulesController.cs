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
    public SchedulesController(AppDbContext db) { _db = db; }

    private static string FormatTime(TimeSpan? t) =>
        t.HasValue ? t.Value.ToString(@"hh\:mm") : "";

    // GET /api/schedules
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var schedules = await _db.Schedules
                .Include(s => s.Class)
                .Include(s => s.Subject)
                .Include(s => s.Teacher)
                .OrderBy(s => s.Day).ThenBy(s => s.StartTime)
                .Select(s => new {
                    s.Id,
                    s.ClassId,
                    ClassName   = s.Class   != null ? s.Class.ClassName + " " + s.Class.Section : null,
                    s.SubjectId,
                    SubjectName = s.Subject != null ? s.Subject.SubjectName : null,
                    s.TeacherId,
                    TeacherName = s.Teacher != null ? s.Teacher.FullName : null,
                    s.Day,
                    s.StartTime,
                    s.EndTime,
                    s.Room,
                })
                .ToListAsync();

            var result = schedules.Select(s => new {
                s.Id, s.ClassId, s.ClassName,
                s.SubjectId, s.SubjectName,
                s.TeacherId, s.TeacherName,
                s.Day,
                StartTime = s.StartTime.ToString(@"hh\:mm"),
                EndTime   = s.EndTime.ToString(@"hh\:mm"),
                s.Room,
            });

            return Ok(result);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // GET /api/schedules/class/{classId}
    [HttpGet("class/{classId:int}")]
    public async Task<IActionResult> GetByClass(int classId)
    {
        try
        {
            var schedules = await _db.Schedules
                .Include(s => s.Class)
                .Include(s => s.Subject)
                .Include(s => s.Teacher)
                .Where(s => s.ClassId == classId)
                .OrderBy(s => s.Day).ThenBy(s => s.StartTime)
                .Select(s => new {
                    s.Id, s.ClassId,
                    ClassName   = s.Class   != null ? s.Class.ClassName + " " + s.Class.Section : null,
                    s.SubjectId,
                    SubjectName = s.Subject != null ? s.Subject.SubjectName : null,
                    s.TeacherId,
                    TeacherName = s.Teacher != null ? s.Teacher.FullName : null,
                    s.Day, s.StartTime, s.EndTime, s.Room,
                })
                .ToListAsync();

            var result = schedules.Select(s => new {
                s.Id, s.ClassId, s.ClassName,
                s.SubjectId, s.SubjectName,
                s.TeacherId, s.TeacherName,
                s.Day,
                StartTime = s.StartTime.ToString(@"hh\:mm"),
                EndTime   = s.EndTime.ToString(@"hh\:mm"),
                s.Room,
            });

            return Ok(result);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // GET /api/schedules/teacher/{teacherId}
    [HttpGet("teacher/{teacherId:int}")]
    public async Task<IActionResult> GetByTeacher(int teacherId)
    {
        try
        {
            var schedules = await _db.Schedules
                .Include(s => s.Class)
                .Include(s => s.Subject)
                .Include(s => s.Teacher)
                .Where(s => s.TeacherId == teacherId)
                .OrderBy(s => s.Day).ThenBy(s => s.StartTime)
                .Select(s => new {
                    s.Id, s.ClassId,
                    ClassName   = s.Class   != null ? s.Class.ClassName + " " + s.Class.Section : null,
                    s.SubjectId,
                    SubjectName = s.Subject != null ? s.Subject.SubjectName : null,
                    s.TeacherId,
                    TeacherName = s.Teacher != null ? s.Teacher.FullName : null,
                    s.Day, s.StartTime, s.EndTime, s.Room,
                })
                .ToListAsync();

            var result = schedules.Select(s => new {
                s.Id, s.ClassId, s.ClassName,
                s.SubjectId, s.SubjectName,
                s.TeacherId, s.TeacherName,
                s.Day,
                StartTime = s.StartTime.ToString(@"hh\:mm"),
                EndTime   = s.EndTime.ToString(@"hh\:mm"),
                s.Room,
            });

            return Ok(result);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // POST /api/schedules
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] ScheduleDto dto)
    {
        try
        {
            TimeSpan.TryParse(dto.StartTime, out var st);
            TimeSpan.TryParse(dto.EndTime,   out var et);

            var schedule = new Schedule
            {
                ClassId   = dto.ClassId,
                SubjectId = dto.SubjectId,
                TeacherId = dto.TeacherId,
                Day       = dto.Day       ?? "",
                StartTime = st,
                EndTime   = et,
                Room      = dto.Room      ?? "",
            };
            _db.Schedules.Add(schedule);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Schedule created", Data = new { schedule.Id } });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // PUT /api/schedules/{id}
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] ScheduleDto dto)
    {
        try
        {
            var schedule = await _db.Schedules.FindAsync(id);
            if (schedule == null) return NotFound(new ResponseDto { Success = false, Message = "Not found" });

            TimeSpan.TryParse(dto.StartTime, out var st);
            TimeSpan.TryParse(dto.EndTime,   out var et);

            schedule.ClassId   = dto.ClassId;
            schedule.SubjectId = dto.SubjectId;
            schedule.TeacherId = dto.TeacherId;
            schedule.Day       = dto.Day       ?? "";
            schedule.StartTime = st;
            schedule.EndTime   = et;
            schedule.Room      = dto.Room      ?? "";

            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Schedule updated" });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // DELETE /api/schedules/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var schedule = await _db.Schedules.FindAsync(id);
            if (schedule == null) return NotFound(new ResponseDto { Success = false, Message = "Not found" });
            _db.Schedules.Remove(schedule);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Deleted" });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }
}