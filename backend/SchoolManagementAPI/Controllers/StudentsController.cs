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
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public StudentsController(AppDbContext db) { _db = db; }

    // GET /api/students
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int?    classId,
        [FromQuery] int?    academicYear)
    {
        try
        {
            var q = _db.Students.Include(s => s.Class).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                q = q.Where(s => s.FullName.Contains(search)
                              || (s.AdmissionNo != null && s.AdmissionNo.Contains(search))
                              || s.Email.Contains(search));

            if (!string.IsNullOrWhiteSpace(status) && status != "All")
                q = q.Where(s => s.Status == status);

            if (classId.HasValue)
                q = q.Where(s => s.ClassId == classId);

            if (academicYear.HasValue)
                q = q.Where(s => s.AcademicYear == academicYear);

            var students = await q
                .OrderByDescending(s => s.JoinDate)
                .Select(s => new {
                    s.Id, s.AdmissionNo, s.FullName, s.Email,
                    s.Phone, s.Gender, s.Status, s.ClassId,
                    s.UserId, s.JoinDate, s.AcademicYear,
                    ClassName = s.Class != null ? s.Class.ClassName + " " + s.Class.Section : null
                })
                .ToListAsync();

            return Ok(students);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // GET /api/students/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var s = await _db.Students.Include(s => s.Class)
                             .FirstOrDefaultAsync(s => s.Id == id);
            if (s == null)
                return NotFound(new ResponseDto { Success = false, Message = "Not found" });

            return Ok(new {
                s.Id, s.AdmissionNo, s.FullName, s.Email,
                s.Phone, s.Gender, s.DateOfBirth, s.Address,
                s.ParentName, s.ParentContact, s.Status,
                s.ClassId, s.UserId, s.JoinDate, s.AcademicYear,
                ClassName = s.Class != null ? s.Class.ClassName + " " + s.Class.Section : null
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // GET /api/students/count
    [HttpGet("count")]
    public async Task<IActionResult> GetCount()
    {
        try { return Ok(await _db.Students.CountAsync()); }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // GET /api/students/academic-years
    [HttpGet("academic-years")]
    public async Task<IActionResult> GetAcademicYears()
    {
        try
        {
            var years = await _db.Students
                .Where(s => s.AcademicYear != null)
                .Select(s => s.AcademicYear)
                .Distinct()
                .OrderByDescending(y => y)
                .ToListAsync();
            return Ok(years);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // POST /api/students/with-account  ← called by Add Student form
    [HttpPost("with-account")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateWithAccount([FromBody] StudentWithAccountDto dto)
    {
        using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            // 1. Check email is not already taken
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new ResponseDto { Success = false, Message = "Email already exists" });

            // 2. Create login account in Users table (password is BCrypt hashed here)
            var user = new User
            {
                Name     = dto.FullName,
                Email    = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role     = "Student"
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // 3. Generate admission number: S{YEAR}{sequence}
            var year    = dto.AcademicYear ?? DateTime.Now.Year;
            var count   = await _db.Students.CountAsync(s => s.AcademicYear == year);
            var admNo   = $"S{year}{(count + 1):D3}";

            // 4. Create student record linked to the user
            var student = new Student
            {
                AdmissionNo   = admNo,
                FullName      = dto.FullName,
                Email         = dto.Email,
                Phone         = dto.Phone         ?? "",
                Gender        = dto.Gender        ?? "",
                DateOfBirth   = dto.DateOfBirth,
                Address       = dto.Address       ?? "",
                ParentName    = dto.ParentName    ?? "",
                ParentContact = dto.ParentContact ?? "",
                Status        = "Active",
                ClassId       = dto.ClassId,
                UserId        = user.Id,          // ← links to login account
                JoinDate      = DateTime.Now,
                AcademicYear  = year
            };
            _db.Students.Add(student);
            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(new ResponseDto
            {
                Success = true,
                Message = "Student account created successfully",
                Data    = new {
                    student.Id, student.AdmissionNo,
                    student.FullName, student.Email,
                    UserId = user.Id
                }
            });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // PUT /api/students/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] StudentUpdateDto dto)
    {
        try
        {
            var student = await _db.Students.FindAsync(id);
            if (student == null)
                return NotFound(new ResponseDto { Success = false, Message = "Not found" });

            student.FullName      = dto.FullName;
            student.Email         = dto.Email;
            student.Phone         = dto.Phone         ?? "";
            student.Gender        = dto.Gender        ?? "";
            student.Address       = dto.Address       ?? "";
            student.ParentName    = dto.ParentName    ?? "";
            student.ParentContact = dto.ParentContact ?? "";
            student.Status        = dto.Status;
            student.ClassId       = dto.ClassId;
            student.AcademicYear  = dto.AcademicYear;

            // Keep Users table in sync
            if (student.UserId.HasValue)
            {
                var user = await _db.Users.FindAsync(student.UserId.Value);
                if (user != null) { user.Name = dto.FullName; user.Email = dto.Email; }
            }

            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Updated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // DELETE /api/students/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var student = await _db.Students.FindAsync(id);
            if (student == null)
                return NotFound(new ResponseDto { Success = false, Message = "Not found" });

            // Remove linked login account too
            if (student.UserId.HasValue)
            {
                var user = await _db.Users.FindAsync(student.UserId.Value);
                if (user != null) _db.Users.Remove(user);
            }

            _db.Students.Remove(student);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Deleted" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }
}