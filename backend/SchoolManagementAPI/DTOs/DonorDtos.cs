namespace SchoolManagementAPI.DTOs;

// ── Create / Update Donor ─────────────────────────────────────
public class DonorDto
{
    public string  Name      { get; set; } = "";
    public string? Phone     { get; set; }
    public string? Address   { get; set; }
    public string? NicNumber { get; set; }
    public string  Status    { get; set; } = "Active";
    public string? Notes     { get; set; }
}

// ── Create / Update Schedule (month assignment + food items) ──
public class DonorScheduleDto
{
    public int     DonorId  { get; set; }
    public int     Year     { get; set; }
    public int     Month    { get; set; }       // 1–12
    public int?    ClassId1 { get; set; }
    public int?    ClassId2 { get; set; }
    public int?    ClassId3 { get; set; }
    public decimal MealRate { get; set; } = 110.00m;
    public string? Notes    { get; set; }

    // Food items submitted with the schedule
    public List<string> FoodItems { get; set; } = new();
}