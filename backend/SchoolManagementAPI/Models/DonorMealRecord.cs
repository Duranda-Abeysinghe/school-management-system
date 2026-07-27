namespace SchoolManagementAPI.Models;

public class DonorMealRecord
{
    public int Id { get; set; }
    public int ScheduleId { get; set; }
    public DateTime RecordDate { get; set; }
    public int ClassId { get; set; }
    public int MaleCount { get; set; }
    public int FemaleCount { get; set; }
    public int TotalCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    public DonorSchedule? Schedule { get; set; }
    public Class? Class { get; set; }
}