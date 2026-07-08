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
public class DonorsController : ControllerBase
{
    private readonly AppDbContext _db;
    public DonorsController(AppDbContext db) { _db = db; }

    // ── GET /api/donors ──────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? status)
    {
        try
        {
            var q = _db.Donors.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                q = q.Where(d => d.Name.Contains(search) || d.Phone.Contains(search));

            if (!string.IsNullOrWhiteSpace(status) && status != "All")
                q = q.Where(d => d.Status == status);

            var donors = await q
                .OrderBy(d => d.Name)
                .Select(d => new {
                    d.Id, d.Name, d.Phone, d.Address,
                    d.NicNumber, d.Status, d.Notes, d.CreatedAt,
                    ScheduleCount = d.Schedules.Count
                })
                .ToListAsync();

            return Ok(donors);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // ── GET /api/donors/{id} ─────────────────────────────────
   [HttpGet("{id:int}")]
public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var donor = await _db.Donors
                .Include(d => d.Schedules)
                    .ThenInclude(s => s.FoodItems)
                .Include(d => d.Schedules)
                    .ThenInclude(s => s.Class1)
                .Include(d => d.Schedules)
                    .ThenInclude(s => s.Class2)
                .Include(d => d.Schedules)
                    .ThenInclude(s => s.Class3)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (donor == null)
                return NotFound(new ResponseDto { Success = false, Message = "Donor not found" });

            return Ok(new {
                donor.Id, donor.Name, donor.Phone, donor.Address,
                donor.NicNumber, donor.Status, donor.Notes, donor.CreatedAt,
                Schedules = donor.Schedules.Select(s => new {
                    s.Id, s.Year, s.Month, s.MealRate, s.Notes,
                    ClassId1 = s.ClassId1,
                    ClassId2 = s.ClassId2,
                    ClassId3 = s.ClassId3,
                    Class1Name = s.Class1 != null ? s.Class1.ClassName + " " + s.Class1.Section : null,
                    Class2Name = s.Class2 != null ? s.Class2.ClassName + " " + s.Class2.Section : null,
                    Class3Name = s.Class3 != null ? s.Class3.ClassName + " " + s.Class3.Section : null,
                    FoodItems = s.FoodItems.Select(f => new { f.Id, f.FoodItem }).ToList()
                }).ToList()
            });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // ── GET /api/donors/year/{year} ──────────────────────────
    // Returns all donors scheduled for a specific year
    [HttpGet("year/{year:int}")]
    public async Task<IActionResult> GetByYear(int year)
    {
        try
        {
            var schedules = await _db.DonorSchedules
                .Include(s => s.Donor)
                .Include(s => s.FoodItems)
                .Include(s => s.Class1)
                .Include(s => s.Class2)
                .Include(s => s.Class3)
                .Where(s => s.Year == year)
                .OrderBy(s => s.Month)
                .Select(s => new {
                    s.Id, s.Year, s.Month, s.MealRate, s.Notes,
                    DonorId   = s.DonorId,
                    DonorName = s.Donor != null ? s.Donor.Name : null,
                    DonorPhone = s.Donor != null ? s.Donor.Phone : null,
                    ClassId1 = s.ClassId1,
                    ClassId2 = s.ClassId2,
                    ClassId3 = s.ClassId3,
                    Class1Name = s.Class1 != null ? s.Class1.ClassName + " " + s.Class1.Section : null,
                    Class2Name = s.Class2 != null ? s.Class2.ClassName + " " + s.Class2.Section : null,
                    Class3Name = s.Class3 != null ? s.Class3.ClassName + " " + s.Class3.Section : null,
                    FoodItems = s.FoodItems.Select(f => f.FoodItem).ToList()
                })
                .ToListAsync();

            return Ok(schedules);
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // ── POST /api/donors ─────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] DonorDto dto)
    {
        try
        {
            var donor = new Donor
            {
                Name      = dto.Name,
                Phone     = dto.Phone     ?? "",
                Address   = dto.Address,
                NicNumber = dto.NicNumber ?? "",
                Status    = dto.Status,
                Notes     = dto.Notes,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            _db.Donors.Add(donor);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Donor created", Data = donor });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // ── PUT /api/donors/{id} ─────────────────────────────────
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] DonorDto dto)
    {
        try
        {
            var donor = await _db.Donors.FindAsync(id);
            if (donor == null)
                return NotFound(new ResponseDto { Success = false, Message = "Donor not found" });

            donor.Name      = dto.Name;
            donor.Phone     = dto.Phone     ?? "";
            donor.Address   = dto.Address;
            donor.NicNumber = dto.NicNumber ?? "";
            donor.Status    = dto.Status;
            donor.Notes     = dto.Notes;
            donor.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Donor updated", Data = donor });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // ── DELETE /api/donors/{id} ──────────────────────────────
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var donor = await _db.Donors.FindAsync(id);
            if (donor == null)
                return NotFound(new ResponseDto { Success = false, Message = "Donor not found" });

            _db.Donors.Remove(donor);   // Cascades to schedules + food items
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Donor deleted" });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // ════════════════════════════════════════════════════════
    //  SCHEDULE ENDPOINTS
    // ════════════════════════════════════════════════════════

    // ── POST /api/donors/schedules ───────────────────────────
    // Assign a donor to a month + classes + food items
    [HttpPost("schedules")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateSchedule([FromBody] DonorScheduleDto dto)
    {
        try
        {
            // Check donor exists
            var donor = await _db.Donors.FindAsync(dto.DonorId);
            if (donor == null)
                return NotFound(new ResponseDto { Success = false, Message = "Donor not found" });

            // Check no duplicate month/year for this donor
            var exists = await _db.DonorSchedules
                .AnyAsync(s => s.DonorId == dto.DonorId && s.Year == dto.Year && s.Month == dto.Month);
            if (exists)
                return BadRequest(new ResponseDto { Success = false, Message = "This donor already has a schedule for that month/year" });

            // Count total months assigned this year — max 3
            var monthCount = await _db.DonorSchedules
                .CountAsync(s => s.DonorId == dto.DonorId && s.Year == dto.Year);
            if (monthCount >= 3)
                return BadRequest(new ResponseDto { Success = false, Message = "Donor already has 3 months assigned for this year (maximum reached)" });

            var schedule = new DonorSchedule
            {
                DonorId  = dto.DonorId,
                Year     = dto.Year,
                Month    = dto.Month,
                ClassId1 = dto.ClassId1,
                ClassId2 = dto.ClassId2,
                ClassId3 = dto.ClassId3,
                MealRate = dto.MealRate,
                Notes    = dto.Notes,
                CreatedAt = DateTime.Now
            };
            _db.DonorSchedules.Add(schedule);
            await _db.SaveChangesAsync();

            // Add food items
            foreach (var item in dto.FoodItems.Where(f => !string.IsNullOrWhiteSpace(f)))
            {
                _db.DonorFoodItems.Add(new DonorFoodItem
                {
                    DonorScheduleId = schedule.Id,
                    FoodItem        = item.Trim()
                });
            }
            await _db.SaveChangesAsync();

            return Ok(new ResponseDto { Success = true, Message = "Schedule created", Data = new { schedule.Id } });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // ── PUT /api/donors/schedules/{id} ───────────────────────
    [HttpPut("schedules/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSchedule(int id, [FromBody] DonorScheduleDto dto)
    {
        try
        {
            var schedule = await _db.DonorSchedules
                .Include(s => s.FoodItems)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (schedule == null)
                return NotFound(new ResponseDto { Success = false, Message = "Schedule not found" });

            schedule.ClassId1 = dto.ClassId1;
            schedule.ClassId2 = dto.ClassId2;
            schedule.ClassId3 = dto.ClassId3;
            schedule.MealRate = dto.MealRate;
            schedule.Notes    = dto.Notes;

            // Replace food items
            _db.DonorFoodItems.RemoveRange(schedule.FoodItems);
            foreach (var item in dto.FoodItems.Where(f => !string.IsNullOrWhiteSpace(f)))
            {
                _db.DonorFoodItems.Add(new DonorFoodItem
                {
                    DonorScheduleId = schedule.Id,
                    FoodItem        = item.Trim()
                });
            }

            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Schedule updated" });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // ── DELETE /api/donors/schedules/{id} ────────────────────
    [HttpDelete("schedules/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSchedule(int id)
    {
        try
        {
            var schedule = await _db.DonorSchedules.FindAsync(id);
            if (schedule == null)
                return NotFound(new ResponseDto { Success = false, Message = "Schedule not found" });

            _db.DonorSchedules.Remove(schedule);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Schedule deleted" });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }
}