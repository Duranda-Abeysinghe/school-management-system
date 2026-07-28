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
public class DonorsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SchoolCalendarService _calendar;

    public DonorsController(AppDbContext db, SchoolCalendarService calendar)
    {
        _db = db;
        _calendar = calendar;
    }

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

            _db.Donors.Remove(donor);
            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Donor deleted" });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    // ════════════════════════════════════════════════════════
    //  SCHEDULE ENDPOINTS
    // ════════════════════════════════════════════════════════

    [HttpPost("schedules")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateSchedule([FromBody] DonorScheduleDto dto)
    {
        try
        {
            var donor = await _db.Donors.FindAsync(dto.DonorId);
            if (donor == null)
                return NotFound(new ResponseDto { Success = false, Message = "Donor not found" });

            var exists = await _db.DonorSchedules
                .AnyAsync(s => s.DonorId == dto.DonorId && s.Year == dto.Year && s.Month == dto.Month);
            if (exists)
                return BadRequest(new ResponseDto { Success = false, Message = "This donor already has a schedule for that month/year" });

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

    // ════════════════════════════════════════════════════════
    //  MEAL SHEET (skips weekends/holidays via SchoolCalendarService)
    // ════════════════════════════════════════════════════════

    [HttpGet("schedules/{scheduleId}/meal-sheet")]
    public async Task<IActionResult> GetMealSheet(int scheduleId)
    {
        try
        {
            var schedule = await _db.DonorSchedules
                .Include(s => s.Class1).Include(s => s.Class2).Include(s => s.Class3)
                .Include(s => s.Donor)
                .FirstOrDefaultAsync(s => s.Id == scheduleId);

            if (schedule == null)
                return NotFound(new ResponseDto { Success = false, Message = "Schedule not found" });

            var classIds = new[] { schedule.ClassId1, schedule.ClassId2, schedule.ClassId3 }
                .Where(c => c.HasValue).Select(c => c!.Value).ToList();

            var classes = await _db.Classes.Where(c => classIds.Contains(c.Id)).ToListAsync();

            var monthStart = new DateTime(schedule.Year, schedule.Month, 1);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);
            var schoolDayMap = await _calendar.GetSchoolDayMapAsync(monthStart, monthEnd);

            var savedRecords = await _db.DonorMealRecords
                .Where(r => r.ScheduleId == scheduleId)
                .ToListAsync();

            var result = new List<object>();

            for (var date = monthStart; date <= monthEnd; date = date.AddDays(1))
            {
                if (!schoolDayMap[date.Date]) continue; // skip weekends/holidays

                var classRows = new List<object>();

                foreach (var cls in classes)
                {
                    var saved = savedRecords.FirstOrDefault(r => r.RecordDate.Date == date.Date && r.ClassId == cls.Id);
                    var className = $"{cls.ClassName} {cls.Section}".Trim();

                    if (saved != null)
                    {
                        classRows.Add(new {
                            classId = cls.Id, className,
                            maleCount = saved.MaleCount, femaleCount = saved.FemaleCount,
                            totalCount = saved.TotalCount, source = "saved"
                        });
                    }
                    else
                    {
                        var presentStudents = await _db.Attendance
                            .Where(a => a.Date.Date == date.Date && a.Status == "Present" && a.ClassId == cls.Id)
                            .Join(_db.Students, a => a.StudentId, s => s.Id, (a, s) => s)
                            .ToListAsync();

                        int male = presentStudents.Count(s => s.Gender == "Male");
                        int female = presentStudents.Count(s => s.Gender == "Female");

                        classRows.Add(new {
                            classId = cls.Id, className,
                            maleCount = male, femaleCount = female,
                            totalCount = male + female, source = "auto"
                        });
                    }
                }

                result.Add(new { date = date.ToString("yyyy-MM-dd"), classes = classRows });
            }

            return Ok(new
            {
                donorName = schedule.Donor?.Name,
                year = schedule.Year,
                month = schedule.Month,
                days = result
            });
        }
        catch (Exception ex) { return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message }); }
    }

    public class MealDayEntryDto
    {
        public string Date { get; set; } = string.Empty;
        public List<MealClassEntryDto> Classes { get; set; } = new();
    }
    public class MealClassEntryDto
    {
        public int ClassId { get; set; }
        public int MaleCount { get; set; }
        public int FemaleCount { get; set; }
    }

    [HttpPost("schedules/{scheduleId}/meal-sheet")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> SaveMealDay(int scheduleId, [FromBody] MealDayEntryDto entry)
    {
        try
        {
            var date = DateTime.Parse(entry.Date);

            foreach (var c in entry.Classes)
            {
                var existing = await _db.DonorMealRecords.FirstOrDefaultAsync(r =>
                    r.ScheduleId == scheduleId && r.RecordDate.Date == date.Date && r.ClassId == c.ClassId);

                if (existing != null)
                {
                    existing.MaleCount = c.MaleCount;
                    existing.FemaleCount = c.FemaleCount;
                    existing.TotalCount = c.MaleCount + c.FemaleCount;
                    existing.UpdatedAt = DateTime.Now;
                }
                else
                {
                    _db.DonorMealRecords.Add(new DonorMealRecord
                    {
                        ScheduleId = scheduleId,
                        RecordDate = date,
                        ClassId = c.ClassId,
                        MaleCount = c.MaleCount,
                        FemaleCount = c.FemaleCount,
                        TotalCount = c.MaleCount + c.FemaleCount
                    });
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new ResponseDto { Success = true, Message = "Saved" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseDto { Success = false, Message = ex.Message });
        }
    }
}