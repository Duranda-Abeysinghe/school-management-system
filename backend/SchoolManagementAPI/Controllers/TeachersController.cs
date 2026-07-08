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
public class TeachersController : ControllerBase
{
    private readonly AppDbContext _db;
    public TeachersController(AppDbContext db) { _db = db; }

    // GET /api/teachers
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? subject)
    {
        try
        {
            var q = _db.Teachers.AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
                q = q.Where(t => t.FullName.Contains(search) || t.Email.Contains(search)
                              || (t.Subject != null && t.Subject.Contains(search)));
            if (!string.IsNullOrWhiteSpace(status) && status != "All")
                q = q.Where(t => t.Status == status);
            if (!string.IsNullOrWhiteSpace(subject))
                q = q.Where(t => t.Subject == subject);

            var list = await q.OrderBy(t => t.FullName)
                .Select(t => new {
                    t.Id, t.FullName, t.Email,
                    Phone   = t.Phone   ?? "",
                    Gender  = t.Gender  ?? "",
                    Subject = t.Subject ?? "",
                    Address = t.Address ?? "",
                    t.Status, t.UserId
                }).ToListAsync();
            return Ok(list);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // GET /api/teachers/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var t = await _db.Teachers.FindAsync(id);
        if (t == null) return NotFound(new ResponseDto { Success = false, Message = "Not found" });
        return Ok(t);
    }

    // GET /api/teachers/count
    [HttpGet("count")]
    public async Task<IActionResult> GetCount()
    {
        try { return Ok(await _db.Teachers.CountAsync()); }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // GET /api/teachers/subjects
    [HttpGet("subjects")]
    public async Task<IActionResult> GetSubjects()
    {
        try
        {
            var s = await _db.Teachers.Where(t => t.Subject != null)
                .Select(t => t.Subject!).Distinct().OrderBy(x => x).ToListAsync();
            return Ok(s);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // POST /api/teachers/with-account  ← called by Add Teacher form
    [HttpPost("with-account")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateWithAccount([FromBody] TeacherWithAccountDto dto)
    {
        using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new ResponseDto { Success = false, Message = "Email already exists" });

            // 1. Save to Users table (hashed password)
            var user = new User
            {
                Name     = dto.FullName,
                Email    = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role     = "Teacher"
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // 2. Save to Teachers table linked to user
            var teacher = new Teacher
            {
                FullName = dto.FullName, Email = dto.Email,
                Phone    = dto.Phone    ?? "", Gender  = dto.Gender  ?? "",
                Subject  = dto.Subject  ?? "", Address = dto.Address ?? "",
                Status   = dto.Status,         UserId  = user.Id
            };
            _db.Teachers.Add(teacher);
            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(new ResponseDto {
                Success = true, Message = "Teacher account created",
                Data = new { teacher.Id, teacher.FullName, teacher.Email, UserId = user.Id }
            });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // PUT /api/teachers/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] TeacherUpdateDto dto)
    {
        try
        {
            var teacher = await _db.Teachers.FindAsync(id);
            if (teacher == null) return NotFound(new ResponseDto { Success = false, Message = "Not found" });

            teacher.FullName = dto.FullName; teacher.Email   = dto.Email;
            teacher.Phone    = dto.Phone ?? ""; teacher.Gender  = dto.Gender  ?? "";
            teacher.Subject  = dto.Subject ?? ""; teacher.Address = dto.Address ?? "";
            teacher.Status   = dto.Status;

            if (teacher.UserId.HasValue)
            {
                var user = await _db.Users.FindAsync(teacher.UserId.Value);
                if (user != null) { user.Name = dto.FullName; user.Email = dto.Email; }
            }
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Updated" });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // DELETE /api/teachers/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var teacher = await _db.Teachers.FindAsync(id);
            if (teacher == null) return NotFound(new ResponseDto { Success = false, Message = "Not found" });

            if (teacher.UserId.HasValue)
            {
                var user = await _db.Users.FindAsync(teacher.UserId.Value);
                if (user != null) _db.Users.Remove(user);
            }
            _db.Teachers.Remove(teacher);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Deleted" });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }
}