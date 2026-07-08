using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

public class DonorSchedule
{
    [Key]
    public int Id { get; set; }

    public int DonorId { get; set; }

    [ForeignKey("DonorId")]
    public Donor? Donor { get; set; }

    public int Year  { get; set; }   // e.g. 2026
    public int Month { get; set; }   // 1–12

    // Up to 3 classes per donor per month
    public int? ClassId1 { get; set; }
    public int? ClassId2 { get; set; }
    public int? ClassId3 { get; set; }

    [ForeignKey("ClassId1")] public Class? Class1 { get; set; }
    [ForeignKey("ClassId2")] public Class? Class2 { get; set; }
    [ForeignKey("ClassId3")] public Class? Class3 { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal MealRate { get; set; } = 110.00m;  // Rs per student per day

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation
    public ICollection<DonorFoodItem> FoodItems { get; set; } = new List<DonorFoodItem>();
}