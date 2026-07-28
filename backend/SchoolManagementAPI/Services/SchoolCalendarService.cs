using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Data;

namespace SchoolManagementAPI.Services;

public class SchoolCalendarService
{
    private readonly AppDbContext _db;
    public SchoolCalendarService(AppDbContext db) { _db = db; }

    // Returns a dictionary of every date in [start, end] -> isSchoolDay
    public async Task<Dictionary<DateTime, bool>> GetSchoolDayMapAsync(DateTime start, DateTime end)
    {
        var overrides = await _db.SchoolCalendarOverrides
            .Where(o => o.OverrideDate >= start.Date && o.OverrideDate <= end.Date)
            .ToDictionaryAsync(o => o.OverrideDate.Date, o => o.IsSchoolDay);

        var map = new Dictionary<DateTime, bool>();
        for (var d = start.Date; d <= end.Date; d = d.AddDays(1))
        {
            bool defaultValue = d.DayOfWeek != DayOfWeek.Saturday && d.DayOfWeek != DayOfWeek.Sunday;
            map[d] = overrides.TryGetValue(d, out var overridden) ? overridden : defaultValue;
        }
        return map;
    }

    public async Task<bool> IsSchoolDayAsync(DateTime date)
    {
        var o = await _db.SchoolCalendarOverrides.FirstOrDefaultAsync(x => x.OverrideDate.Date == date.Date);
        if (o != null) return o.IsSchoolDay;
        return date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday;
    }
}