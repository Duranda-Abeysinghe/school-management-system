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
public class AttendanceController : ControllerBase
{
    private readonly AppDbContext _db;
    public AttendanceController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _db.Attendance
            .Include(a => a.Student)
            .ToListAsync());

    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetByStudent(int studentId)
        => Ok(await _db.Attendance
            .Where(a => a.StudentId == studentId)
            .ToListAsync());

    [HttpPost]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> SaveAttendance(List<Attendance> records)
    {
        foreach (var record in records)
        {
            var existing = await _db.Attendance
                .FirstOrDefaultAsync(a =>
                    a.StudentId == record.StudentId &&
                    a.Date.Date == record.Date.Date &&
                    a.ClassId   == record.ClassId);

            if (existing != null)
                existing.Status = record.Status;
            else
                _db.Attendance.Add(record);
        }
        await _db.SaveChangesAsync();
        return Ok(new ResponseDto { Success = true, Message = "Attendance saved" });
    }
}