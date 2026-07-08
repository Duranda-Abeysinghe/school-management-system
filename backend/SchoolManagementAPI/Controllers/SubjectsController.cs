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
public class SubjectsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SubjectsController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var subjects = await _db.Subjects
                .Select(s => new
                {
                    s.Id,
                    s.SubjectName,
                    s.SubjectCode,
                    s.Type,
                    s.TeacherId,
                    TeacherName = s.Teacher != null ? s.Teacher.FullName : ""
                })
                .ToListAsync();
            return Ok(subjects);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto
            {
                Success = false, Message = ex.Message
            });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] Subject subject)
    {
        try
        {
            _db.Subjects.Add(subject);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto
            {
                Success = true, Message = "Subject added", Data = subject
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto
            {
                Success = false, Message = ex.Message
            });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var subject = await _db.Subjects.FindAsync(id);
            if (subject == null) return NotFound();
            _db.Subjects.Remove(subject);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Deleted" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto
            {
                Success = false, Message = ex.Message
            });
        }
    }
}