using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;

public class DonorFoodItem
{
    [Key]
    public int Id { get; set; }

    public int DonorScheduleId { get; set; }

    [ForeignKey("DonorScheduleId")]
    public DonorSchedule? DonorSchedule { get; set; }

    [Required, MaxLength(100)]
    public string FoodItem { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}