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
public class RequestsController : ControllerBase
{
    private readonly AppDbContext _db;
    public RequestsController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _db.Requests
            .Include(r => r.Student)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync());

    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetByStudent(int studentId)
        => Ok(await _db.Requests
            .Where(r => r.StudentId == studentId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync());

    [HttpPost]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Create(Request request)
    {
        _db.Requests.Add(request);
        await _db.SaveChangesAsync();
        return Ok(new ResponseDto { Success = true, Message = "Submitted", Data = request });
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var request = await _db.Requests.FindAsync(id);
        if (request == null) return NotFound();
        request.Status = status;
        await _db.SaveChangesAsync();
        return Ok(new ResponseDto { Success = true, Message = "Status updated" });
    }
}