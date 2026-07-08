using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolManagementAPI.Models;
using SchoolManagementAPI.Models;

public class Donor
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string Name { get; set; } = "";

    [MaxLength(20)]
    public string Phone { get; set; } = "";

    public string? Address { get; set; }

    [MaxLength(20)]
    public string NicNumber { get; set; } = "";

    [MaxLength(10)]
    public string Status { get; set; } = "Active";

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    // Navigation
    public ICollection<DonorSchedule> Schedules { get; set; } = new List<DonorSchedule>();
}