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
public class AnnouncementsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AnnouncementsController(AppDbContext db) { _db = db; }

    // GET /api/announcements
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var announcements = await _db.Announcements
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
            return Ok(announcements);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // GET /api/announcements/{id}
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var announcement = await _db.Announcements.FindAsync(id);
            if (announcement == null)
                return NotFound(new ResponseDto { Success = false, Message = "Not found" });
            return Ok(announcement);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // GET /api/announcements/count
    [HttpGet("count")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCount()
    {
        try
        {
            return Ok(await _db.Announcements.CountAsync());
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // POST /api/announcements
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] Announcement announcement)
    {
        try
        {
            _db.Announcements.Add(announcement);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Announcement created", Data = announcement });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // PUT /api/announcements/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] Announcement dto)
    {
        try
        {
            var announcement = await _db.Announcements.FindAsync(id);
            if (announcement == null)
                return NotFound(new ResponseDto { Success = false, Message = "Not found" });

            announcement.Title    = dto.Title;
            announcement.Message  = dto.Message;
            announcement.Target   = dto.Target;
            announcement.Priority = dto.Priority;

            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Updated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // DELETE /api/announcements/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var announcement = await _db.Announcements.FindAsync(id);
            if (announcement == null)
                return NotFound(new ResponseDto { Success = false, Message = "Not found" });

            _db.Announcements.Remove(announcement);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Deleted" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // DELETE /api/announcements/cleanup/old-announcements
    // Automatically deletes announcements older than 30 days
    [HttpDelete("cleanup/old-announcements")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteOldAnnouncements([FromQuery] int daysOld = 30)
    {
        try
        {
            var cutoffDate = DateTime.Now.AddDays(-daysOld);
            var oldAnnouncements = await _db.Announcements
                .Where(a => a.CreatedAt < cutoffDate)
                .ToListAsync();

            if (oldAnnouncements.Count == 0)
                return Ok(new ResponseDto { Success = true, Message = "No old announcements to delete" });

            _db.Announcements.RemoveRange(oldAnnouncements);
            await _db.SaveChangesAsync();

            return Ok(new ResponseDto 
            { 
                Success = true, 
                Message = $"Deleted {oldAnnouncements.Count} announcements older than {daysOld} days" 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }

    // GET /api/announcements/active
    // Get only active (recent) announcements within last 30 days
    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActiveAnnouncements([FromQuery] int daysOld = 30)
    {
        try
        {
            var cutoffDate = DateTime.Now.AddDays(-daysOld);
            var announcements = await _db.Announcements
                .Where(a => a.CreatedAt >= cutoffDate)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
            return Ok(announcements);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }
}
