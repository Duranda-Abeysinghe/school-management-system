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
public class MarksController : ControllerBase
{
    private readonly AppDbContext _db;
    public MarksController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _db.Marks
            .Include(m => m.Student)
            .Include(m => m.Subject)
            .ToListAsync());

    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetByStudent(int studentId)
        => Ok(await _db.Marks
            .Include(m => m.Subject)
            .Where(m => m.StudentId == studentId)
            .ToListAsync());

    // GET /api/marks/count
    [HttpGet("count")]
    public async Task<IActionResult> GetCount()
    {
        try { return Ok(await _db.Marks.CountAsync()); }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    [HttpPost]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> SaveMarks(List<Mark> marks)
    {
        foreach (var mark in marks)
        {
            var existing = await _db.Marks
                .FirstOrDefaultAsync(m =>
                    m.StudentId == mark.StudentId &&
                    m.SubjectId == mark.SubjectId &&
                    m.ExamType  == mark.ExamType);

            if (existing != null)
            {
                existing.Marks = mark.Marks;
                existing.Grade = mark.Grade;
            }
            else
                _db.Marks.Add(mark);
        }
        await _db.SaveChangesAsync();
        return Ok(new ResponseDto { Success = true, Message = "Marks saved" });
    }
}