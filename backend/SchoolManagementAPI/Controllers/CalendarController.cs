using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;
using SchoolManagementAPI.DTOs;
using SchoolManagementAPI.Models;
using SchoolManagementAPI.Services;

namespace SchoolManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CalendarController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SchoolCalendarService _calendar;

    public CalendarController(AppDbContext db, SchoolCalendarService calendar)
    {
        _db = db;
        _calendar = calendar;
    }

    // GET /api/calendar/month/2026/7
    [HttpGet("month/{year}/{month}")]
    public async Task<IActionResult> GetMonth(int year, int month)
    {
        var start = new DateTime(year, month, 1);
        var end = start.AddMonths(1).AddDays(-1);
        var map = await _calendar.GetSchoolDayMapAsync(start, end);

        var overrides = await _db.SchoolCalendarOverrides
            .Where(o => o.OverrideDate >= start && o.OverrideDate <= end)
            .ToListAsync();

        var days = map.Select(kv => new
        {
            date = kv.Key.ToString("yyyy-MM-dd"),
            isSchoolDay = kv.Value,
            reason = overrides.FirstOrDefault(o => o.OverrideDate.Date == kv.Key)?.Reason
        }).OrderBy(d => d.date);

        return Ok(days);
    }

    public class OverrideDto
    {
        public string Date { get; set; } = string.Empty;
        public bool IsSchoolDay { get; set; }
        public string? Reason { get; set; }
    }

    public class OverrideRangeDto
    {
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public bool IsSchoolDay { get; set; }
        public string? Reason { get; set; }
    }

    // POST single date
    [HttpPost("override")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetOverride([FromBody] OverrideDto dto)
    {
        var date = DateTime.Parse(dto.Date).Date;
        var existing = await _db.SchoolCalendarOverrides.FirstOrDefaultAsync(o => o.OverrideDate == date);

        if (existing != null)
        {
            existing.IsSchoolDay = dto.IsSchoolDay;
            existing.Reason = dto.Reason;
        }
        else
        {
            _db.SchoolCalendarOverrides.Add(new SchoolCalendarOverride
            {
                OverrideDate = date,
                IsSchoolDay = dto.IsSchoolDay,
                Reason = dto.Reason
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new ResponseDto { Success = true, Message = "Calendar updated" });
    }

    // POST a whole range (e.g. mark a weekend program, or a holiday week)
    [HttpPost("override-range")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetOverrideRange([FromBody] OverrideRangeDto dto)
    {
        var start = DateTime.Parse(dto.StartDate).Date;
        var end = DateTime.Parse(dto.EndDate).Date;
        if (end < start) return BadRequest(new ResponseDto { Success = false, Message = "End date is before start date" });

        for (var d = start; d <= end; d = d.AddDays(1))
        {
            var existing = await _db.SchoolCalendarOverrides.FirstOrDefaultAsync(o => o.OverrideDate == d);
            if (existing != null)
            {
                existing.IsSchoolDay = dto.IsSchoolDay;
                existing.Reason = dto.Reason;
            }
            else
            {
                _db.SchoolCalendarOverrides.Add(new SchoolCalendarOverride
                {
                    OverrideDate = d,
                    IsSchoolDay = dto.IsSchoolDay,
                    Reason = dto.Reason
                });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new ResponseDto { Success = true, Message = $"Marked {(end - start).Days + 1} day(s)" });
    }

    // DELETE — revert a date back to the default weekday/weekend rule
    [HttpDelete("override/{date}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveOverride(string date)
    {
        var d = DateTime.Parse(date).Date;
        var existing = await _db.SchoolCalendarOverrides.FirstOrDefaultAsync(o => o.OverrideDate == d);
        if (existing == null) return NotFound(new ResponseDto { Success = false, Message = "No override on this date" });

        _db.SchoolCalendarOverrides.Remove(existing);
        await _db.SaveChangesAsync();
        return Ok(new ResponseDto { Success = true, Message = "Reverted to default" });
    }
}