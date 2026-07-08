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
public class ClassesController : ControllerBase
{
    private readonly AppDbContext _db;
    public ClassesController(AppDbContext db) { _db = db; }

    // GET /api/classes  ← used by Add Student form dropdown
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var classes = await _db.Classes
                .Include(c => c.Teacher)
                .OrderBy(c => c.ClassName).ThenBy(c => c.Section)
                .Select(c => new {
                    c.Id, c.ClassName, c.Section,
                    DisplayName  = c.ClassName + " " + c.Section,
                    c.TeacherId,
                    TeacherName  = c.Teacher != null ? c.Teacher.FullName : null,
                    StudentCount = _db.Students.Count(s => s.ClassId == c.Id && s.Status == "Active")
                }).ToListAsync();
            return Ok(classes);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var c = await _db.Classes.Include(c => c.Teacher).FirstOrDefaultAsync(c => c.Id == id);
        if (c == null) return NotFound(new ResponseDto { Success = false, Message = "Not found" });
        return Ok(new {
            c.Id, c.ClassName, c.Section,
            DisplayName = c.ClassName + " " + c.Section,
            c.TeacherId, TeacherName = c.Teacher?.FullName
        });
    }

    // GET /api/classes/count
    [HttpGet("count")]
    public async Task<IActionResult> GetCount()
    {
        try { return Ok(await _db.Classes.CountAsync()); }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] ClassDto dto)
    {
        try
        {
            var cls = new Class { ClassName = dto.ClassName, Section = dto.Section, TeacherId = dto.TeacherId };
            _db.Classes.Add(cls);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Created", Data = cls });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] ClassDto dto)
    {
        var cls = await _db.Classes.FindAsync(id);
        if (cls == null) return NotFound(new ResponseDto { Success = false, Message = "Not found" });
        cls.ClassName = dto.ClassName; cls.Section = dto.Section; cls.TeacherId = dto.TeacherId;
        await _db.SaveChangesAsync();
        return Ok(new ResponseDto { Success = true, Message = "Updated" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var cls = await _db.Classes.FindAsync(id);
        if (cls == null) return NotFound(new ResponseDto { Success = false, Message = "Not found" });
        _db.Classes.Remove(cls);
        await _db.SaveChangesAsync();
        return Ok(new ResponseDto { Success = true, Message = "Deleted" });
    }
}